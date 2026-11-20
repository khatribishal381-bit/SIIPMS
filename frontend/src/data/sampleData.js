// Seed data for frontend workflows. Replace with API responses during backend integration.
export const opportunitiesSeed = [
  { id: 'opp-1', title: 'Junior Software Intern', company: 'Nimbus Digital', discipline: 'Software', location: 'Sydney', type: 'Internship', duration: '12 weeks', hours: 120, closes: '30 Nov 2026', description: 'Assist the product engineering team with testing, documentation, and feature delivery for a cloud-based platform.', open: true },
  { id: 'opp-2', title: 'Local council data dashboard', company: 'City Council', discipline: 'Data', location: 'Hybrid', type: 'Industry project', duration: 'Semester project', hours: 80, closes: '5 Dec 2026', description: 'Collaborate with a local council team to design and prototype a data dashboard for community service reporting.', open: true },
  { id: 'opp-3', title: 'Business Analytics Placement', company: 'Harbour Retail Group', discipline: 'Business', location: 'Sydney', type: 'Internship', duration: '10 weeks', hours: 100, closes: '18 Dec 2026', description: 'Support weekly business performance reporting and data quality improvement.', open: true },
]
export const applicationsSeed = [
  { id: 'app-1', opportunityId: 'opp-1', title: 'Nimbus Digital intern', student: 'Amara Okafor', submitted: '16 Sep 2026', status: 'Under review' },
  { id: 'app-2', opportunityId: 'opp-2', title: 'Council data dashboard', student: 'Amara Okafor', submitted: '10 Sep 2026', status: 'Shortlisted' },
  { id: 'app-3', opportunityId: 'opp-3', title: 'Retail analytics project', student: 'Amara Okafor', submitted: '2 Sep 2026', status: 'Unsuccessful' },
  { id: 'app-4', opportunityId: 'opp-1', title: 'Nimbus Intern', student: 'Chen Wei', submitted: '15 Sep 2026', status: 'Accepted' },
  { id: 'app-5', opportunityId: 'opp-2', title: 'Council Project', student: 'Sara Ahmed', submitted: '12 Sep 2026', status: 'Offered' },
]
export const logbookSeed = [
  { id: 'log-1', student: 'Amara Okafor', date: '2026-09-15', hours: 8, activity: 'Bug fixes and stand-up', reflection: 'Clearer commit messages', status: 'Pending', comment: '' },
  { id: 'log-2', student: 'Amara Okafor', date: '2026-09-12', hours: 7, activity: 'Code review and team planning', reflection: 'Practised giving concise feedback', status: 'Approved', comment: '' },
  { id: 'log-3', student: 'Chen Wei', date: '2026-09-16', hours: 6, activity: 'Data cleaning and dashboard review', reflection: 'Better understanding of reporting workflow', status: 'Pending', comment: '' },
]
export const milestonesSeed = [
  { id: 'mile-1', student: 'Amara Okafor', title: 'Learning agreement', due: '12 Sep 2026', status: 'Approved', file: 'learning-agreement.pdf' },
  { id: 'mile-2', student: 'Amara Okafor', title: 'Progress report', due: '28 Nov 2026', status: 'Due soon', file: '' },
  { id: 'mile-3', student: 'Amara Okafor', title: 'Final report and reflection', due: '20 Dec 2026', status: 'Not started', file: '' },
]
export const cohortSeed = [
  { name: 'Amara Okafor', company: 'Nimbus Digital', hours: '42/120 hrs', lastLog: '15 Sep 2026', flag: 'On track' },
  { name: 'Chen Wei', company: 'CityTech Labs', hours: '12/120 hrs', lastLog: '2 Sep 2026', flag: 'At risk' },
  { name: 'Sara Ahmed', company: 'City Council', hours: '28/80 hrs', lastLog: '8 Sep 2026', flag: 'Overdue log' },
]
export const notificationsSeed = [
  { id: 'nt-1', title: 'Hours awaiting approval', message: 'A logbook entry requires mentor review.', roles: ['mentor'], date: '20 Nov 2026' },
  { id: 'nt-2', title: 'Progress report due', message: 'Your progress report is due on 28 November.', roles: ['student'], date: '20 Nov 2026' },
  { id: 'nt-3', title: 'Cohort follow-up', message: 'Two students need a logbook check-in.', roles: ['supervisor'], date: '19 Nov 2026' },
  { id: 'nt-4', title: 'Application update', message: 'New student applications are in the review queue.', roles: ['admin'], date: '19 Nov 2026' },
]
