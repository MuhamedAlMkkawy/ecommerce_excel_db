export default defineEventHandler((event) => {
    const query = getQuery(event)

    const products = getAllProducts({
        search: query.search ? String(query.search) : undefined,
        category: query.category ? String(query.category) : undefined,
        active: query.active !== undefined ? String(query.active) : undefined,
        sortBy: query.sortBy ? String(query.sortBy) : undefined,
        order: query.order === 'desc' ? 'desc' : 'asc',
    })

    return {
        success: true,
        count: products.length,
        data: products,
    }
})
