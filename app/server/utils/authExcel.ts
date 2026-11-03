import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const XLSX = require('xlsx')
import { resolve } from 'node:path'
import process from 'node:process'
import fs from 'node:fs'
import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto'


// ── Password hashing helpers (Node crypto / scrypt) ──────────────────────────

const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, dkLen: 64 } as const

/** Hash a plain-text password → "salt:hash" (hex-encoded, safe to store). */
export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(plain, salt, SCRYPT_PARAMS.dkLen, {
    N: SCRYPT_PARAMS.N,
    r: SCRYPT_PARAMS.r,
    p: SCRYPT_PARAMS.p,
  }).toString('hex')
  return `${salt}:${hash}`
}

/** Verify a plain-text password against a stored "salt:hash" string. */
export function verifyPassword(plain: string, stored: string): boolean {
  const [salt, storedHash] = stored.split(':')
  if (!salt || !storedHash) return false
  const derivedHash = scryptSync(plain, salt, SCRYPT_PARAMS.dkLen, {
    N: SCRYPT_PARAMS.N,
    r: SCRYPT_PARAMS.r,
    p: SCRYPT_PARAMS.p,
  })
  const storedBuf = Buffer.from(storedHash, 'hex')
  // timingSafeEqual prevents timing attacks
  return derivedHash.length === storedBuf.length && timingSafeEqual(derivedHash, storedBuf)
}

export interface AuthUser {
  id: number
  email: string
  password: string // stored as scrypt hash: "salt:hash"
  createdAt: string
}

const filePath = resolve(process.cwd(), 'data', 'auth_users.xlsx')
const sheetName = 'Users'

/** Ensure auth_users.xlsx and the Users sheet exist; create both if needed */
function ensureSheet(): void {
  // Make sure the data/ directory exists
  const dir = resolve(process.cwd(), 'data')
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  let workbook: any

  if (fs.existsSync(filePath)) {
    workbook = XLSX.readFile(filePath)
  } else {
    workbook = XLSX.utils.book_new()
  }

  if (!workbook.Sheets[sheetName]) {
    const ws = XLSX.utils.json_to_sheet([], {
      header: ['id', 'email', 'password', 'createdAt'],
    })
    XLSX.utils.book_append_sheet(workbook, ws, sheetName)
    XLSX.writeFile(workbook, filePath)
  }
}

export function readUsers(): AuthUser[] {
  ensureSheet()
  const workbook = XLSX.readFile(filePath)
  const sheet = workbook.Sheets[sheetName]
  const raw: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, {
    defval: '',
  })
  return raw.map((r) => ({
    id: Number(r.id),
    email: String(r.email ?? '').trim().toLowerCase(),
    password: String(r.password ?? ''),
    createdAt: String(r.createdAt ?? ''),
  }))
}

export function writeUsers(users: AuthUser[]): void {
  ensureSheet()
  const workbook = XLSX.readFile(filePath)
  const rows = users.map((u) => ({
    id: u.id,
    email: u.email,
    password: u.password,
    createdAt: u.createdAt,
  }))
  workbook.Sheets[sheetName] = XLSX.utils.json_to_sheet(rows)
  XLSX.writeFile(workbook, filePath)
}

export function findUserByEmail(email: string): AuthUser | undefined {
  return readUsers().find((u) => u.email === email.trim().toLowerCase())
}

export function createUser(email: string, password: string): AuthUser {
  const users = readUsers()
  const exists = users.find(
    (u) => u.email === email.trim().toLowerCase()
  )
  if (exists) {
    throw createError({ statusCode: 409, statusMessage: 'Email already registered' })
  }
  const maxId = users.reduce((m, u) => (u.id > m ? u.id : m), 0)
  const newUser: AuthUser = {
    id: maxId + 1,
    email: email.trim().toLowerCase(),
    password: hashPassword(password),   // ← hashed, never plain text
    createdAt: new Date().toISOString(),
  }
  users.push(newUser)
  writeUsers(users)
  return newUser
}

