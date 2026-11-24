import { useState } from 'react'
import { GraduationCap } from 'lucide-react'

export default function LoginPage({ onEnter }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const signIn = async (event) => {
    event.preventDefault()
    setError('')
    if (!email.trim() || !password) { setError('Enter your email address and password.'); return }
    setBusy(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok || !['student', 'mentor', 'supervisor', 'admin'].includes(payload?.user?.role)) {
        throw new Error(response.ok ? 'Unable to sign in with this account.' : payload?.message || 'Sign in is unavailable. Please try again later.')
      }
      onEnter(payload.user.role)
    } catch (err) { setError(err instanceof TypeError ? 'The sign-in service is unavailable right now.' : err.message) }
    finally { setBusy(false) }
  }

  return (
    <div className="si-login-wrap">
      <div className="si-login-panel">
        <div className="si-login-mark"><GraduationCap size={27} strokeWidth={1.7} /></div>
        <h1>SIIPMS</h1>
        <p className="si-login-subtitle">CIHE internship &amp; industry project portal</p>
        <p className="si-login-prompt">Sign in with your CIHE account.</p>
        <form onSubmit={signIn} className="si-login-form">
          <label htmlFor="login-email">Email</label>
          <input id="login-email" type="email" autoComplete="username" placeholder="name@student.cihe.edu.au" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label htmlFor="login-password">Password</label>
          <input id="login-password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="si-login-error" role="alert">{error}</p>}
          <button type="submit" disabled={busy} className="si-login-submit">{busy ? 'Signing in...' : 'Sign in'}</button>
        </form>
        <div className="si-login-links">
          <button type="button" onClick={() => onEnter('student')}>Continue as Student</button>
          <button type="button" onClick={() => onEnter('mentor')}>Continue as Mentor</button>
          <button type="button" onClick={() => onEnter('supervisor')}>Continue as Supervisor</button>
          <button type="button" onClick={() => onEnter('admin')}>Continue as Admin</button>
        </div>
      </div>
    </div>
  )
}
