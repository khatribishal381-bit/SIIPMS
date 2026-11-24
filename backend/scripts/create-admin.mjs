import 'dotenv/config'
import bcrypt from 'bcrypt'
import { prisma } from '../db/prisma.js'

const email = process.argv[2]?.trim().toLowerCase()
const password = process.env.SIIPMS_ADMIN_PASSWORD
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length < 12) {
  console.error('Usage: set SIIPMS_ADMIN_PASSWORD (12+ chars) in this terminal, then npm run create:admin -- admin@example.com')
  process.exit(1)
}
try {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new Error('Account already exists; no changes made')
  await prisma.user.create({ data: {
    email, fullName: 'Placement Administrator', role: 'PLACEMENT_ADMIN',
    passwordHash: await bcrypt.hash(password, 12),
  } })
  console.log('Initial administrator created. Use /api/auth/login to sign in.')
} catch (err) {
  console.error(err.message)
  process.exitCode = 1
} finally {
  await prisma.$disconnect()
}
