import { Menu } from 'lucide-react'

export default function Topbar({ title, subtitle, userName, onMenuClick, actions }) {
  return (
    <header className="si-topbar">
      <button type="button" className="si-topbar__hamburger" onClick={onMenuClick} aria-label="Open navigation">
        <Menu size={22} />
      </button>
      <div className="si-topbar__heading">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="si-topbar__right">{actions}{userName && <span className="si-topbar__name">{userName}</span>}</div>
    </header>
  )
}
