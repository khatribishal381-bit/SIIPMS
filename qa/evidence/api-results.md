# SIIPMS Iteration 1 — API Test Results

Execution date: 2026-11-24T08:23:20.845Z
Base URL: http://localhost:5000/api
Run: 891c75f8

**Passed:** 38 | **Failed:** 0 | **Skipped:** 0

| Case | Test | Result |
|---|---|---|
| QA-01 | Health endpoint | PASS |
| QA-02 | Unauthenticated user cannot read session | PASS |
| QA-03 | Short passwords are rejected during registration | PASS |
| QA-04 | Public registration always creates student role | PASS |
| QA-05 | Wrong password is rejected | PASS |
| QA-06 | Login returns a valid session and the correct user | PASS |
| QA-07 | Student cannot view admin user list | PASS |
| QA-08 | Logout without CSRF token is blocked | PASS |
| QA-09 | Requests from an unexpected browser origin are blocked | PASS |
| QA-10 | Student can read published opportunity listing | PASS |
| QA-11 | Student cannot create opportunities | PASS |
| QA-12 | Student cannot create a log for an unowned placement | PASS |
| QA-13 | Logout clears browser cookie and ends browser session | PASS |
| QA-20 | Administrator login | PASS |
| QA-21 | Administrator creates published opportunity | PASS |
| QA-22 | Student can see published opportunity | PASS |
| QA-23 | Student creates application draft | PASS |
| QA-24 | Duplicate application is rejected | PASS |
| QA-25 | Short cover statement cannot be submitted | PASS |
| QA-26 | Student can edit a draft application | PASS |
| QA-27 | Student submits a valid application | PASS |
| QA-28 | Resubmitting an application is blocked | PASS |
| QA-29 | Student cannot change application status as admin | PASS |
| QA-30 | Admin cannot skip required status transitions | PASS |
| QA-31 | Administrator transitions application to UNDER_REVIEW | PASS |
| QA-32 | Administrator transitions application to SHORTLISTED | PASS |
| QA-33 | Administrator transitions application to OFFERED | PASS |
| QA-34 | Administrator transitions application to ACCEPTED | PASS |
| QA-35 | Admin provisions supervisor, assigned mentor and other mentor | PASS |
| QA-36 | Admin allocates placement for accepted application | PASS |
| QA-37 | Logbook entry above ten hours is rejected | PASS |
| QA-38 | Student submits valid logbook hours | PASS |
| QA-39 | Mentor cannot review an unrelated placement | PASS |
| QA-40 | Returning hours without a comment fails | PASS |
| QA-41 | Assigned mentor returns hours with a comment | PASS |
| QA-42 | Student edits returned entry and resubmits | PASS |
| QA-43 | Assigned mentor approves resubmitted hours | PASS |
| QA-44 | Student cannot edit approved hours | PASS |

Test data is added to the local development database and is not automatically removed.
A PASS means this automated check passed, not that the entire system is production ready.
The React frontend currently uses demonstration data rather than live API persistence.
