# SIIPMS Iteration 1 Backend — Safal Poudel

## Scope

This implementation extends the existing Express + Prisma + PostgreSQL foundation. It provides:

- Student-only self-registration, login, `/api/auth/me`, logout; bcrypt password hashing and short-lived JWT in httpOnly cookies.
- Database-backed authentication with role checks and record-ownership checks; five-attempt lockout for fifteen minutes.
- Session-specific CSRF tokens returned by `/api/auth/login` and `/api/auth/me`. Include `X-CSRF-Token` for authenticated requests that write data.
- Admin provisioning and opportunity creation; student application drafts and submission; admin status transitions with history.
- Admin placement allocation; student logbook entries; assigned mentor approval/return with mandatory comment on returns.
- Simple unit tests for key business rules.

## Run locally

From `E:\SIIPMS\backend` after installer and migration:

```powershell
npm run test
npm run dev
```

`GET http://localhost:5000/api/health` must return `status: ok`.

To create the first admin account, set a *temporary* `SIIPMS_ADMIN_PASSWORD` environment variable in your local PowerShell session with a strong 12+ character password, then run `npm run create:admin -- your-admin@example.com`. Clear the temporary variable afterwards. Never commit credentials.

## Endpoint overview

| Method | Endpoint | Role |
|---|---|---|
| POST | /api/auth/register | Public (creates STUDENT only) |
| POST | /api/auth/login | Public |
| GET | /api/auth/me | Any signed-in role |
| POST | /api/auth/logout | Any signed-in role + CSRF |
| GET | /api/users | Admin |
| POST | /api/users | Admin + CSRF |
| GET | /api/opportunities | Signed-in roles (published for non-admin) |
| POST | /api/opportunities | Admin + CSRF |
| GET | /api/applications | Student (own) or Admin (all) |
| POST | /api/applications | Student + CSRF |
| PATCH | /api/applications/:id | Student draft owner + CSRF |
| POST | /api/applications/:id/submit | Student draft owner + CSRF |
| PATCH | /api/applications/:id/status | Admin + CSRF |
| GET | /api/placements | Own/assigned placements |
| POST | /api/placements | Admin + CSRF |
| GET | /api/logbooks | Own/assigned logs |
| POST | /api/logbooks | Student placement owner + CSRF |
| PATCH | /api/logbooks/:id | Student owner (pending/returned) + CSRF |
| POST | /api/logbooks/:id/review | Assigned mentor + CSRF |

### Example frontend request

```js
const session = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST', credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
}).then(r => r.json())

const opportunities = await fetch('http://localhost:5000/api/opportunities', {
  credentials: 'include',
}).then(r => r.json())

// Include the login/me response's csrfToken on every authenticated write request:
const response = await fetch('http://localhost:5000/api/applications', {
  method: 'POST', credentials: 'include',
  headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': session.csrfToken },
  body: JSON.stringify({ opportunityId, coverStatement }),
})
```

## Known gaps / remaining work

This is an Iteration 1 backend module, not a production-complete system. The frontend currently uses browser demo data and is **not connected** to these APIs. No email verification, password reset, refresh-token rotation, milestone APIs, file storage, evaluations, notifications, detailed audit log, rate limiting by user, security regression suite, deployment hardening or full CI/CD are included. Before public deployment, add these and validate HTTPS and cookie/proxy settings.

The schema extends the initial `User` model and introduces a subset of the 15 proposed ICT307 entities. Remaining entities stay in the later backlog. Database migrations are created on the developer's machine by `npx prisma migrate dev` and should be committed after review.
