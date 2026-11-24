import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db/prisma.js'
import { parse, fail } from '../lib/http.js'
import { requireAuth, requireRole, requireCsrf } from '../middleware/session.js'
import { ROLES, canTransition } from '../lib/rules.js'

const router = Router()
router.use(requireAuth)
router.get('/', async (req, res) => {
  const where = req.user.role === ROLES.ADMIN ? {} : req.user.role === ROLES.STUDENT
    ? { studentId: req.user.id } : null
  if (!where) fail(403, 'Access denied')
  const applications = await prisma.application.findMany({ where, include: {
    opportunity: { include: { organization: { select: { name: true } } } },
    placement: { select: { id: true } },
  }, orderBy: { createdAt: 'desc' }, take: 100 })
  res.json(applications)
})
router.post('/', requireRole(ROLES.STUDENT), requireCsrf, async (req, res) => {
  const b = parse(z.object({ opportunityId: z.string().uuid(), coverStatement: z.string().max(4000).default('') }), req.body)
  const opp = await prisma.opportunity.findUnique({ where: { id: b.opportunityId } })
  if (!opp || opp.status !== 'PUBLISHED') fail(404, 'Opportunity not available')
  const existing = await prisma.application.findUnique({ where: {
    studentId_opportunityId: { studentId: req.user.id, opportunityId: b.opportunityId },
  } })
  if (existing) fail(409, 'Application already exists for this opportunity')
  const app = await prisma.application.create({ data: {
    studentId: req.user.id, opportunityId: b.opportunityId, coverStatement: b.coverStatement,
  } })
  res.status(201).json(app)
})
router.patch('/:id', requireRole(ROLES.STUDENT), requireCsrf, async (req, res) => {
  const b = parse(z.object({ coverStatement: z.string().max(4000) }), req.body)
  const app = await prisma.application.findUnique({ where: { id: req.params.id } })
  if (!app || app.studentId !== req.user.id) fail(404, 'Application not found')
  if (app.status !== 'DRAFT') fail(409, 'Only drafts can be edited')
  res.json(await prisma.application.update({ where: { id: app.id }, data: { coverStatement: b.coverStatement } }))
})
router.post('/:id/submit', requireRole(ROLES.STUDENT), requireCsrf, async (req, res) => {
  const app = await prisma.application.findUnique({ where: { id: req.params.id }, include: { opportunity: true } })
  if (!app || app.studentId !== req.user.id) fail(404, 'Application not found')
  if (app.status !== 'DRAFT') fail(409, 'Application already submitted')
  if (app.coverStatement.trim().length < 10) fail(400, 'Enter a cover statement of at least 10 characters')
  if (app.opportunity.status !== 'PUBLISHED' || (app.opportunity.closingDate && app.opportunity.closingDate < new Date())) {
    fail(409, 'Opportunity is closed')
  }
  const saved = await prisma.$transaction(async tx => {
    const changed = await tx.application.updateMany({ where: { id: app.id, status: 'DRAFT' }, data: { status: 'SUBMITTED', submittedAt: new Date() } })
    if (changed.count !== 1) fail(409, 'Application was updated by another request')
    await tx.applicationStatusHistory.create({ data: {
      applicationId: app.id, fromStatus: 'DRAFT', toStatus: 'SUBMITTED', changedById: req.user.id,
    } })
    return tx.application.findUnique({ where: { id: app.id } })
  })
  res.json(saved)
})
router.patch('/:id/status', requireRole(ROLES.ADMIN), requireCsrf, async (req, res) => {
  const { status } = parse(z.object({ status: z.enum([
    'UNDER_REVIEW', 'SHORTLISTED', 'OFFERED', 'ACCEPTED', 'REJECTED',
  ]) }), req.body)
  const app = await prisma.application.findUnique({ where: { id: req.params.id } })
  if (!app) fail(404, 'Application not found')
  if (!canTransition(app.status, status)) fail(409, `Cannot move ${app.status} to ${status}`)
  const saved = await prisma.$transaction(async tx => {
    const result = await tx.application.updateMany({ where: { id: app.id, status: app.status }, data: { status } })
    if (result.count !== 1) fail(409, 'Application was updated by another request')
    await tx.applicationStatusHistory.create({ data: {
      applicationId: app.id, fromStatus: app.status, toStatus: status, changedById: req.user.id,
    } })
    return tx.application.findUnique({ where: { id: app.id } })
  })
  res.json(saved)
})
export default router
