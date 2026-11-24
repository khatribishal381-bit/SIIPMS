# Student portal – Iteration 1

Assigned role: Nimesh Katuwal (frontend development).

## Implemented frontend workflows

- Browse open opportunities; search by keyword and filter by discipline/location.
- View opportunity details and existing application status.
- Save an application draft, reload the browser and continue it with its cover statement intact.
- Validate required cover statement and prevent duplicate submissions.
- Submit an application into the local application pipeline and track its status.
- Search and filter the current student's applications.
- Create logbook entries and revise entries returned with mentor feedback.
- Preserve applications, opportunities, logbook entries and milestone metadata using browser localStorage.

## Testing to perform

1. Open Opportunities. Find the Northshore Technology listing and open details.
2. Click Apply and Save draft after entering a cover statement. Reopen via My applications.
3. Refresh the page; return to Student and verify the cover statement remains.
4. Submit with fewer than 20 characters (must reject). Submit with a valid statement (must succeed).
5. Reopen the same listing (must not submit a duplicate application).
6. Search and filter opportunities and application statuses.
7. Submit a logbook entry and verify the mentor approval queue displays it.
8. Refresh the browser and verify the new logbook entry remains.
9. Run `npm run lint` and `npm run build`.

## Scope and security

This is a frontend-only prototype. Browser localStorage is not a secure account database and should not contain real student data, credentials, or uploaded documents. The role shortcuts are for demonstration; server-side authentication, persistent document storage, and API integration remain backend tasks. The localStorage keys are deliberately versioned to ease migration to server-side persistence.
