import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import { ROLE_CONFIG } from '../data/roleConfig'
import Topbar from '../components/Topbar'

export default function PortalLayout({ role = 'student', activePage = 'dashboard', onNavigate, onSignOut, subtitle, children, actions, titleOverride }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.student
  const page = config.menu.find((item) => item.id === activePage)
  const title = titleOverride ?? page?.label ?? 'Dashboard'
  const navActive = { apply: 'opportunities', detail: 'opportunities', confirmation: 'applications', 'review-logs': 'cohort' }[activePage] ?? activePage
  return (
    <div className="si-shell">
      <Sidebar role={role} activePage={navActive} onNavigate={onNavigate} onSignOut={onSignOut}
        isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="si-shell__body">
        <Topbar title={title} subtitle={subtitle} userName={config.name} actions={actions}
          onMenuClick={() => setMobileOpen(true)} />
        <main className="si-main" id="main-content">{children}</main>
      </div>
    </div>
  )
}
