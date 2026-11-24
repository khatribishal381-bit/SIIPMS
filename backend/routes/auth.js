import { Router } from 'express'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import { prisma } from '../db/prisma.js'
import { parse, publicUser, fail } from '../lib/http.js'
import { issueSession, clearSession, requireAuth, requireCsrf } from '../middleware/session.js'

const router = Router()
const password = z.string().min(12).max(128)
const account = z.object({ email: z.string().email().max(254), password })
const register = account.extend({ fullName: z.string().trim().min(2).max(100) })
router.post('/register', async (req, res) => {
  const body = parse(register, req.body)
  const email = body.email.trim().toLowerCase()
  if (await prisma.user.findUnique({ where: { email } })) fail(409, 'Email already registered')
  const user = await prisma.user.create({ data: {
    email, fullName: body.fullName, role: 'STUDENT',
    passwordHash: await bcrypt.hash(body.password, 12),
  } })
  const csrfToken = issueSession(res, user)
  res.status(201).json({ user: publicUser(user), csrfToken })
})
router.post('/login', async (req, res) => {
  const body = parse(account, req.body)
  const email = body.email.trim().toLowerCase()
  const user = await prisma.user.findUnique({ where: { email } })
  // Always use a generic response for unknown email/password combinations.
  if (!user || !user.isActive || (user.lockedUntil && user.lockedUntil > new Date())) {
    fail(401, 'Invalid email or password, or account temporarily unavailable')
  }
  if (!(await bcrypt.compare(body.password, user.passwordHash))) {
    const attempts = user.failedLogins + 1
    await prisma.user.update({ where: { id: user.id }, data: {
      failedLogins: attempts >= 5 ? 0 : attempts,
      lockedUntil: attempts >= 5 ? new Date(Date.now() + 15 * 60_000) : null,
    } })
    fail(401, 'Invalid email or password, or account temporarily unavailable')
  }
  if (user.failedLogins || user.lockedUntil) {
    await prisma.user.update({ where: { id: user.id }, data: { failedLogins: 0, lockedUntil: null } })
  }
  const csrfToken = issueSession(res, user)
  res.json({ user: publicUser(user), csrfToken })
})
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user), csrfToken: req.csrfToken })
})
router.post('/logout', requireAuth, requireCsrf, (_req, res) => {
  clearSession(res)
  res.json({ message: 'Signed out' })
})
export default router
