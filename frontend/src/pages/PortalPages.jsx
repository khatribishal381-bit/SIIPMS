import { useRef, useState } from 'react'
import { Bell, Check, Download, Search, Star, UploadCloud } from 'lucide-react'
import { Button, Card, StatCard, StatusBadge } from '../components/UI'
import RejectHoursDialog from '../components/RejectHoursDialog'
import { cohortSeed } from '../data/sampleData'

const statusTone = (status) => ({
  Approved: 'green', Submitted: 'green', Accepted: 'green', 'On track': 'green', Open: 'green',
  Pending: 'orange', 'Due soon': 'orange', Shortlisted: 'orange', Offered: 'orange', 'Overdue log': 'orange',
  'Under review': 'blue', 'Not started': 'blue', 'Ready to submit': 'blue', Draft: 'blue',
  Rejected: 'red', Returned: 'red', 'At risk': 'red', Unsuccessful: 'red',
})[status] || 'blue'
const Pill = ({ children, status = children }) => <StatusBadge tone={statusTone(status)}>{children}</StatusBadge>
const Heading = ({ title, description, action }) => <div className="si-section-heading"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</div>
const Empty = ({ children }) => <div className="si-empty">{children}</div>
const fmtDate = (s) => { if (!s) return ''; const d = new Date(`${s}T00:00:00`); return Number.isNaN(d.getTime()) ? s : new Intl.DateTimeFormat('en-AU',{day:'numeric',month:'short',year:'numeric'}).format(d) }
const stat = (label,value,accent) => <StatCard key={label} label={label} value={value} accent={accent} />

function Notifications({ role, notifications }) {
  const relevant = notifications.filter((n) => n.roles.includes(role))
  return <Card><Heading title="Notifications" description="Updates on applications, placement progress and approvals." />
    <div className="si-notification-list">{relevant.map((n) => <article className="si-notification" key={n.id}><div className="si-notification__icon"><Bell size={17}/></div><div><h3>{n.title}</h3><p>{n.message}</p><small>{n.date}</small></div></article>)}</div>
  </Card>
}

function StudentDashboard({ data, actions }) {
  const ownApps = data.applications.filter((a) => a.student === 'Amara Okafor')
  const hours = data.logs.filter((l) => l.student === 'Amara Okafor' && l.status === 'Approved').reduce((t,l) => t+l.hours,35)
  return <>
    <div className="si-stats-grid">{[
      stat('Applications',ownApps.length),stat('Active placement','Nimbus Digital'),stat('Approved hours',`${hours} / 120`),stat('Next due','Progress report'),
    ]}</div>
    <Card className="si-action-card"><div><h2>This week</h2><p className="si-muted">Your mentor has approved hours. Your progress report is due on 28 November.</p></div><Button onClick={() => actions.navigate('logbook')}>Add logbook entry</Button></Card>
    <Card className="si-card-spaced"><Heading title="My placement" description="Nimbus Digital · Junior Software Intern"/><div className="si-detail-grid"><div><small>Academic supervisor</small><strong>Dr James Liu</strong></div><div><small>Industry mentor</small><strong>Priya Sharma</strong></div><div><small>Required hours</small><strong>120</strong></div></div></Card>
  </>
}

function Opportunities({ data, actions }) {
  const [search, setSearch] = useState('')
  const [discipline, setDiscipline] = useState('All disciplines')
  const [location, setLocation] = useState('All locations')
  const openOpportunities = data.opportunities.filter((o) => o.open !== false)
  const disciplines = [...new Set(openOpportunities.map((o) => o.discipline))].sort()
  const locations = [...new Set(openOpportunities.map((o) => o.location))].sort()
  const filtered = openOpportunities.filter((o) =>
    [o.title, o.company, o.description].join(' ').toLowerCase().includes(search.trim().toLowerCase()) &&
    (discipline === 'All disciplines' || o.discipline === discipline) &&
    (location === 'All locations' || o.location === location)
  )
  return <div className="si-stack">
    <div className="si-search-strip">
      <div className="si-search-box"><Search size={17}/><input aria-label="Search internships or projects" placeholder="Search internships or projects" value={search} onChange={(e) => setSearch(e.target.value)}/></div>
      <select aria-label="Discipline" value={discipline} onChange={(e) => setDiscipline(e.target.value)}><option>All disciplines</option>{disciplines.map((d) => <option key={d}>{d}</option>)}</select>
      <select aria-label="Location" value={location} onChange={(e) => setLocation(e.target.value)}><option>All locations</option>{locations.map((l) => <option key={l}>{l}</option>)}</select>
    </div>
    {filtered.length === 0 && <Card><Empty>No matching opportunities found. Try changing your filters.</Empty></Card>}
    {filtered.map((o) => <Card key={o.id} className="si-opportunity">
      <div className="si-opportunity__copy"><div className="si-line"><Pill status="Open">Open</Pill><h2>{o.title} — {o.company}</h2></div><p>{o.location} · {o.duration} · {o.hours} hours · Closes {o.closes}</p><p>{o.description}</p></div>
      <Button onClick={() => { actions.setSelectedOpportunity(o.id); actions.navigate('detail') }}>View &amp; apply</Button>
    </Card>)}
  </div>
}

function OpportunityDetail({ data, actions }) {
  const o = data.opportunities.find((x) => x.id === data.selectedOpportunity)
  if (!o) return <Card><Empty>Opportunity not found.</Empty><Button variant="outline" onClick={() => actions.navigate('opportunities')}>Back to opportunities</Button></Card>
  const submitted = data.applications.find((a) => a.student === 'Amara Okafor' && a.opportunityId === o.id && a.status !== 'Draft')
  return <Card className="si-content-card">
    <Button variant="outline" onClick={() => actions.navigate('opportunities')}>Back to opportunities</Button>
    <div className="si-detail-heading"><Pill status={o.open === false ? 'Not started' : 'Open'}>{o.open === false ? 'Closed' : 'Open'}</Pill><h2>{o.title}</h2><p>{o.company} · {o.location} · {o.type}</p></div>
    <div className="si-detail-grid"><div><small>Duration</small><strong>{o.duration}</strong></div><div><small>Required hours</small><strong>{o.hours}</strong></div><div><small>Closing date</small><strong>{o.closes}</strong></div></div>
    <h3>About this opportunity</h3><p className="si-body-copy">{o.description}</p>
    {submitted ? <div className="si-row-actions"><Pill>{submitted.status}</Pill><Button variant="outline" onClick={() => actions.navigate('applications')}>View my application</Button></div> :
      <Button disabled={o.open === false} onClick={() => actions.navigate('apply')}>{o.open === false ? 'Applications closed' : 'Apply for this opportunity'}</Button>}
  </Card>
}

function StudentApply({ data, actions }) {
  const o = data.opportunities.find((x) => x.id === data.selectedOpportunity)
  const draft = data.applications.find((a) => a.student === 'Amara Okafor' && a.opportunityId === o?.id && a.status === 'Draft')
  const submitted = data.applications.find((a) => a.student === 'Amara Okafor' && a.opportunityId === o?.id && a.status !== 'Draft')
  const [cover, setCover] = useState(draft?.coverStatement ?? '')
  const [error, setError] = useState('')
  if (!o) return <Card><Empty>Opportunity not found.</Empty></Card>

  const save = (status) => {
    if (submitted) { setError('An application for this opportunity has already been submitted.'); return }
    if (o.open === false) { setError('Applications are closed for this opportunity.'); return }
    if (status === 'Under review' && cover.trim().length < 20) {
      setError('Please write at least 20 characters explaining your interest.')
      return
    }
    const today = new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date())
    const record = {
      id: draft?.id ?? `app-${Date.now()}`,
      opportunityId: o.id, title: `${o.company} — ${o.title}`,
      student: 'Amara Okafor', submitted: status === 'Draft' ? '—' : today,
      status, coverStatement: cover.trim(),
    }
    actions.setApplications((prev) => [...prev.filter((a) => !(a.student === record.student && a.opportunityId === o.id && a.status === 'Draft')), record])
    if (status === 'Draft') {
      actions.notify('Application draft saved.')
      actions.navigate('applications')
    } else {
      actions.navigate('confirmation')
    }
  }
  return <Card className="si-form-card">
    <Heading title={`Apply — ${o.company} ${o.type.toLowerCase()}`} description="Complete your application details below."/>
    {submitted ? <div className="si-stack"><p>You already have an application for this opportunity.</p><Pill>{submitted.status}</Pill><Button onClick={() => actions.navigate('applications')}>View my applications</Button></div> :
      <form onSubmit={(e) => { e.preventDefault(); save('Under review') }}>
        <label className="si-form-label" htmlFor="cover-letter">Cover statement</label>
        <textarea id="cover-letter" className="si-form-control si-cover" value={cover} onChange={(e) => { setCover(e.target.value); setError('') }} placeholder="Explain why you are interested in this opportunity and what you can contribute."/>
        {error && <p className="si-field-error" role="alert">{error}</p>}
        <p className="si-form-help">Your profile documents will be available here once the profile and document service is connected.</p>
        <div className="si-row-actions"><Button variant="outline" onClick={() => save('Draft')}>Save draft</Button><Button type="submit">Submit application</Button></div>
      </form>}
  </Card>
}
function Confirmation({ actions }) { return <div className="si-centered"><Card className="si-confirmation"><Pill status="Submitted">Submitted</Pill><h2>Application sent</h2><p>Your application is in the Placement Office queue. You can track its progress under My applications.</p><Button onClick={()=>actions.navigate('applications')}>Track status</Button></Card></div> }
function Applications({ data, actions }) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All statuses')
  const own = data.applications.filter((a) => a.student === 'Amara Okafor')
  const statuses = [...new Set(own.map((a) => a.status))].sort()
  const filtered = own.filter((a) =>
    [a.title, a.status].join(' ').toLowerCase().includes(search.trim().toLowerCase()) &&
    (status === 'All statuses' || a.status === status)
  )
  return <Card className="si-table-card">
    <Heading title="My applications" description="Check your application status or continue a saved draft."/>
    <div className="si-search-strip si-applications-search">
      <div className="si-search-box"><Search size={17}/><input aria-label="Search my applications" placeholder="Search applications" value={search} onChange={(e) => setSearch(e.target.value)}/></div>
      <select aria-label="Application status" value={status} onChange={(e) => setStatus(e.target.value)}><option>All statuses</option>{statuses.map((s) => <option key={s}>{s}</option>)}</select>
    </div>
    {filtered.length === 0 ? <Empty>No applications match your search.</Empty> :
      <div className="si-table-scroll"><table><thead><tr><th>Opportunity</th><th>Submitted</th><th>Status</th><th>Action</th></tr></thead><tbody>{filtered.map((a) => <tr key={a.id}>
        <td>{a.title}</td><td>{a.submitted}</td><td><Pill>{a.status}</Pill></td><td>{a.status === 'Draft' ? <button type="button" className="si-table-action" onClick={() => { actions.setSelectedOpportunity(a.opportunityId); actions.navigate('apply') }}>Continue draft</button> : <span className="si-muted">—</span>}</td>
      </tr>)}</tbody></table></div>}
  </Card>
}

function StudentLogbook({ data, actions }) {
  const [date,setDate]=useState(new Date().toISOString().slice(0,10)), [hours,setHours]=useState('8'), [activity,setActivity]=useState(''),[reflection,setReflection]=useState(''),[error,setError]=useState(''),[editId,setEditId]=useState(null)
  const own=data.logs.filter(x=>x.student==='Amara Okafor')
  const approved=own.filter(x=>x.status==='Approved').reduce((n,x)=>n+x.hours,35)
  const pending=own.filter(x=>x.status==='Pending').reduce((n,x)=>n+x.hours,0)
  const submit=(e)=>{
    e.preventDefault()
    if(!date||Number(hours)<=0||Number(hours)>24||!activity.trim()||!reflection.trim()){setError('Enter a date, 1–24 hours, an activity and a reflection.');return}
    const record={id:editId||`log-${Date.now()}`,student:'Amara Okafor',date,hours:Number(hours),activity:activity.trim(),reflection:reflection.trim(),status:'Pending',comment:''}
    actions.setLogs(prev=>editId?prev.map(x=>x.id===editId?record:x):[record,...prev])
    setActivity('');setReflection('');setError('');setEditId(null);actions.notify('Logbook entry sent for mentor review.')
  }
  return <div className="si-stack"><Card className="si-form-card"><Heading title={editId?'Update returned entry':'New logbook entry'} description="Record the work completed during your placement."/><form onSubmit={submit} className="si-stack"><div className="si-two-fields"><label>Date<input className="si-form-control" type="date" value={date} onChange={e=>setDate(e.target.value)} required/></label><label>Hours<input className="si-form-control" type="number" min="1" max="24" value={hours} onChange={e=>setHours(e.target.value)} required/></label></div><label>Activity<textarea className="si-form-control" value={activity} onChange={e=>setActivity(e.target.value)} placeholder="Describe the work completed" required/></label><label>Reflection<textarea className="si-form-control" value={reflection} onChange={e=>setReflection(e.target.value)} placeholder="What did you learn?" required/></label>{error&&<p className="si-field-error" role="alert">{error}</p>}<div><Button type="submit">{editId?'Resubmit for mentor approval':'Submit for mentor approval'}</Button></div></form></Card>
    <Card><div className="si-log-summary"><strong>{approved} / 120 hours approved</strong><span>Pending {pending} hrs</span><Pill status="Pending">Mentor review</Pill></div><Heading title="Recent entries"/><div className="si-log-list">{own.map(x=><div className="si-log-entry" key={x.id}><div><strong>{fmtDate(x.date)} · {x.hours} hours</strong><p>{x.activity}</p>{x.comment && <p className="si-rejection-comment">Mentor feedback: {x.comment}</p>}</div><div className="si-entry-end"><Pill>{x.status}</Pill>{x.status==='Returned'&&<Button variant="outline" onClick={()=>{setEditId(x.id);setDate(x.date);setHours(String(x.hours));setActivity(x.activity);setReflection(x.reflection);window.scrollTo({top:0,behavior:'smooth'})}}>Edit &amp; resubmit</Button>}</div></div>)}</div></Card>
  </div>
}

function StudentMilestones({ data, actions }) {
  const fileInput=useRef({})
  const own=data.milestones.filter(x=>x.student==='Amara Okafor')
  const chooseFile=(m)=>fileInput.current[m.id]?.click()
  return <Card className="si-table-card"><Heading title="Milestones" description="Track your placement deliverables and submission deadlines."/><div className="si-table-scroll"><table><thead><tr><th>Milestone</th><th>Due</th><th>Status</th><th>Action</th></tr></thead><tbody>{own.map((m,i)=><tr key={m.id}><td>{i+1}. {m.title}{m.file&&<small className="si-file-note">{m.file}</small>}</td><td>{m.due}</td><td><Pill>{m.status}</Pill></td><td><input ref={el=>{fileInput.current[m.id]=el}} type="file" accept=".pdf,.doc,.docx" hidden onChange={e=>{const file=e.target.files?.[0];if(file){actions.setMilestones(prev=>prev.map(x=>x.id===m.id?{...x,file:file.name,status:'Ready to submit'}:x));actions.notify('Document selected. Online submission is not yet connected.')}}}/>{m.status!=='Approved'&&<button type="button" className="si-table-action" onClick={()=>chooseFile(m)}><UploadCloud size={14}/> Select file</button>}</td></tr>)}</tbody></table></div></Card>
}

export function StudentPortal({ page,data,actions }) {
  if(page==='dashboard') return <StudentDashboard data={data} actions={actions}/>
  if(page==='opportunities') return <Opportunities data={data} actions={actions}/>
  if(page==='detail') return <OpportunityDetail data={data} actions={actions}/>
  if(page==='apply') return <StudentApply key={data.selectedOpportunity} data={data} actions={actions}/>
  if(page==='confirmation') return <Confirmation actions={actions}/>
  if(page==='applications') return <Applications data={data} actions={actions}/>
  if(page==='logbook') return <StudentLogbook data={data} actions={actions}/>
  if(page==='milestones') return <StudentMilestones data={data} actions={actions}/>
  return <Notifications role="student" notifications={data.notifications}/>
}

function MentorDashboard({ data,actions }) {
  const pending=data.logs.filter(x=>x.status==='Pending').length
  return <><div className="si-stats-grid">{[stat('Mentees','2'),stat('Hours waiting',String(pending)),stat('Evaluations due',data.evaluation?'0':'1'),stat('This month hours','42')]}</div><Card className="si-action-card"><div><h2>{pending?`You have ${pending} logbook ${pending===1?'entry':'entries'} to approve.`:'Your approval queue is up to date.'}</h2><p className="si-muted">Review entries and give feedback to students.</p></div><Button onClick={()=>actions.navigate('approvals')}>Open approval queue</Button></Card></>
}
function MentorApprovals({data,actions}) {
  const [rejectId,setRejectId]=useState(null)
  const pending=data.logs.filter(x=>x.status==='Pending')
  const reviewed=data.logs.filter(x=>x.status!=='Pending')
  return <div className="si-stack"><Heading title="Pending hours" description="Review submitted work and approve or return entries."/>
    {pending.length===0&&<Card><Empty>No pending logbook entries.</Empty></Card>}
    {pending.map(x=><Card className="si-approval-card" key={x.id}><Heading title={`${x.student} · ${fmtDate(x.date)}`}/><div className="si-log-detail"><strong>{x.hours} hours</strong><span>{x.activity}</span></div><p className="si-muted">{x.reflection}</p><div className="si-row-actions"><Button onClick={()=>{actions.setLogs(prev=>prev.map(l=>l.id===x.id?{...l,status:'Approved'}:l));actions.notify('Logbook hours approved.')}}><Check size={15}/> Approve</Button><Button variant="danger" onClick={()=>setRejectId(x.id)}>Reject</Button></div></Card>)}
    {reviewed.length>0&&<Card><Heading title="Reviewed entries"/><div className="si-log-list">{reviewed.map(x=><div className="si-log-entry" key={x.id}><div><strong>{x.student} · {fmtDate(x.date)} · {x.hours} hrs</strong><p>{x.activity}</p></div><Pill status={x.status}>{x.status}</Pill></div>)}</div></Card>}
    {rejectId&&<RejectHoursDialog onClose={()=>setRejectId(null)} onReject={comment=>{actions.setLogs(prev=>prev.map(x=>x.id===rejectId?{...x,status:'Returned',comment}:x));setRejectId(null);actions.notify('Entry returned to student with feedback.')}}/>}
  </div>
}
function MentorEvaluation({data,actions}) {
  const criteria=['Technical Capabilities','Communication Skills','Professionalism','Teamwork & Collaboration']
  const [scores,setScores]=useState(data.evaluation?.scores||[4,5,4,4]); const [comment,setComment]=useState(data.evaluation?.comment||'');const [error,setError]=useState('')
  return <Card className="si-evaluation-card"><Heading title="Final evaluation — Amara Okafor" description="Nimbus Digital Internship · Technical Track"/><h3 className="si-subheading">Core competencies</h3>{criteria.map((c,i)=><div className="si-rating-row" key={c}><span>{c}</span><div role="group" aria-label={`${c} rating`}>{[1,2,3,4,5].map(n=><button key={n} type="button" aria-label={`${n} stars`} aria-pressed={scores[i]===n} className="si-star" onClick={()=>setScores(prev=>prev.map((v,j)=>j===i?n:v))}><Star size={19} fill={n<=scores[i]?'#f59e0b':'none'} color={n<=scores[i]?'#f59e0b':'#b6c1d2'}/></button>)}</div></div>)}<label className="si-form-label" htmlFor="evaluation-comments">Written feedback / comments</label><textarea className="si-form-control" id="evaluation-comments" value={comment} onChange={e=>{setComment(e.target.value);setError('')}} placeholder="Describe the student's strengths and areas for improvement"/>{error&&<p className="si-field-error">{error}</p>}<div className="si-row-actions si-align-right"><Button variant="outline" onClick={()=>actions.navigate('dashboard')}>Cancel</Button><Button onClick={()=>{if(!comment.trim()){setError('Enter written feedback before submitting.');return}actions.setEvaluation({scores,comment,submitted:true});actions.notify('Evaluation completed in this session.')}}>{data.evaluation?'Update evaluation':'Submit evaluation'}</Button></div></Card>
}
export function MentorPortal({page,data,actions}) {
  if(page==='dashboard')return <MentorDashboard data={data} actions={actions}/>
  if(page==='approvals')return <MentorApprovals data={data} actions={actions}/>
  if(page==='evaluation')return <MentorEvaluation data={data} actions={actions}/>
  return <Notifications role="mentor" notifications={data.notifications}/>
}

function SupervisorDashboard({data,actions}) {
  const awaiting=data.milestones.filter(x=>x.status==='Ready to submit').length
  return <><div className="si-stats-grid">{[stat('My students','18'),stat('At risk','3','red'),stat('Overdue logs','5','orange'),stat('Milestones to review',String(4+awaiting))]}</div><Card className="si-action-card"><div><h2>Early intervention</h2><p className="si-muted">Review overdue logs and identify students who may need support.</p></div><Button onClick={()=>actions.navigate('cohort')}>Open cohort</Button></Card></>
}
function SupervisorCohort({actions}) {
  const [query,setQuery]=useState('')
  const filtered=cohortSeed.filter(x=>[x.name,x.company,x.flag].join(' ').toLowerCase().includes(query.toLowerCase()))
  return <Card className="si-table-card"><Heading title="Cohort Progress" description="Monitor active internship milestones and logbooks for your student cohort." action={<div className="si-search-box si-search-compact"><Search size={16}/><input aria-label="Search cohort" placeholder="Search students" value={query} onChange={e=>setQuery(e.target.value)}/></div>}/><div className="si-table-scroll"><table><thead><tr><th>Student</th><th>Host placement</th><th>Hours completed</th><th>Last log date</th><th>Cohort flag</th><th>Action</th></tr></thead><tbody>{filtered.map(x=><tr key={x.name}><td><strong>{x.name}</strong></td><td>{x.company}</td><td>{x.hours}</td><td>{x.lastLog}</td><td><Pill>{x.flag}</Pill></td><td><Button variant="outline" onClick={()=>{actions.setSelectedStudent(x.name);actions.navigate('review-logs')}}>Review logs</Button></td></tr>)}</tbody></table></div></Card>
}
function SupervisorLogs({data,actions}) {
  const list=data.logs.filter(x=>x.student===data.selectedStudent)
  return <Card><Heading title={`Logbook — ${data.selectedStudent}`} description="Placement activity and mentor approval status." action={<Button variant="outline" onClick={()=>actions.navigate('cohort')}>Back to cohort</Button>}/>{list.length===0?<Empty>No logbook entries recorded for this student.</Empty>:<div className="si-log-list">{list.map(x=><div className="si-log-entry" key={x.id}><div><strong>{fmtDate(x.date)} · {x.hours} hours</strong><p>{x.activity}</p><p>{x.reflection}</p></div><Pill>{x.status}</Pill></div>)}</div>}</Card>
}
function SupervisorMilestones({data,actions}) {
  return <Card className="si-table-card"><Heading title="Milestone review" description="Check submitted deliverables and record an outcome."/><div className="si-table-scroll"><table><thead><tr><th>Student</th><th>Milestone</th><th>Due</th><th>Status</th><th>Action</th></tr></thead><tbody>{data.milestones.map(m=><tr key={m.id}><td>{m.student}</td><td>{m.title}</td><td>{m.due}</td><td><Pill>{m.status}</Pill></td><td>{m.status==='Ready to submit'?<div className="si-row-actions"><Button onClick={()=>{actions.setMilestones(prev=>prev.map(x=>x.id===m.id?{...x,status:'Approved'}:x));actions.notify('Milestone marked approved in this session.')}}>Approve</Button><Button variant="outline" onClick={()=>{actions.setMilestones(prev=>prev.map(x=>x.id===m.id?{...x,status:'Returned'}:x));actions.notify('Milestone returned for changes.')}}>Return</Button></div>:'—'}</td></tr>)}</tbody></table></div></Card>
}
export function SupervisorPortal({page,data,actions}) {
  if(page==='dashboard')return <SupervisorDashboard data={data} actions={actions}/>
  if(page==='cohort')return <SupervisorCohort actions={actions}/>
  if(page==='review-logs')return <SupervisorLogs data={data} actions={actions}/>
  if(page==='milestone-review')return <SupervisorMilestones data={data} actions={actions}/>
  return <Notifications role="supervisor" notifications={data.notifications}/>
}

function AdminDashboard({data,actions}) {
  const active=61+data.allocations.length
  return <><div className="si-stats-grid">{[stat('Open opportunities',data.opportunities.filter(x=>x.open).length),stat('Unplaced students','27'),stat('Active placements',String(active)),stat('At risk','6','red')]}</div><Card className="si-card-spaced"><Heading title="Semester snapshot" description="Current placement pipeline and cohort progress." action={<Button variant="outline" onClick={()=>actions.navigate('reports')}>Generate report</Button>}/><div className="si-stats-inline"><div><small>Students placed</small><strong>{active}</strong><span>Current semester</span></div><div><small>Matching pipeline</small><strong>27</strong><span>Under review / Offered</span></div><div><small>At risk cohort</small><strong className="si-text--red">6</strong><span>Needs follow-up</span></div><div><small>Open opportunities</small><strong>{data.opportunities.filter(x=>x.open).length}</strong><span>Available to students</span></div></div></Card></>
}
function AdminApplications({data,actions}) {
  const [query,setQuery]=useState('')
  const list=data.applications.filter(x=>[x.student,x.title,x.status].join(' ').toLowerCase().includes(query.toLowerCase()))
  const update=(id,status)=>{actions.setApplications(prev=>prev.map(x=>x.id===id?{...x,status}:x));actions.notify(`Application status updated to ${status}.`)}
  return <Card className="si-table-card"><Heading title="Application pipeline" description="Track pending applications, review candidates, and manage allocations." action={<div className="si-search-box si-search-compact"><Search size={16}/><input aria-label="Search applications" value={query} placeholder="Search applications" onChange={e=>setQuery(e.target.value)}/></div>}/><div className="si-table-scroll"><table><thead><tr><th>Student</th><th>Opportunity</th><th>Application status</th><th>Action</th></tr></thead><tbody>{list.map(x=><tr key={x.id}><td><strong>{x.student}</strong></td><td>{x.title}</td><td><Pill>{x.status}</Pill></td><td>{x.status==='Under review'?<Button variant="outline" onClick={()=>update(x.id,'Shortlisted')}>Shortlist</Button>:x.status==='Shortlisted'?<Button onClick={()=>update(x.id,'Accepted')}>Accept</Button>:x.status==='Accepted'?<Button onClick={()=>{actions.setSelectedStudent(x.student);actions.navigate('allocation')}}>Allocate</Button>:x.status==='Offered'?<Button variant="outline" onClick={()=>actions.notify('Follow-up recorded for the placement team.')}>Remind</Button>:<span className="si-muted">—</span>}</td></tr>)}</tbody></table></div></Card>
}
function AdminAllocate({data,actions}) {
  const [student,setStudent]=useState(data.selectedStudent||'Chen Wei');const [supervisor,setSupervisor]=useState('Dr James Liu');const [mentor,setMentor]=useState('Priya Sharma — Nimbus Digital');const [start,setStart]=useState('2026-11-23');const [end,setEnd]=useState('2027-02-12');const [hours,setHours]=useState('120');const [error,setError]=useState('')
  const submit=(e)=>{e.preventDefault();if(!student||!supervisor||!mentor||!start||!end||end<start||Number(hours)<=0){setError('Check the dates, required hours and assignment details.');return}actions.setAllocations(prev=>[...prev,{student,supervisor,mentor,start,end,hours:Number(hours)}]);actions.notify(`Placement created for ${student} in this session.`);actions.navigate('dashboard')}
  return <Card className="si-form-card si-allocation"><Heading title={`Allocate placement — ${student}`} description="Match the student to a supervisor and industry mentor."/><form onSubmit={submit} className="si-stack"><div className="si-two-fields"><label>Student<select className="si-form-control" value={student} onChange={e=>setStudent(e.target.value)}><option>Chen Wei</option><option>Amara Okafor</option><option>Sara Ahmed</option></select></label><label>Academic supervisor<select className="si-form-control" value={supervisor} onChange={e=>setSupervisor(e.target.value)}><option>Dr James Liu</option><option>Dr Emily Tan</option></select></label><label>Industry mentor<select className="si-form-control" value={mentor} onChange={e=>setMentor(e.target.value)}><option>Priya Sharma — Nimbus Digital</option><option>Alex Morgan — CityTech Labs</option></select></label><label>Total required hours<input className="si-form-control" type="number" min="1" value={hours} onChange={e=>setHours(e.target.value)}/></label><label>Start date<input className="si-form-control" type="date" value={start} onChange={e=>setStart(e.target.value)}/></label><label>End date<input className="si-form-control" type="date" min={start} value={end} onChange={e=>setEnd(e.target.value)}/></label></div>{error&&<p className="si-field-error">{error}</p>}<div className="si-row-actions si-align-right"><Button variant="outline" onClick={()=>actions.navigate('applications')}>Discard draft</Button><Button type="submit">Create placement</Button></div></form></Card>
}
function AdminOpportunities({data,actions}) {
  const [adding,setAdding]=useState(false);const [title,setTitle]=useState('');const [company,setCompany]=useState('');const [discipline,setDiscipline]=useState('Software');const [location,setLocation]=useState('Sydney');const [description,setDescription]=useState('');const [error,setError]=useState('')
  const save=(e)=>{e.preventDefault();if(!title.trim()||!company.trim()||!description.trim()){setError('Enter a title, organisation and description.');return}actions.setOpportunities(prev=>[{id:`opp-${Date.now()}`,title,company,discipline,location,type:'Internship',duration:'12 weeks',hours:120,closes:'31 Dec 2026',description,open:true},...prev]);setAdding(false);setTitle('');setCompany('');setDescription('');setError('');actions.notify('Opportunity added to the catalogue for this session.')}
  return <div className="si-stack"><Card><Heading title="Manage opportunities" description="Review open internships and industry projects." action={<Button onClick={()=>setAdding(v=>!v)}>{adding?'Close form':'Add opportunity'}</Button>}/>{adding&&<form className="si-stack si-add-opportunity" onSubmit={save}><div className="si-two-fields"><label>Opportunity title<input className="si-form-control" value={title} onChange={e=>setTitle(e.target.value)}/></label><label>Host organisation<input className="si-form-control" value={company} onChange={e=>setCompany(e.target.value)}/></label><label>Discipline<select className="si-form-control" value={discipline} onChange={e=>setDiscipline(e.target.value)}><option>Software</option><option>Data</option><option>Business</option></select></label><label>Location<select className="si-form-control" value={location} onChange={e=>setLocation(e.target.value)}><option>Sydney</option><option>Hybrid</option></select></label></div><label>Description<textarea className="si-form-control" value={description} onChange={e=>setDescription(e.target.value)}/></label>{error&&<p className="si-field-error">{error}</p>}<div><Button type="submit">Save opportunity</Button></div></form>}</Card><Card className="si-table-card"><div className="si-table-scroll"><table><thead><tr><th>Opportunity</th><th>Discipline</th><th>Location</th><th>Status</th><th>Action</th></tr></thead><tbody>{data.opportunities.map(o=><tr key={o.id}><td><strong>{o.title}</strong><small className="si-file-note">{o.company}</small></td><td>{o.discipline}</td><td>{o.location}</td><td><Pill status={o.open?'Open':'Not started'}>{o.open?'Open':'Closed'}</Pill></td><td><Button variant="outline" onClick={()=>actions.setOpportunities(prev=>prev.map(x=>x.id===o.id?{...x,open:!x.open}:x))}>{o.open?'Close':'Reopen'}</Button></td></tr>)}</tbody></table></div></Card></div>
}
function AdminReports({data,actions}) {
  const download=()=>{
    const rows=[['Student','Opportunity','Status','Submitted'],...data.applications.map(x=>[x.student,x.title,x.status,x.submitted])]
    const csv=rows.map(row=>row.map(x=>'"'+String(x).replaceAll('"','""')+'"').join(',')).join('\r\n')
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}))
    const a=document.createElement('a');a.href=url;a.download='siipms-applications.csv';a.click();URL.revokeObjectURL(url)
    actions.notify('Application report exported.')
  }
  return <Card><Heading title="Placement reports" description="Current semester application and placement overview." action={<Button onClick={download}><Download size={16}/> Export applications CSV</Button>}/><div className="si-stats-grid">{[stat('Applications',data.applications.length),stat('Active placements',61+data.allocations.length),stat('Open opportunities',data.opportunities.filter(x=>x.open).length),stat('At risk','6','red')]}</div><div className="si-report-detail"><h3>Application status distribution</h3>{[...new Set(data.applications.map(x=>x.status))].map(s=><div key={s} className="si-report-row"><span>{s}</span><strong>{data.applications.filter(x=>x.status===s).length}</strong></div>)}</div></Card>
}
export function AdminPortal({page,data,actions}) {
  if(page==='dashboard')return <AdminDashboard data={data} actions={actions}/>
  if(page==='applications')return <AdminApplications data={data} actions={actions}/>
  if(page==='allocation')return <AdminAllocate data={data} actions={actions}/>
  if(page==='opportunities')return <AdminOpportunities data={data} actions={actions}/>
  if(page==='reports')return <AdminReports data={data} actions={actions}/>
  return <Notifications role="admin" notifications={data.notifications}/>
}
