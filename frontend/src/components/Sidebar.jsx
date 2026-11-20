import { GraduationCap, LogOut, X } from 'lucide-react'
import { ROLE_CONFIG } from '../data/roleConfig'

export default function Sidebar({ role, activePage, onNavigate, onSignOut, isOpen, onClose }) {
  const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.student
  return (
    <>
      {isOpen && <button type="button" className="si-overlay" aria-label="Close navigation" onClick={onClose} />}
      <aside className={`si-sidebar ${isOpen ? 'si-sidebar--open' : ''}`} aria-label="Main navigation">
        <div className="si-sidebar__brand">
          <span className="si-brand-icon"><GraduationCap size={19} aria-hidden="true" /></span>
          <span><strong>SIIPMS</strong><small>CIHE</small></span>
          <button type="button" className="si-sidebar__close" onClick={onClose} aria-label="Close menu"><X size={18}/></button>
        </div>
        <nav className="si-sidebar__nav">
          {config.menu.map((item) => {
            const Icon = item.icon
            return (
              <button key={item.id} type="button"
                className={`si-nav-item ${activePage === item.id ? 'si-nav-item--active' : ''}`}
                aria-current={activePage === item.id ? 'page' : undefined}
                onClick={() => { onNavigate(item.id); onClose?.() }}>
                <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
        <div className="si-sidebar__footer">
          <div className="si-sidebar__person"><strong>{config.name}</strong><small>{config.description}</small></div>
          <button type="button" className="si-signout" onClick={onSignOut}><LogOut size={15} aria-hidden="true" />Sign out</button>
        </div>
      </aside>
    </>
  )
}
