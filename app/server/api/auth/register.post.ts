import { createUser } from '~/server/utils/authExcel'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const email = String(body?.email ?? '').trim().toLowerCase()
  const password = String(body?.password ?? '')

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required' })
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email format' })
  }

  if (password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Password must be at least 6 characters' })
  }

  const user = createUser(email, password)

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    },
  }
})

