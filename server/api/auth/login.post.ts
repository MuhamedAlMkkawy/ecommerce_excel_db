import { findUserByEmail, verifyPassword } from '~/server/utils/authExcel'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const email = String(body?.email ?? '').trim().toLowerCase()
  const password = String(body?.password ?? '')

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required' })
  }

  const user = await findUserByEmail(email)


  // Use constant-time comparison to prevent timing attacks
  if (!user || !verifyPassword(password, user.password)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    },
  }
})

