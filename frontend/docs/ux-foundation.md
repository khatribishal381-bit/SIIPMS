# SIIPMS front-end interface

Subodh Dhungel - UI consistency and shared components (H-1, H-4).

The UI uses shared React components for the four roles. It follows the ICT307 Figma designs, with one consistent sidebar, clear selected navigation, responsive panels, and form validation. Login calls `/api/auth/login` and does not accept arbitrary credentials. Until that endpoint is built, the role links on the login screen are for examining the frontend.

The workflows currently run in React state using sample records. Submissions, reviews and status changes are **not saved to PostgreSQL** and are reset on reload. File selection does not upload a document. Frontend-only access is not security protection; backend auth and role checks are required before deployment.

## Smoke tests
- Open the site: see SIIPMS login (no component-preview banner).
- Continue as Student: use Opportunities, View & apply, My applications, Logbook and Milestones.
- Continue as Mentor: approve hours or reject with a required comment; confirm student logbook shows returned feedback.
- Continue as Supervisor: review cohort, student logs, milestones.
- Continue as Admin: review applications, allocate placement, manage opportunity visibility, export CSV.
- Use a narrow viewport: open and close the menu.
- Run `npm run build` from `frontend`.

For production: complete backend authentication, validation, API endpoints, persistence, accessibility testing and deployment configuration.
