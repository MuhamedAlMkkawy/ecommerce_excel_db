export default defineEventHandler(async (event) => {
    const rawId = getRouterParam(event, 'id')
    const id = Number(rawId)

    if (isNaN(id)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Product ID must be a valid number',
        })
    }

    const body = await readBody(event)

    if (!body || typeof body !== 'object') {
        throw createError({
            statusCode: 400,
            statusMessage: 'Request body must be a valid JSON object',
        })
    }

    const updatedProduct = updateProduct(id, body)

    return {
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct,
    }
})
