# SIIPMS Iteration 1 — QA Defect Register

**Observed during the baseline verification (24 Nov 2026):**

| Issue | Severity | Evidence | Owner | Status |
|---|---|---|---|---|
| QA-DEF-01 | Low | Oxlint warns `react(purity)` at `frontend/src/pages/PortalPages.jsx:95` (`Date.now()` during render) | Nimesh | Open |
| QA-DEF-02 | Low | Oxlint warns `react(purity)` at `frontend/src/pages/PortalPages.jsx:144` (`new Date()` during render) | Nimesh | Open |

**Known integration limitation (not a failed test):** The React frontend currently uses sample data and local browser storage, not persistent calls to Safal's APIs. This is remaining work and should not be reported as a completed integration.

Report additional defects only if reproduced. Suggested Jira fields: issue key, environment, reproduction steps, expected result, actual result, screenshot/test log, priority, assignee, status and fix PR.

**QA-OBS-03 — Session revocation limitation (security follow-up):** On 24 Nov 2026 the original QA-13 replayed a saved JWT after logout and received HTTP 200 from `/api/auth/me`. The logout response clears the browser cookie, but the stateless JWT remains valid until its 15-minute expiry if a copy is retained. The revised QA-13 tests browser cookie deletion and subsequent unauthenticated access; immediate server-side revocation remains unimplemented. Owner: Safal; status: to evaluate before production release. No passwords or tokens should be included in Jira evidence.
