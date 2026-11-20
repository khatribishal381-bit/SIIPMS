import {
  BookOpen, BriefcaseBusiness, ChartNoAxesCombined, CheckCheck,
  ClipboardCheck, ClipboardList, LayoutDashboard, Users, Bell, Flag
} from 'lucide-react'
export const ROLE_CONFIG = {
  student: {
    name: 'Amara Okafor', description: 'BIT student',
    menu: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'opportunities', label: 'Opportunities', icon: BriefcaseBusiness },
      { id: 'applications', label: 'My applications', icon: ClipboardList },
      { id: 'logbook', label: 'Logbook', icon: BookOpen },
      { id: 'milestones', label: 'Milestones', icon: Flag },
      { id: 'notifications', label: 'Notifications', icon: Bell },
    ],
  },
  mentor: {
    name: 'Priya Sharma', description: 'Industry Mentor',
    menu: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'approvals', label: 'Approve hours', icon: CheckCheck },
      { id: 'evaluation', label: 'Evaluation', icon: ClipboardCheck },
      { id: 'notifications', label: 'Notifications', icon: Bell },
    ],
  },
  supervisor: {
    name: 'Dr James Liu', description: 'Academic Supervisor',
    menu: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'cohort', label: 'Cohort', icon: Users },
      { id: 'milestone-review', label: 'Milestone review', icon: Flag },
      { id: 'notifications', label: 'Notifications', icon: Bell },
    ],
  },
  admin: {
    name: 'Elena Vasquez', description: 'Placement Admin',
    menu: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'applications', label: 'Applications', icon: ClipboardList },
      { id: 'allocation', label: 'Allocate placement', icon: CheckCheck },
      { id: 'opportunities', label: 'Manage opportunities', icon: BriefcaseBusiness },
      { id: 'reports', label: 'Reports', icon: ChartNoAxesCombined },
    ],
  },
}

