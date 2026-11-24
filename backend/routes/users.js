import { Router } from 'express'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import { prisma } from '../db/prisma.js'
import { parse, publicUser } from '../lib/http.js'
import { requireAuth, requireRole, requireCsrf } from '../middleware/session.js'
import { ROLES } from '../lib/rules.js'

const router = Router()
router.use(requireAuth, requireRole(ROLES.ADMIN))
router.get('/', async (req, res) => {
  const role = Object.values(ROLES).includes(req.query.role) ? req.query.role : undefined
  const users = await prisma.user.findMany({ where: role ? { role } : {}, orderBy: { createdAt: 'desc' } })
  res.json(users.map(publicUser))
})
router.post('/', requireCsrf, async (req, res) => {
  const data = parse(z.object({
    fullName: z.string().trim().min(2).max(100),
    email: z.string().email().max(254),
    password: z.string().min(12).max(128),
    role: z.enum(Object.values(ROLES)),
    organizationId: z.string().uuid().optional(),
  }), req.body)
  const user = await prisma.user.create({ data: {
    fullName: data.fullName, email: data.email.trim().toLowerCase(),
    passwordHash: await bcrypt.hash(data.password, 12), role: data.role,
    organizationId: data.organizationId ?? null,
  } })
  res.status(201).json(publicUser(user))
})
export default router
