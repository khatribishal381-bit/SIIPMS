export function Button({ variant = 'primary', children, className = '', ...props }) {
  return <button type="button" className={`si-btn si-btn--${variant} ${className}`} {...props}>{children}</button>
}

export function Card({ children, className = '', ...props }) {
  return <section className={`si-card ${className}`} {...props}>{children}</section>
}

export function StatCard({ label, value, note, accent }) {
  return (
    <Card className="si-stat-card">
      <span className="si-stat-card__label">{label}</span>
      <strong className={`si-stat-card__value ${accent ? `si-text--${accent}` : ''}`}>{value}</strong>
      {note && <span className="si-stat-card__note">{note}</span>}
    </Card>
  )
}

export function StatusBadge({ tone = 'blue', children }) {
  return <span className={`si-badge si-badge--${tone}`}>{children}</span>
}

export function TextField({ id, label, error, className = '', ...inputProps }) {
  return (
    <label className={`si-field ${className}`} htmlFor={id}>
      <span className="si-field__label">{label}</span>
      <input id={id} className="si-input" aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...inputProps} />
      {error && <span className="si-field__error" id={`${id}-error`}>{error}</span>}
    </label>
  )
}
