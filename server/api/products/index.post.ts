export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body || typeof body !== 'object') {
        throw createError({
            statusCode: 400,
            statusMessage: 'Request body must be a valid JSON object',
        })
    }

    const newProduct = createProduct(body)

    setResponseStatus(event, 201)
    return {
        success: true,
        message: 'Product created successfully',
        data: newProduct,
    }
})
