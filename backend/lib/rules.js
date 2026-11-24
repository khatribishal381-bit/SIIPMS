export const ROLES = Object.freeze({
  STUDENT: 'STUDENT',
  SUPERVISOR: 'ACADEMIC_SUPERVISOR',
  MENTOR: 'INDUSTRY_MENTOR',
  ADMIN: 'PLACEMENT_ADMIN',
})
export const statusSteps = Object.freeze({
  SUBMITTED: ['UNDER_REVIEW', 'WITHDRAWN'],
  UNDER_REVIEW: ['SHORTLISTED', 'REJECTED', 'WITHDRAWN'],
  SHORTLISTED: ['OFFERED', 'REJECTED', 'WITHDRAWN'],
  OFFERED: ['ACCEPTED', 'REJECTED', 'WITHDRAWN'],
  ACCEPTED: [], REJECTED: [], WITHDRAWN: [], DRAFT: ['SUBMITTED', 'WITHDRAWN'],
})
export function canTransition(from, to) { return Boolean(statusSteps[from]?.includes(to)) }
export function canReviewLog(mentorId, placement, status) {
  return mentorId === placement.mentorId && status === 'PENDING'
}
export function validHours(hours) { return Number.isFinite(hours) && hours >= 0.5 && hours <= 10 }
export function validDateOrder(start, end) { return new Date(end).getTime() > new Date(start).getTime() }

export function needsReturnComment(decision, comment) {
  return decision !== 'RETURNED' || Boolean(String(comment || '').trim())
}
