# SIIPMS — Iteration 1 Test Matrix

Test owner: Sunir Sunir | Version: 1.0

| ID | Functional area | Expected behaviour | Method |
|---|---|---|---|
| QA-01–03 | Health and registration validation | API responds; unauthenticated session blocked; weak passwords rejected | Automated API |
| QA-04–06 | Registration and login | No role escalation; wrong password rejected; correct session issued | Automated API |
| QA-07–09 | Security | Student cannot list users; CSRF and foreign-origin requests rejected | Automated API |
| QA-10–13 | Access and logout | Student can list published opportunities, cannot create one or log to unowned placement; logout clears the browser cookie; subsequent browser request is unauthorized | Automated API |
| QA-20–22 | Admin opportunity | Admin signs in and creates a published internship; student can see it | Automated API, admin configured |
| QA-23–28 | Applications | Student creates/edits draft; duplicate blocked; minimum statement enforced; submission saved | Automated API, admin configured |
| QA-29–34 | Application status | Student cannot change statuses; transitions follow approved workflow | Automated API, admin configured |
| QA-35–36 | Placement | Admin allocates accepted application to assigned mentor/supervisor | Automated API, admin configured |
| QA-37–44 | Logbooks | Hours bounds, mentor ownership, return-comment requirement, editing returned entry, approval lock | Automated API, admin configured |
| UI-01 | Navigation | Login leads to correct role view; active navigation accurate | Manual browser |
| UI-02 | Student actions | Opportunity filtering, draft, submission, status, logbook interactions | Manual browser |
| UI-03 | Mentor review | Reject requires non-empty comment | Manual browser |
| UI-04 | Responsive UI | Sidebar and forms do not overlap at mobile and desktop widths | Manual browser |
| SYS-01 | Frontend checks | `npm run lint` and `npm run build` exit successfully | CLI |
| SYS-02 | Backend unit tests | `npm test` passes with no failures | CLI |
| SYS-03 | Database migration | Prisma reports schema up to date | CLI |

Notes:
- Do not conflate a passed React build with full functionality or backend integration.
- Frontend uses demonstration/browser-stored data until API integration is completed.
- `QA-20–44` require test administrator credentials and will be marked SKIP without them.

Security note: QA-13 checks browser logout, not server-side JWT revocation. A saved JWT may still be accepted before its 15-minute expiry. Track immediate revocation as a separate security enhancement.
