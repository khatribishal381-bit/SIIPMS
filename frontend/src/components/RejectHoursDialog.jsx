import { useState } from 'react'
import { Button, Card } from './UI'

export default function RejectHoursDialog({ onClose, onReject }) {
  const [comment, setComment] = useState('')
  const [error, setError] = useState(false)
  const handleSubmit = (event) => {
    event.preventDefault()
    if (!comment.trim()) { setError(true); return }
    onReject(comment.trim())
  }
  return (
    <div className="si-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <Card className="si-dialog" role="dialog" aria-modal="true" aria-labelledby="reject-title">
        <h2 id="reject-title">Reject logbook hours</h2>
        <p className="si-muted">A reason is required so the student can correct the entry.</p>
        <form onSubmit={handleSubmit}>
          <label className="si-field" htmlFor="rejection-comment"><span className="si-field__label">Reason for rejection *</span></label>
          <textarea id="rejection-comment" className="si-input si-textarea" value={comment}
            onChange={(e) => { setComment(e.target.value); setError(false) }}
            aria-invalid={error} aria-describedby={error ? 'rejection-error' : undefined}
            placeholder="Explain what the student should correct" />
          {error && <p className="si-field__error" id="rejection-error">Please enter a reason before rejecting.</p>}
          <div className="si-dialog__actions"><Button variant="outline" onClick={onClose}>Cancel</Button><Button variant="danger" type="submit">Reject hours</Button></div>
        </form>
      </Card>
    </div>
  )
}
