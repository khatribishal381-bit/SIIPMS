import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db/prisma.js'
import { parse, fail } from '../lib/http.js'
import { requireAuth, requireRole, requireCsrf } from '../middleware/session.js'
import { ROLES, canReviewLog, validHours, needsReturnComment } from '../lib/rules.js'

const router = Router()
router.use(requireAuth)
const form = z.object({
  entryDate: z.string().datetime(), hours: z.number().refine(validHours, 'Hours must be between 0.5 and 10'),
  activity: z.string().trim().min(3).max(3000), reflection: z.string().max(3000).default(''),
})
router.get('/', async (req, res) => {
  const role = req.user.role
  const where = role === ROLES.ADMIN ? {} : role === ROLES.MENTOR
    ? { placement: { mentorId: req.user.id } } : role === ROLES.SUPERVISOR
      ? { placement: { supervisorId: req.user.id } } : { placement: { application: { studentId: req.user.id } } }
  const logs = await prisma.logbookEntry.findMany({ where, include: {
    placement: { include: { application: { select: { studentId: true } } } },
  }, orderBy: { entryDate: 'desc' }, take: 100 })
  res.json(logs)
})
router.post('/', requireRole(ROLES.STUDENT), requireCsrf, async (req, res) => {
  const b = parse(form.extend({ placementId: z.string().uuid() }), req.body)
  const placement = await prisma.placement.findUnique({ where: { id: b.placementId }, include: { application: true } })
  if (!placement || placement.application.studentId !== req.user.id) fail(404, 'Placement not found')
  const log = await prisma.logbookEntry.create({ data: { ...b, entryDate: new Date(b.entryDate) } })
  res.status(201).json(log)
})
router.patch('/:id', requireRole(ROLES.STUDENT), requireCsrf, async (req, res) => {
  const b = parse(form, req.body)
  const item = await prisma.logbookEntry.findUnique({ where: { id: req.params.id }, include: {
    placement: { include: { application: true } },
  } })
  if (!item || item.placement.application.studentId !== req.user.id) fail(404, 'Entry not found')
  if (!['PENDING', 'RETURNED'].includes(item.status)) fail(409, 'Approved entries cannot be edited')
  const saved = await prisma.logbookEntry.updateMany({
    where: { id: item.id, status: item.status },
    data: { ...b, entryDate: new Date(b.entryDate), status: 'PENDING', reviewComment: null, reviewedAt: null, reviewedById: null },
  })
  if (saved.count !== 1) fail(409, 'Entry was updated by another request')
  res.json(await prisma.logbookEntry.findUnique({ where: { id: item.id } }))
})
router.post('/:id/review', requireRole(ROLES.MENTOR), requireCsrf, async (req, res) => {
  const b = parse(z.object({ decision: z.enum(['APPROVED', 'RETURNED']), comment: z.string().max(2000).default('') }), req.body)
  if (!needsReturnComment(b.decision, b.comment)) fail(400, 'A comment is required when returning hours')
  const item = await prisma.logbookEntry.findUnique({ where: { id: req.params.id }, include: { placement: true } })
  if (!item || item.placement.mentorId !== req.user.id) fail(404, 'Entry not found')
  if (!canReviewLog(req.user.id, item.placement, item.status)) fail(409, 'Entry is not pending')
  const saved = await prisma.logbookEntry.updateMany({
    where: { id: item.id, status: 'PENDING' }, data: {
      status: b.decision, reviewComment: b.comment.trim() || null,
      reviewedAt: new Date(), reviewedById: req.user.id,
    },
  })
  if (saved.count !== 1) fail(409, 'Entry was updated by another request')
  res.json(await prisma.logbookEntry.findUnique({ where: { id: item.id } }))
})
export default router
