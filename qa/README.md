# SIIPMS Iteration 1 — QA Test Pack

Owner: Sunir Sunir (CIHE240723) | Branch: `qa/iteration1-tests`

## Scope

- API health, public student registration, login, logout, RBAC and CSRF restrictions.
- Optional administrator-driven end-to-end test: published opportunity, application draft/submit/status transitions, placement allocation, student logbook, assigned mentor return and approval.
- Earlier backend unit tests, frontend lint/build and Prisma migration status are separate verification steps.

## Prerequisites

1. PostgreSQL is running and the two migrations are applied.
2. Start the backend: `Set-Location E:\SIIPMS\backend; npm run dev`.
3. In a **second PowerShell window**, run the QA test from the project root:

```powershell
Set-Location E:\SIIPMS
node .\qa\run-iteration1-tests.mjs
```

The script uses Node.js built-in `fetch` and requires no additional npm package. It fails with a nonzero exit code if any executed check fails. Results are written into `qa/evidence/api-results.md` and `.json`.

## Optional complete workflow test

A pre-existing local placement-admin account is needed for the full workflow. The backend provides an administrator-provisioning command:

```powershell
Set-Location E:\SIIPMS\backend
$sec = Read-Host 'Local QA admin password' -AsSecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)
try { $env:SIIPMS_ADMIN_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
npm run create:admin -- qa-admin@example.test
Remove-Item Env:\SIIPMS_ADMIN_PASSWORD
```

Then in the test terminal:

```powershell
$env:QA_ADMIN_EMAIL = 'qa-admin@example.test'
$sec = Read-Host 'Local QA admin password' -AsSecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)
try { $env:QA_ADMIN_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
node .\qa\run-iteration1-tests.mjs
Remove-Item Env:\QA_ADMIN_EMAIL,Env:\QA_ADMIN_PASSWORD -ErrorAction SilentlyContinue
```

All end-to-end records have randomly generated `qa-` test identifiers. **They remain in the local `siipms_dev` database**, so run this on a disposable development database, never on production or on real student information. Do not commit or screenshot passwords or cookies. The suite does not modify the existing frontend.

## Run all baseline checks

```powershell
Set-Location E:\SIIPMS
npm --prefix frontend run lint
npm --prefix frontend run build
npm --prefix backend test
Set-Location E:\SIIPMS\backend
.\node_modules\.bin\prisma.cmd migrate status
```

Your prior console output showed the build and five unit tests passing, with two `react(purity)` warnings in `PortalPages.jsx`. These warnings are tracked as QA findings, not silently fixed on the QA branch. Source owners should address them before the final merge.

## Reporting

Capture the real PowerShell output, relevant browser screenshots and the generated `qa/evidence/api-results.md`. Record bugs in Jira with steps to reproduce, expected result, actual result, severity, assigned owner and commit/PR link. Don't label skipped checks as passes.
