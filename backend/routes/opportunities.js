import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db/prisma.js'
import { parse } from '../lib/http.js'
import { requireAuth, requireRole, requireCsrf } from '../middleware/session.js'
import { ROLES } from '../lib/rules.js'

const router = Router()
router.use(requireAuth)
router.get('/', async (req, res) => {
  const isAdmin = req.user.role === ROLES.ADMIN
  const search = String(req.query.search || '').trim().slice(0, 100)
  const data = await prisma.opportunity.findMany({
    where: {
      ...(isAdmin ? {} : { status: 'PUBLISHED' }),
      ...(search ? { OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { organization: { name: { contains: search, mode: 'insensitive' } } },
      ] } : {}),
    },
    include: { organization: { select: { name: true } } },
    orderBy: { createdAt: 'desc' }, take: 100,
  })
  res.json(data)
})
router.post('/', requireRole(ROLES.ADMIN), requireCsrf, async (req, res) => {
  const b = parse(z.object({
    title: z.string().trim().min(4).max(150), description: z.string().trim().min(10),
    organizationName: z.string().trim().min(2).max(150),
    type: z.string().trim().max(40).default('INTERNSHIP'),
    discipline: z.string().trim().max(80).optional(),
    location: z.string().trim().max(100).optional(),
    durationWeeks: z.number().int().positive().optional(),
    totalHours: z.number().int().positive().optional(),
    closingDate: z.string().datetime().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  }), req.body)
  const org = await prisma.organization.upsert({
    where: { name: b.organizationName }, update: {}, create: { name: b.organizationName },
  })
  const item = await prisma.opportunity.create({ data: {
    title: b.title, description: b.description, type: b.type, discipline: b.discipline,
    location: b.location, durationWeeks: b.durationWeeks, totalHours: b.totalHours,
    closingDate: b.closingDate ? new Date(b.closingDate) : null,
    status: b.status, createdById: req.user.id, organizationId: org.id,
  } })
  res.status(201).json(item)
})
export default router
