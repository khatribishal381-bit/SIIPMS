import { useState } from 'react'
import PortalLayout from './layouts/PortalLayout'
import LoginPage from './pages/LoginPage'
import { StudentPortal, MentorPortal, SupervisorPortal, AdminPortal } from './pages/PortalPages'
import { applicationsSeed, opportunitiesSeed, logbookSeed, milestonesSeed, notificationsSeed } from './data/sampleData'
import './styles/siipms.css'

const roleViews = { student: StudentPortal, mentor: MentorPortal, supervisor: SupervisorPortal, admin: AdminPortal }

export default function App() {
  const [role, setRole] = useState(null)
  const [page, setPage] = useState('dashboard')
  const [selectedOpportunity, setSelectedOpportunity] = useState('opp-1')
  const [selectedStudent, setSelectedStudent] = useState('Amara Okafor')
  const [applications, setApplications] = useState(applicationsSeed)
  const [opportunities, setOpportunities] = useState(opportunitiesSeed)
  const [logs, setLogs] = useState(logbookSeed)
  const [milestones, setMilestones] = useState(milestonesSeed)
  const [notifications] = useState(notificationsSeed)
  const [evaluation, setEvaluation] = useState(null)
  const [allocations, setAllocations] = useState([])
  const [toast, setToast] = useState('')

  const navigate = (target) => { setPage(target); setToast(''); window.scrollTo({ top: 0, behavior: 'auto' }) }
  const enterRole = (selectedRole) => { setRole(selectedRole); navigate('dashboard') }
  const logout = () => { setRole(null); setPage('dashboard'); setToast('') }
  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 5000) }

  if (!role) return <LoginPage onEnter={enterRole} />

  const PortalView = roleViews[role]
  const data = { applications, opportunities, logs, milestones, notifications, evaluation, allocations, selectedOpportunity, selectedStudent }
  const actions = { navigate, notify, setApplications, setOpportunities, setLogs, setMilestones, setEvaluation, setAllocations, setSelectedOpportunity, setSelectedStudent }
  const titles = {
    student: { apply: 'Apply for internship', confirmation: 'Application sent', detail: 'Opportunity details' },
    mentor: {}, supervisor: { 'review-logs': 'Review logbook' }, admin: {},
  }
  return (
    <PortalLayout role={role} activePage={page} onNavigate={navigate} onSignOut={logout} titleOverride={titles[role]?.[page]}>
      <PortalView page={page} data={data} actions={actions} />
      {toast && <div className="si-toast" role="status">{toast}<button type="button" onClick={() => setToast('')} aria-label="Dismiss message">×</button></div>}
    </PortalLayout>
  )
}
