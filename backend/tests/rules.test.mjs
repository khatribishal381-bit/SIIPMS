import test from 'node:test'
import assert from 'node:assert/strict'
import { canTransition, canReviewLog, validHours, validDateOrder, needsReturnComment } from '../lib/rules.js'

test('student application cannot jump directly from submitted to accepted', () => {
  assert.equal(canTransition('SUBMITTED', 'ACCEPTED'), false)
  assert.equal(canTransition('SUBMITTED', 'UNDER_REVIEW'), true)
})
test('returned hours must be pending and assigned to reviewer', () => {
  const placement = { mentorId: 'assigned-mentor' }
  assert.equal(canReviewLog('other-mentor', placement, 'PENDING'), false)
  assert.equal(canReviewLog('assigned-mentor', placement, 'APPROVED'), false)
  assert.equal(canReviewLog('assigned-mentor', placement, 'PENDING'), true)
})
test('hours obey the 0.5 to 10 limit', () => {
  assert.equal(validHours(0.25), false)
  assert.equal(validHours(0.5), true)
  assert.equal(validHours(10), true)
  assert.equal(validHours(12), false)
})
test('placement end date must follow start', () => {
  assert.equal(validDateOrder('2026-12-01', '2026-12-20'), true)
  assert.equal(validDateOrder('2026-12-20', '2026-12-01'), false)
})

test('returning hours needs a nonempty comment', () => {
  assert.equal(needsReturnComment('RETURNED', ''), false)
  assert.equal(needsReturnComment('RETURNED', '  '), false)
  assert.equal(needsReturnComment('RETURNED', 'Correct the hours entered'), true)
  assert.equal(needsReturnComment('APPROVED', ''), true)
})
