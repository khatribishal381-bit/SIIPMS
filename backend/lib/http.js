export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}
export const fail = (status, message) => { throw new HttpError(status, message) }
export function parse(schema, body) {
  const result = schema.safeParse(body)
  if (!result.success) {
    throw new HttpError(400, result.error.issues.map(x => `${x.path.join('.') || 'input'}: ${x.message}`).join('; '))
  }
  return result.data
}
export function publicUser(user) {
  return { id: user.id, email: user.email, fullName: user.fullName, role: user.role }
}
