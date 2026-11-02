import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import process from 'node:process'
import fs from 'node:fs'

const require = createRequire(import.meta.url)
const XLSX = require('xlsx')

export interface Product {
    id: number
    name: string
    category: string
    price: number
    stock: number
    active: boolean
    updatedAt: string
}

const filePath = resolve(
    process.cwd(),
    'data',
    'nuxt-excel-demo.xlsx'
)

const sheetName = 'Products'

function parseDateValue(value: unknown): string {
    if (!value) return new Date().toISOString()
    if (typeof value === 'number') {
        // Excel serial date conversion
        const ms = Math.round((value - 25569) * 86400 * 1000)
        return new Date(ms).toISOString()
    }
    return String(value)
}

export function readProducts(): Product[] {
    if (!fs.existsSync(filePath)) {
        throw createError({
            statusCode: 500,
            statusMessage: `Excel file not found at ${filePath}`,
        })
    }

    const workbook = XLSX.readFile(filePath)
    const sheet = workbook.Sheets[sheetName]

    if (!sheet) {
        throw createError({
            statusCode: 500,
            statusMessage: `Sheet "${sheetName}" not found in Excel file`,
        })
    }

    const raw: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, {
        defval: '',
    })

    return raw.map((item: Record<string, any>): Product => ({
        id: Number(item.id),
        name: String(item.name ?? '').trim(),
        category: String(item.category ?? '').trim(),
        price: Number(item.price ?? 0),
        stock: Number(item.stock ?? 0),
        active:
            item.active === true ||
            item.active === 'true' ||
            item.active === 'TRUE' ||
            item.active === 1 ||
            item.active === '1',
        updatedAt: parseDateValue(item.updatedAt),
    }))
}

export function writeProducts(products: Product[]): void {
    if (!fs.existsSync(filePath)) {
        throw createError({
            statusCode: 500,
            statusMessage: `Excel file not found at ${filePath}`,
        })
    }

    const workbook = XLSX.readFile(filePath)

    // Ensure objects have normalized structure in standard column order
    const normalizedRows = products.map((p) => ({
        id: Number(p.id),
        name: String(p.name ?? ''),
        category: String(p.category ?? ''),
        price: Number(p.price ?? 0),
        stock: Number(p.stock ?? 0),
        active: Boolean(p.active),
        updatedAt: String(p.updatedAt ?? new Date().toISOString()),
    }))

    const worksheet = XLSX.utils.json_to_sheet(normalizedRows)

    workbook.Sheets[sheetName] = worksheet

    XLSX.writeFile(workbook, filePath)
}

export function getAllProducts(filters?: {
    search?: string
    category?: string
    active?: string | boolean | number
    sortBy?: string
    order?: 'asc' | 'desc'
}): Product[] {
    let products = readProducts()

    if (filters?.category) {
        const cat = filters.category.toLowerCase().trim()
        products = products.filter((p) => p.category.toLowerCase() === cat)
    }

    if (filters?.search) {
        const search = filters.search.toLowerCase().trim()
        products = products.filter(
            (p) =>
                p.name.toLowerCase().includes(search) ||
                p.category.toLowerCase().includes(search)
        )
    }

    if (filters?.active !== undefined) {
        const isActive =
            filters.active === true ||
            filters.active === 'true' ||
            filters.active === 1 ||
            filters.active === '1'
        products = products.filter((p) => p.active === isActive)
    }

    if (filters?.sortBy) {
        const key = filters.sortBy as keyof Product
        const orderFactor = filters.order === 'desc' ? -1 : 1
        products.sort((a, b) => {
            const valA = a[key]
            const valB = b[key]
            if (typeof valA === 'number' && typeof valB === 'number') {
                return (valA - valB) * orderFactor
            }
            return String(valA).localeCompare(String(valB)) * orderFactor
        })
    }

    return products
}

export function getProductById(id: number): Product {
    const products = readProducts()
    const product = products.find((p) => p.id === id)

    if (!product) {
        throw createError({
            statusCode: 404,
            statusMessage: `Product with id ${id} not found`,
        })
    }

    return product
}

export function createProduct(payload: {
    name: string
    category: string
    price: number | string
    stock: number | string
    active?: boolean | string | number
}): Product {
    if (!payload.name || typeof payload.name !== 'string' || !payload.name.trim()) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Field "name" is required and must be a non-empty string',
        })
    }

    if (!payload.category || typeof payload.category !== 'string' || !payload.category.trim()) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Field "category" is required and must be a non-empty string',
        })
    }

    const price = Number(payload.price)
    if (isNaN(price) || price < 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Field "price" must be a valid non-negative number',
        })
    }

    const stock = Number(payload.stock)
    if (isNaN(stock) || stock < 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Field "stock" must be a valid non-negative integer',
        })
    }

    const products = readProducts()

    // Generate new unique ID
    const maxId = products.reduce((max, p) => (p.id > max ? p.id : max), 0)
    const newId = maxId + 1

    const newProduct: Product = {
        id: newId,
        name: payload.name.trim(),
        category: payload.category.trim(),
        price,
        stock: Math.floor(stock),
        active:
            payload.active === undefined
                ? true
                : payload.active === true ||
                  payload.active === 'true' ||
                  payload.active === 1 ||
                  payload.active === '1',
        updatedAt: new Date().toISOString(),
    }

    products.push(newProduct)
    writeProducts(products)

    return newProduct
}

export function updateProduct(
    id: number,
    payload: Partial<{
        name: string
        category: string
        price: number | string
        stock: number | string
        active: boolean | string | number
    }>
): Product {
    const products = readProducts()
    const index = products.findIndex((p) => p.id === id)

    if (index === -1) {
        throw createError({
            statusCode: 404,
            statusMessage: `Product with id ${id} not found`,
        })
    }

    const current = products[index]
    if (!current) {
        throw createError({
            statusCode: 404,
            statusMessage: `Product with id ${id} not found`,
        })
    }

    if (payload.name !== undefined) {
        if (typeof payload.name !== 'string' || !payload.name.trim()) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Field "name" cannot be empty',
            })
        }
        current.name = payload.name.trim()
    }

    if (payload.category !== undefined) {
        if (typeof payload.category !== 'string' || !payload.category.trim()) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Field "category" cannot be empty',
            })
        }
        current.category = payload.category.trim()
    }

    if (payload.price !== undefined) {
        const price = Number(payload.price)
        if (isNaN(price) || price < 0) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Field "price" must be a valid non-negative number',
            })
        }
        current.price = price
    }

    if (payload.stock !== undefined) {
        const stock = Number(payload.stock)
        if (isNaN(stock) || stock < 0) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Field "stock" must be a valid non-negative integer',
            })
        }
        current.stock = Math.floor(stock)
    }

    if (payload.active !== undefined) {
        current.active =
            payload.active === true ||
            payload.active === 'true' ||
            payload.active === 1 ||
            payload.active === '1'
    }

    current.updatedAt = new Date().toISOString()
    products[index] = current

    writeProducts(products)

    return current
}

export function deleteProduct(id: number): Product {
    const products = readProducts()
    const index = products.findIndex((p) => p.id === id)

    if (index === -1) {
        throw createError({
            statusCode: 404,
            statusMessage: `Product with id ${id} not found`,
        })
    }

    const target = products[index]
    if (!target) {
        throw createError({
            statusCode: 404,
            statusMessage: `Product with id ${id} not found`,
        })
    }

    products.splice(index, 1)
    writeProducts(products)

    return target
}
