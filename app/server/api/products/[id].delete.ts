export default defineEventHandler((event) => {
    const rawId = getRouterParam(event, 'id')
    const id = Number(rawId)

    if (isNaN(id)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Product ID must be a valid number',
        })
    }

    const deletedProduct = deleteProduct(id)

    return {
        success: true,
        message: 'Product deleted successfully',
        data: deletedProduct,
    }
})
