<template>
  <div class="py-8 max-w-5xl mx-auto px-4 sm:px-6">
    <!-- Breadcrumb & Back Button -->
    <div class="mb-6 flex items-center justify-between">
      <NuxtLink
        :to="localePath('/')"
        class="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-emerald-600 transition-colors bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-gray-200 hover:border-emerald-300"
      >
        <i class="pi pi-arrow-left"></i>
        <span>Back to Products</span>
      </NuxtLink>

      <div class="flex items-center gap-3">
        <button
          @click="toggleEditMode"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-sm"
          :class="isEditing ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'"
        >
          <i :class="isEditing ? 'pi pi-times' : 'pi pi-pencil'"></i>
          <span>{{ isEditing ? 'Cancel Edit' : 'Edit Product' }}</span>
        </button>

        <button
          @click="showDeleteConfirm = true"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors border border-red-200"
        >
          <i class="pi pi-trash"></i>
          <span>Delete</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
      <div class="inline-block animate-spin text-emerald-600 text-4xl mb-4">
        <i class="pi pi-spin pi-spinner"></i>
      </div>
      <p class="text-gray-500 font-medium">Loading product details from Excel...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error || !product" class="bg-white rounded-3xl p-16 text-center shadow-sm border border-red-100">
      <div class="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4 text-2xl">
        <i class="pi pi-exclamation-triangle"></i>
      </div>
      <h2 class="text-xl font-bold text-gray-900 mb-2">Product Not Found</h2>
      <p class="text-gray-500 mb-6">{{ error?.statusMessage || 'The requested product could not be found in the Excel database.' }}</p>
      <NuxtLink
        :to="localePath('/')"
        class="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-2xl text-sm font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
      >
        <i class="pi pi-arrow-left"></i>
        <span>Return to Products</span>
      </NuxtLink>
    </div>

    <!-- Product Content -->
    <div v-else class="space-y-6">
      <!-- Header Banner Card -->
      <div class="bg-gradient-to-r from-gray-950 via-gray-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-white/10">
        <div class="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <i class="pi pi-box text-9xl"></i>
        </div>

        <div class="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-emerald-400 border border-white/10">
                Product #{{ product.id }}
              </span>
              <span
                class="px-3 py-1 rounded-full text-xs font-semibold"
                :class="product.active ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'"
              >
                {{ product.active ? '● Active' : '○ Inactive' }}
              </span>
            </div>
            <h1 class="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {{ product.name }}
            </h1>
            <p class="text-gray-400 text-sm mt-1 flex items-center gap-2">
              <i class="pi pi-tag text-xs text-emerald-400"></i>
              <span>Category: <strong class="text-gray-200">{{ product.category }}</strong></span>
            </p>
          </div>

          <div class="text-right bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 min-w-[140px]">
            <span class="text-xs uppercase text-gray-400 font-semibold tracking-wider block">Price</span>
            <span class="text-3xl font-extrabold text-emerald-400">
              ${{ Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Edit Form (when isEditing is true) with Defined Border Colors and Category Select -->
      <div v-if="isEditing" class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border-2 border-emerald-500/30 ring-4 ring-emerald-500/5">
        <div class="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
          <div>
            <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
              <i class="pi pi-pencil text-emerald-600"></i>
              <span>Edit Product Data</span>
            </h2>
            <p class="text-xs text-gray-500 mt-0.5">Saves directly into data/nuxt-excel-demo.xlsx</p>
          </div>
        </div>

        <form @submit.prevent="saveProduct" class="space-y-5">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <!-- Name in div.input -->
            <div class="sm:col-span-2 input-wrap">
              <label>Product Name <span class="text-red-500">*</span></label>
              <div class="input">
                <i class="pi pi-box"></i>
                <input
                  v-model="editForm.name"
                  type="text"
                  required
                  placeholder="e.g. Wireless Mouse"
                />
              </div>
            </div>

            <!-- Category Select in div.input -->
            <div class="sm:col-span-2 input-wrap">
              <label>Category <span class="text-red-500">*</span></label>
              <div class="input">
                <i class="pi pi-tag pointer-events-none"></i>
                <select v-model="categorySelection" required>
                  <option value="" disabled>-- Select Category or Add New --</option>
                  <option v-for="cat in availableCategories" :key="cat" :value="cat">
                    {{ cat }}
                  </option>
                  <option value="__NEW__" class="font-bold text-emerald-600">
                    + Add New Category...
                  </option>
                </select>
                <i class="pi pi-chevron-down pointer-events-none ml-auto text-xs"></i>
              </div>

              <!-- New Category Input in div.input if __NEW__ chosen -->
              <div v-if="categorySelection === '__NEW__'" class="mt-2.5">
                <label class="!text-emerald-700">Enter New Category Name <span class="text-red-500">*</span></label>
                <div class="input !border-emerald-400 focus-within:!border-emerald-600">
                  <i class="pi pi-plus-circle !text-emerald-600"></i>
                  <input
                    v-model="customCategoryInput"
                    type="text"
                    required
                    placeholder="e.g. Smart Home, Gaming..."
                  />
                </div>
              </div>
            </div>

            <!-- Price in div.input -->
            <div class="input-wrap">
              <label>Price ($) <span class="text-red-500">*</span></label>
              <div class="input">
                <i class="pi pi-dollar"></i>
                <input
                  v-model.number="editForm.price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            <!-- Stock in div.input -->
            <div class="input-wrap">
              <label>Stock Quantity <span class="text-red-500">*</span></label>
              <div class="input">
                <i class="pi pi-database"></i>
                <input
                  v-model.number="editForm.stock"
                  type="number"
                  min="0"
                  required
                />
              </div>
            </div>


            <!-- Active Status -->
            <div class="sm:col-span-2 flex items-center pt-2">
              <label class="relative flex items-center gap-3 cursor-pointer select-none">
                <input
                  v-model="editForm.active"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                <span class="text-sm font-semibold text-gray-800">
                  {{ editForm.active ? 'Active Product (Ready for Sale)' : 'Inactive (Archived)' }}
                </span>
              </label>
            </div>
          </div>

          <div class="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              @click="cancelEdit"
              class="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
            >
              <i v-if="saving" class="pi pi-spin pi-spinner"></i>
              <i v-else class="pi pi-check"></i>
              <span>{{ saving ? 'Saving Changes...' : 'Save to Excel' }}</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Details Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Card 1: Inventory Info -->
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
              <i class="pi pi-box"></i>
            </div>
            <div>
              <h3 class="text-sm font-bold text-gray-900">Inventory Status</h3>
              <p class="text-xs text-gray-400">Units in stock</p>
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between py-2 border-b border-gray-50 text-sm">
              <span class="text-gray-500">Available Stock:</span>
              <span class="font-bold text-gray-900 text-base">{{ product.stock }} units</span>
            </div>

            <div class="flex items-center justify-between py-2 border-b border-gray-50 text-sm">
              <span class="text-gray-500">Stock Status:</span>
              <span
                class="px-2.5 py-1 rounded-full text-xs font-semibold"
                :class="getStockBadgeClass(product.stock)"
              >
                {{ getStockStatusText(product.stock) }}
              </span>
            </div>

            <div class="flex items-center justify-between py-2 text-sm">
              <span class="text-gray-500">Total Value:</span>
              <span class="font-bold text-emerald-600">
                ${{ (Number(product.price) * Number(product.stock)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Card 2: Categorization -->
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
              <i class="pi pi-tag"></i>
            </div>
            <div>
              <h3 class="text-sm font-bold text-gray-900">Classification</h3>
              <p class="text-xs text-gray-400">Department & Category</p>
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between py-2 border-b border-gray-50 text-sm">
              <span class="text-gray-500">Category:</span>
              <span class="font-semibold text-gray-900 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                {{ product.category }}
              </span>
            </div>

            <div class="flex items-center justify-between py-2 border-b border-gray-50 text-sm">
              <span class="text-gray-500">Unique ID:</span>
              <span class="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                #{{ product.id }}
              </span>
            </div>

            <div class="flex items-center justify-between py-2 text-sm">
              <span class="text-gray-500">Visibility:</span>
              <span class="font-medium" :class="product.active ? 'text-emerald-600' : 'text-gray-400'">
                {{ product.active ? 'Published' : 'Hidden' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Card 3: Excel Metadata -->
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg">
              <i class="pi pi-file-excel"></i>
            </div>
            <div>
              <h3 class="text-sm font-bold text-gray-900">Excel Sync Info</h3>
              <p class="text-xs text-gray-400">Storage & Timestamps</p>
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between py-2 border-b border-gray-50 text-sm">
              <span class="text-gray-500">Target File:</span>
              <span class="font-mono text-xs text-gray-700 truncate max-w-[150px]" title="data/nuxt-excel-demo.xlsx">
                nuxt-excel-demo.xlsx
              </span>
            </div>

            <div class="flex items-center justify-between py-2 border-b border-gray-50 text-sm">
              <span class="text-gray-500">Sheet:</span>
              <span class="font-semibold text-gray-800">Products</span>
            </div>

            <div class="flex items-center justify-between py-2 text-sm">
              <span class="text-gray-500">Last Modified:</span>
              <span class="text-xs font-medium text-gray-600">
                {{ formatDate(product.updatedAt) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal (Fixed 100vh Backdrop) -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 top-0 left-0 w-screen h-screen min-h-screen z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto"
    >
      <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-gray-100 my-auto animate-in fade-in zoom-in-95 duration-200">
        <div class="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-xl mb-4">
          <i class="pi pi-exclamation-triangle"></i>
        </div>

        <h3 class="text-lg font-bold text-gray-900 mb-2">Delete Product</h3>
        <p class="text-sm text-gray-500 mb-6">
          Are you sure you want to permanently delete <strong class="text-gray-800">"{{ product?.name }}"</strong>? This action will immediately remove the row from the Excel file.
        </p>

        <div class="flex items-center justify-end gap-3">
          <button
            type="button"
            @click="showDeleteConfirm = false"
            class="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="deleteProduct"
            :disabled="deleting"
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20 transition disabled:opacity-50"
          >
            <i v-if="deleting" class="pi pi-spin pi-spinner"></i>
            <i v-else class="pi pi-trash"></i>
            <span>{{ deleting ? 'Deleting...' : 'Confirm Delete' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const { showSuccessToast, showErrorToast } = useToastMsg()

const productId = computed(() => route.params.id)

const product = ref(null)
const loading = ref(true)
const error = ref(null)

const isEditing = ref(route.query.edit === 'true')
const saving = ref(false)
const showDeleteConfirm = ref(false)
const deleting = ref(false)

const availableCategories = ref([])
const categorySelection = ref('')
const customCategoryInput = ref('')

const editForm = reactive({
  name: '',
  price: 0,
  stock: 0,
  active: true,
})

const fetchProduct = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await $fetch(`/api/products/${productId.value}`)
    if (res?.data) {
      product.value = res.data
      resetEditForm()
    } else {
      error.value = { statusMessage: 'Product not found' }
    }

    // Also fetch all categories for the dropdown
    const allRes = await $fetch('/api/products')
    if (allRes?.data) {
      const cats = new Set(allRes.data.map((p) => p.category).filter(Boolean))
      availableCategories.value = Array.from(cats)
      syncCategorySelection()
    }
  } catch (err) {
    error.value = err
  } finally {
    loading.value = false
  }
}

const syncCategorySelection = () => {
  if (!product.value) return
  if (availableCategories.value.includes(product.value.category)) {
    categorySelection.value = product.value.category
    customCategoryInput.value = ''
  } else {
    categorySelection.value = '__NEW__'
    customCategoryInput.value = product.value.category
  }
}

const resetEditForm = () => {
  if (product.value) {
    editForm.name = product.value.name
    editForm.price = product.value.price
    editForm.stock = product.value.stock
    editForm.active = Boolean(product.value.active)
    syncCategorySelection()
  }
}

const toggleEditMode = () => {
  if (isEditing.value) {
    cancelEdit()
  } else {
    resetEditForm()
    isEditing.value = true
  }
}

const cancelEdit = () => {
  resetEditForm()
  isEditing.value = false
}

const saveProduct = async () => {
  const finalCategory = categorySelection.value === '__NEW__'
    ? customCategoryInput.value.trim()
    : categorySelection.value.trim()

  if (!finalCategory) {
    showErrorToast('Please select or enter a category')
    return
  }

  saving.value = true
  try {
    const res = await $fetch(`/api/products/${productId.value}`, {
      method: 'PUT',
      body: {
        name: editForm.name,
        category: finalCategory,
        price: Number(editForm.price),
        stock: Number(editForm.stock),
        active: Boolean(editForm.active),
      },
    })

    if (res?.data) {
      product.value = res.data
      if (!availableCategories.value.includes(finalCategory)) {
        availableCategories.value.push(finalCategory)
      }
      isEditing.value = false
      showSuccessToast('Product updated successfully in Excel!')
    }
  } catch (err) {
    showErrorToast(err?.statusMessage || 'Failed to update product')
  } finally {
    saving.value = false
  }
}

const deleteProduct = async () => {
  deleting.value = true
  try {
    await $fetch(`/api/products/${productId.value}`, {
      method: 'DELETE',
    })
    showSuccessToast('Product deleted from Excel')
    showDeleteConfirm.value = false
    router.push(localePath('/'))
  } catch (err) {
    showErrorToast(err?.statusMessage || 'Failed to delete product')
  } finally {
    deleting.value = false
  }
}

const getStockBadgeClass = (stock) => {
  const s = Number(stock)
  if (s <= 0) return 'bg-red-100 text-red-700'
  if (s < 10) return 'bg-amber-100 text-amber-700'
  return 'bg-emerald-100 text-emerald-700'
}

const getStockStatusText = (stock) => {
  const s = Number(stock)
  if (s <= 0) return 'Out of Stock'
  if (s < 10) return 'Low Stock'
  return 'In Stock'
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

onMounted(() => {
  fetchProduct()
})
</script>
