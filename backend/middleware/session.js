import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import { prisma } from '../db/prisma.js'
import { HttpError } from '../lib/http.js'

const cookieName = 'siipms_session'
function secret() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must have at least 32 characters')
  }
  return process.env.JWT_SECRET
}
export function issueSession(res, user) {
  const csrfToken = crypto.randomBytes(24).toString('hex')
  const session = jwt.sign({ sub: user.id, csrf: csrfToken }, secret(), {
    expiresIn: '15m', issuer: 'siipms', audience: 'siipms-web', algorithm: 'HS256',
  })
  res.cookie(cookieName, session, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax',
    path: '/api', maxAge: 15 * 60 * 1000,
  })
  return csrfToken
}
export function clearSession(res) {
  res.clearCookie(cookieName, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/api',
  })
}
export async function requireAuth(req, _res, next) {
  try {
    const token = req.cookies?.[cookieName]
    if (!token) return next(new HttpError(401, 'Please sign in'))
    let payload
    try {
      payload = jwt.verify(token, secret(), { issuer: 'siipms', audience: 'siipms-web', algorithms: ['HS256'] })
    } catch { return next(new HttpError(401, 'Session expired or invalid')) }
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user || !user.isActive) return next(new HttpError(401, 'Account unavailable'))
    req.user = user
    req.csrfToken = payload.csrf
    next()
  } catch (e) { next(e) }
}
export function requireRole(...roles) {
  return (req, _res, next) => req.user && roles.includes(req.user.role)
    ? next() : next(new HttpError(403, 'Access denied'))
}
export function requireCsrf(req, _res, next) {
  const a = Buffer.from(String(req.get('x-csrf-token') || ''), 'utf8')
  const b = Buffer.from(String(req.csrfToken || ''), 'utf8')
  if (a.length === b.length && a.length > 0 && crypto.timingSafeEqual(a, b)) return next()
  next(new HttpError(403, 'CSRF token missing or invalid'))
}
