import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { rateLimit } from 'express-rate-limit'
import auth from './routes/auth.js'
import users from './routes/users.js'
import opportunities from './routes/opportunities.js'
import applications from './routes/applications.js'
import placements from './routes/placements.js'
import logbooks from './routes/logbooks.js'
import { HttpError } from './lib/http.js'

export const app = express()
const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
app.disable('x-powered-by')
app.use(helmet())
app.use(cors({ origin: allowedOrigin, credentials: true }))
app.use(express.json({ limit: '100kb' }))
app.use(cookieParser())
app.use('/api', (req, _res, next) => {
  // Reject browser requests coming from unexpected origins. CLI calls without Origin are allowed,
  // but authenticated mutating routes still require a session-specific CSRF token.
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.get('origin') && req.get('origin') !== allowedOrigin) {
    return next(new HttpError(403, 'Origin not allowed'))
  }
  next()
})
app.get('/api/health', (_req, res) => res.json({ status: 'ok', project: 'SIIPMS', message: 'Backend is working' }))
const loginLimit = rateLimit({ windowMs: 15 * 60_000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false })
app.use('/api/auth', loginLimit, auth)
app.use('/api/users', users)
app.use('/api/opportunities', opportunities)
app.use('/api/applications', applications)
app.use('/api/placements', placements)
app.use('/api/logbooks', logbooks)
app.use('/api', (_req, _res, next) => next(new HttpError(404, 'Endpoint not found')))
app.use((err, _req, res, _next) => {
  if (err?.code === 'P2002') return res.status(409).json({ error: 'Record already exists' })
  if (err?.code === 'P2003') return res.status(400).json({ error: 'Invalid related record' })
  const status = Number.isInteger(err?.status) && err.status >= 400 && err.status < 600 ? err.status : 500
  if (status === 500) console.error(err)
  res.status(status).json({ error: status === 500 ? 'Internal server error' : err.message })
})
