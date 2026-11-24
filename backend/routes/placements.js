import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db/prisma.js'
import { parse, fail } from '../lib/http.js'
import { requireAuth, requireRole, requireCsrf } from '../middleware/session.js'
import { ROLES, validDateOrder } from '../lib/rules.js'

const router = Router()
router.use(requireAuth)
router.get('/', async (req, res) => {
  const role = req.user.role
  const where = role === ROLES.ADMIN ? {} : role === ROLES.MENTOR
    ? { mentorId: req.user.id } : role === ROLES.SUPERVISOR
      ? { supervisorId: req.user.id } : { application: { studentId: req.user.id } }
  const items = await prisma.placement.findMany({ where, include: {
    application: { include: { opportunity: true, student: { select: { id: true, fullName: true } } } },
  }, take: 100 })
  res.json(items)
})
router.post('/', requireRole(ROLES.ADMIN), requireCsrf, async (req, res) => {
  const b = parse(z.object({
    applicationId: z.string().uuid(), supervisorId: z.string().uuid(), mentorId: z.string().uuid(),
    startDate: z.string().datetime(), endDate: z.string().datetime(),
    requiredHours: z.number().int().min(1).max(10000).default(120),
  }), req.body)
  if (!validDateOrder(b.startDate, b.endDate)) fail(400, 'End date must follow start date')
  const [application, supervisor, mentor] = await Promise.all([
    prisma.application.findUnique({ where: { id: b.applicationId } }),
    prisma.user.findUnique({ where: { id: b.supervisorId } }),
    prisma.user.findUnique({ where: { id: b.mentorId } }),
  ])
  if (!application || application.status !== 'ACCEPTED') fail(409, 'Application must be accepted before allocation')
  if (supervisor?.role !== ROLES.SUPERVISOR || !supervisor.isActive) fail(400, 'Invalid academic supervisor')
  if (mentor?.role !== ROLES.MENTOR || !mentor.isActive) fail(400, 'Invalid industry mentor')
  res.status(201).json(await prisma.placement.create({ data: {
    applicationId: b.applicationId, supervisorId: b.supervisorId, mentorId: b.mentorId,
    startDate: new Date(b.startDate), endDate: new Date(b.endDate), requiredHours: b.requiredHours,
  } }))
})
export default router
