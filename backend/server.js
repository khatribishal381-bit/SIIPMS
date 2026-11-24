import 'dotenv/config'
import { app } from './app.js'
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET is missing or too short. Run the installer first.')
}
const port = Number(process.env.PORT || 5000)
app.listen(port, () => console.log(`SIIPMS backend running on http://localhost:${port}`))
