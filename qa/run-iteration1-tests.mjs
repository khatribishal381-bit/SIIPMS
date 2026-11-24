// SIIPMS ICT308 Iteration 1 integration checks. QA ownership: Sunir Sunir.
// Run while the backend is running. Uses only built-in Node.js modules.
// Creates uniquely named test records in the local development database.
import { randomBytes, randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = dirname(fileURLToPath(import.meta.url))
const outputDir = join(root, 'evidence')
const base = (process.env.QA_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '')
const runId = randomUUID().slice(0, 8)
const randomPassword = () => randomBytes(30).toString('base64url')
const student = { email: `qa-student-${runId}@example.test`, password: randomPassword(), fullName: `QA Test Student ${runId}` }
const cases = [], passed = new Set()
let studentSession, adminSession, mentorSession, otherMentorSession
let opportunity, application, placement, logbook, mentor, supervisor

function assert(ok, message) { if (!ok) throw new Error(message) }
function status(result, code, title) {
  // Responses may include session tokens or private user details. Log only the HTTP status and safe error text.
  const safeError = typeof result.data?.error === 'string' ? `; ${result.data.error.slice(0, 80)}` : ''
  assert(result.status === code, `${title}: expected HTTP ${code}, got ${result.status}${safeError}`)
  return result.data
}
function sessionOf(result) {
  const raw = result.headers.get('set-cookie') || ''
  const cookie = raw.split(';')[0]
  assert(cookie.startsWith('siipms_session='), 'Session cookie not returned')
  assert(typeof result.data.csrfToken === 'string' && result.data.csrfToken.length > 15, 'CSRF token not returned')
  return { cookie, csrf: result.data.csrfToken }
}
async function api(path, { method = 'GET', body, session, csrf = true, origin } = {}) {
  const headers = {}
  if (body !== undefined) headers['content-type'] = 'application/json'
  if (session?.cookie) headers.cookie = session.cookie
  if (session && csrf && !['GET', 'HEAD'].includes(method)) headers['x-csrf-token'] = session.csrf
  if (origin) headers.origin = origin
  const response = await fetch(`${base}${path}`, {
    method, headers, body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(12000),
  })
  const text = await response.text()
  let data
  try { data = JSON.parse(text) } catch { data = { raw: text.slice(0, 300) } }
  return { status: response.status, data, headers: response.headers }
}
async function check(id, description, fn, dependencies = []) {
  const missing = dependencies.filter(x => !passed.has(x))
  if (missing.length) {
    cases.push({ id, description, result: 'SKIP', detail: `Depends on ${missing.join(', ')}` })
    console.log(`[SKIP] ${id}: ${description} (prerequisite failed)`)
    return
  }
  const start = Date.now()
  try {
    await fn()
    cases.push({ id, description, result: 'PASS', durationMs: Date.now() - start })
    passed.add(id)
    console.log(`[PASS] ${id}: ${description}`)
  } catch (error) {
    // Avoid exposing cookies or request bodies in test logs.
    const detail = String(error?.message || error).slice(0, 260)
    cases.push({ id, description, result: 'FAIL', detail, durationMs: Date.now() - start })
    console.error(`[FAIL] ${id}: ${description} — ${detail}`)
  }
}

await check('QA-01', 'Health endpoint', async () => {
  assert(status(await api('/health'), 200, 'Health').status === 'ok', 'Health status not ok')
})
await check('QA-02', 'Unauthenticated user cannot read session', async () => {
  status(await api('/auth/me'), 401, 'No session')
}, ['QA-01'])
await check('QA-03', 'Short passwords are rejected during registration', async () => {
  status(await api('/auth/register', { method: 'POST', body: { ...student, password: 'short' } }), 400, 'Weak password')
}, ['QA-01'])
await check('QA-04', 'Public registration always creates student role', async () => {
  const r = await api('/auth/register', { method: 'POST', body: { ...student, role: 'PLACEMENT_ADMIN' } })
  assert(status(r, 201, 'Register').user.role === 'STUDENT', 'Role escalation via public registration')
  studentSession = sessionOf(r)
}, ['QA-01'])
await check('QA-05', 'Wrong password is rejected', async () => {
  status(await api('/auth/login', { method: 'POST', body: { email: student.email, password: randomPassword() } }), 401, 'Wrong password')
}, ['QA-04'])
await check('QA-06', 'Login returns a valid session and the correct user', async () => {
  const r = await api('/auth/login', { method: 'POST', body: { email: student.email, password: student.password } })
  assert(status(r, 200, 'Login').user.email === student.email, 'Wrong user returned')
  studentSession = sessionOf(r)
  const me = status(await api('/auth/me', { session: studentSession }), 200, 'Me')
  assert(me.user.email === student.email, 'Session user mismatch')
}, ['QA-04'])
await check('QA-07', 'Student cannot view admin user list', async () => {
  status(await api('/users', { session: studentSession }), 403, 'Admin list')
}, ['QA-06'])
await check('QA-08', 'Logout without CSRF token is blocked', async () => {
  status(await api('/auth/logout', { method: 'POST', session: studentSession, csrf: false }), 403, 'Missing CSRF')
}, ['QA-06'])
await check('QA-09', 'Requests from an unexpected browser origin are blocked', async () => {
  status(await api('/auth/logout', { method: 'POST', session: studentSession, origin: 'https://other.example.test' }), 403, 'Origin check')
}, ['QA-06'])
await check('QA-10', 'Student can read published opportunity listing', async () => {
  const data = status(await api('/opportunities', { session: studentSession }), 200, 'Opportunity list')
  assert(Array.isArray(data), 'Expected opportunity array')
}, ['QA-06'])
await check('QA-11', 'Student cannot create opportunities', async () => {
  status(await api('/opportunities', { method: 'POST', session: studentSession, body: { title: 'No permission', description: 'Not allowed to create this', organizationName: 'Test Org' } }), 403, 'Create opportunity')
}, ['QA-06'])
await check('QA-12', 'Student cannot create a log for an unowned placement', async () => {
  status(await api('/logbooks', { method: 'POST', session: studentSession, body: { placementId: randomUUID(), entryDate: new Date().toISOString(), hours: 8, activity: 'QA testing', reflection: '' } }), 404, 'Unowned placement')
}, ['QA-06'])
await check('QA-13', 'Logout clears browser cookie and ends browser session', async () => {
  const logout = await api('/auth/logout', { method: 'POST', session: studentSession })
  status(logout, 200, 'Logout')
  // Node fetch is not a browser cookie jar. Verify that the server instructs a browser
  // to expire the cookie, then simulate the next request after the browser removes it.
  const directives = (logout.headers.get('set-cookie') || '').split(';').map(x => x.trim())
  assert(directives[0]?.startsWith('siipms_session='), 'Logout did not clear the session cookie')
  assert(directives.some(x => /^path=\/api$/i.test(x)), 'Logout cleared a different cookie path')
  const expired = directives.some(x => {
    if (/^max-age=0$/i.test(x)) return true
    if (/^expires=/i.test(x)) {
      const timestamp = Date.parse(x.slice('expires='.length))
      return Number.isFinite(timestamp) && timestamp <= Date.now()
    }
    return false
  })
  assert(expired, 'Logout did not expire the browser session cookie')
  // The browser would now have deleted this cookie. Re-sending the captured JWT
  // instead would be a separate token-revocation test, which stateless JWT cannot pass.
  studentSession = undefined
  status(await api('/auth/me'), 401, 'Session after browser clears cookie')
}, ['QA-06'])

// Full workflow requires a pre-existing test administrator. Never store credentials in source or reports.
const adminConfigured = Boolean(process.env.QA_ADMIN_EMAIL && process.env.QA_ADMIN_PASSWORD)
if (!adminConfigured) {
  console.log('\n[INFO] Full admin/mentor workflow skipped. Set QA_ADMIN_EMAIL and QA_ADMIN_PASSWORD to include it.')
  cases.push({ id: 'QA-20–QA-44', description: 'Administrator/application/mentor workflow', result: 'SKIP', detail: 'No test admin credentials configured' })
} else {
  await check('QA-20', 'Administrator login', async () => {
    const r = await api('/auth/login', { method: 'POST', body: { email: process.env.QA_ADMIN_EMAIL, password: process.env.QA_ADMIN_PASSWORD } })
    assert(status(r, 200, 'Admin login').user.role === 'PLACEMENT_ADMIN', 'Not an admin account')
    adminSession = sessionOf(r)
    const studentLogin = await api('/auth/login', { method: 'POST', body: { email: student.email, password: student.password } })
    status(studentLogin, 200, 'Student login after logout')
    studentSession = sessionOf(studentLogin)
  }, ['QA-13'])
  await check('QA-21', 'Administrator creates published opportunity', async () => {
    opportunity = status(await api('/opportunities', { method: 'POST', session: adminSession, body: {
      title: `QA Internship ${runId}`, description: 'Autogenerated QA project test opportunity for SIIPMS',
      organizationName: `QA Partner ${runId}`, status: 'PUBLISHED', totalHours: 120,
    } }), 201, 'Admin opportunity')
    assert(opportunity.id, 'Opportunity ID missing')
  }, ['QA-20'])
  await check('QA-22', 'Student can see published opportunity', async () => {
    const list = status(await api('/opportunities', { session: studentSession, }), 200, 'Student opportunity list')
    assert(list.some(x => x.id === opportunity.id), 'Published opportunity not found')
  }, ['QA-21'])
  await check('QA-23', 'Student creates application draft', async () => {
    application = status(await api('/applications', { method: 'POST', session: studentSession, body: {
      opportunityId: opportunity.id, coverStatement: 'Short',
    } }), 201, 'Draft application')
    assert(application.status === 'DRAFT', 'Application not a draft')
  }, ['QA-21'])
  await check('QA-24', 'Duplicate application is rejected', async () => {
    status(await api('/applications', { method: 'POST', session: studentSession, body: { opportunityId: opportunity.id, coverStatement: 'Duplicate' } }), 409, 'Duplicate application')
  }, ['QA-23'])
  await check('QA-25', 'Short cover statement cannot be submitted', async () => {
    status(await api(`/applications/${application.id}/submit`, { method: 'POST', session: studentSession }), 400, 'Short statement')
  }, ['QA-23'])
  await check('QA-26', 'Student can edit a draft application', async () => {
    const x = status(await api(`/applications/${application.id}`, { method: 'PATCH', session: studentSession, body: { coverStatement: 'This is a complete QA application statement.' } }), 200, 'Edit draft')
    assert(x.coverStatement.length > 10, 'Draft was not updated')
  }, ['QA-23'])
  await check('QA-27', 'Student submits a valid application', async () => {
    const x = status(await api(`/applications/${application.id}/submit`, { method: 'POST', session: studentSession }), 200, 'Submit application')
    assert(x.status === 'SUBMITTED', 'Application not submitted')
  }, ['QA-26'])
  await check('QA-28', 'Resubmitting an application is blocked', async () => {
    status(await api(`/applications/${application.id}/submit`, { method: 'POST', session: studentSession }), 409, 'Duplicate submit')
  }, ['QA-27'])
  await check('QA-29', 'Student cannot change application status as admin', async () => {
    status(await api(`/applications/${application.id}/status`, { method: 'PATCH', session: studentSession, body: { status: 'ACCEPTED' } }), 403, 'Student admin status')
  }, ['QA-27'])
  await check('QA-30', 'Admin cannot skip required status transitions', async () => {
    status(await api(`/applications/${application.id}/status`, { method: 'PATCH', session: adminSession, body: { status: 'ACCEPTED' } }), 409, 'Invalid status')
  }, ['QA-27'])
  const transitions = [['QA-31', 'UNDER_REVIEW', 'QA-27'], ['QA-32', 'SHORTLISTED', 'QA-31'], ['QA-33', 'OFFERED', 'QA-32'], ['QA-34', 'ACCEPTED', 'QA-33']]
  for (const [id, to, prerequisite] of transitions) {
    await check(id, `Administrator transitions application to ${to}`, async () => {
      const x = status(await api(`/applications/${application.id}/status`, { method: 'PATCH', session: adminSession, body: { status: to } }), 200, 'Application status')
      assert(x.status === to, `Expected ${to}`)
    }, [prerequisite])
  }
  await check('QA-35', 'Admin provisions supervisor, assigned mentor and other mentor', async () => {
    const create = async (role, label) => {
      const cred = { email: `qa-${label}-${runId}@example.test`, fullName: `QA ${label} ${runId}`, password: randomPassword(), role }
      const user = status(await api('/users', { method: 'POST', session: adminSession, body: cred }), 201, 'Create user')
      const login = await api('/auth/login', { method: 'POST', body: { email: cred.email, password: cred.password } })
      status(login, 200, 'Created user login')
      return { user, session: sessionOf(login) }
    }
    supervisor = (await create('ACADEMIC_SUPERVISOR', 'supervisor')).user
    const assigned = await create('INDUSTRY_MENTOR', 'mentor')
    mentor = assigned.user; mentorSession = assigned.session
    otherMentorSession = (await create('INDUSTRY_MENTOR', 'othermentor')).session
  }, ['QA-20'])
  await check('QA-36', 'Admin allocates placement for accepted application', async () => {
    placement = status(await api('/placements', { method: 'POST', session: adminSession, body: {
      applicationId: application.id, supervisorId: supervisor.id, mentorId: mentor.id,
      startDate: '2026-11-01T00:00:00.000Z', endDate: '2027-02-01T00:00:00.000Z', requiredHours: 120,
    } }), 201, 'Create placement')
    assert(placement.id, 'Placement ID missing')
  }, ['QA-34', 'QA-35'])
  await check('QA-37', 'Logbook entry above ten hours is rejected', async () => {
    status(await api('/logbooks', { method: 'POST', session: studentSession, body: { placementId: placement.id, entryDate: new Date().toISOString(), hours: 11, activity: 'Testing' } }), 400, 'Invalid hours')
  }, ['QA-36'])
  await check('QA-38', 'Student submits valid logbook hours', async () => {
    logbook = status(await api('/logbooks', { method: 'POST', session: studentSession, body: { placementId: placement.id, entryDate: new Date().toISOString(), hours: 8, activity: 'Testing API workflows' } }), 201, 'Create log')
    assert(logbook.status === 'PENDING', 'Expected pending log')
  }, ['QA-36'])
  await check('QA-39', 'Mentor cannot review an unrelated placement', async () => {
    status(await api(`/logbooks/${logbook.id}/review`, { method: 'POST', session: otherMentorSession, body: { decision: 'APPROVED' } }), 404, 'Unrelated mentor')
  }, ['QA-38'])
  await check('QA-40', 'Returning hours without a comment fails', async () => {
    status(await api(`/logbooks/${logbook.id}/review`, { method: 'POST', session: mentorSession, body: { decision: 'RETURNED', comment: '   ' } }), 400, 'Return without comment')
  }, ['QA-38'])
  await check('QA-41', 'Assigned mentor returns hours with a comment', async () => {
    const x = status(await api(`/logbooks/${logbook.id}/review`, { method: 'POST', session: mentorSession, body: { decision: 'RETURNED', comment: 'Please clarify activities' } }), 200, 'Return hours')
    assert(x.status === 'RETURNED', 'Hours not returned')
  }, ['QA-40'])
  await check('QA-42', 'Student edits returned entry and resubmits', async () => {
    const x = status(await api(`/logbooks/${logbook.id}`, { method: 'PATCH', session: studentSession, body: { entryDate: new Date().toISOString(), hours: 7.5, activity: 'Clarified activity details', reflection: 'Review incorporated' } }), 200, 'Edit returned entry')
    assert(x.status === 'PENDING', 'Returned log not reset to pending')
  }, ['QA-41'])
  await check('QA-43', 'Assigned mentor approves resubmitted hours', async () => {
    const x = status(await api(`/logbooks/${logbook.id}/review`, { method: 'POST', session: mentorSession, body: { decision: 'APPROVED' } }), 200, 'Approve log')
    assert(x.status === 'APPROVED', 'Log not approved')
  }, ['QA-42'])
  await check('QA-44', 'Student cannot edit approved hours', async () => {
    status(await api(`/logbooks/${logbook.id}`, { method: 'PATCH', session: studentSession, body: { entryDate: new Date().toISOString(), hours: 8, activity: 'Not allowed edit', reflection: '' } }), 409, 'Edit approved')
  }, ['QA-43'])
}

await mkdir(outputDir, { recursive: true })
const counts = { PASS: 0, FAIL: 0, SKIP: 0 }
for (const item of cases) counts[item.result]++
const summary = {
  project: 'SIIPMS', assessment: 'ICT308 Iteration 1', runAt: new Date().toISOString(),
  baseUrl: base, runId, ...counts, total: cases.length, cases,
  note: 'These are live API checks. The frontend remains separate from backend API data. Test records remain in the local dev database.',
}
await writeFile(join(outputDir, 'api-results.json'), JSON.stringify(summary, null, 2) + '\n')
const markdown = [
  '# SIIPMS Iteration 1 — API Test Results',
  '', `Execution date: ${summary.runAt}`, `Base URL: ${base}`, `Run: ${runId}`,
  '', `**Passed:** ${counts.PASS} | **Failed:** ${counts.FAIL} | **Skipped:** ${counts.SKIP}`,
  '', '| Case | Test | Result |', '|---|---|---|',
  ...cases.map(item => `| ${item.id} | ${item.description.replaceAll('|', '/')} | ${item.result} |`),
  '', 'Test data is added to the local development database and is not automatically removed.',
  'A PASS means this automated check passed, not that the entire system is production ready.',
  'The React frontend currently uses demonstration data rather than live API persistence.',
  '',
].join('\n')
await writeFile(join(outputDir, 'api-results.md'), markdown)
console.log(`\nTOTAL: ${counts.PASS} passed, ${counts.FAIL} failed, ${counts.SKIP} skipped`)
console.log(`Evidence: ${join(outputDir, 'api-results.md')}`)
if (counts.FAIL > 0) process.exitCode = 1
