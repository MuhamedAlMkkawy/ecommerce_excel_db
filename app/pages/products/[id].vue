<template>
  <div class="py-8 max-w-5xl mx-auto px-4 sm:px-6">
    <div class="mb-6 flex items-center justify-between">
      <NuxtLink
        :to="localePath('/')"
        class="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-emerald-600 transition-colors bg-white dark:bg-gray-900 px-4 py-2.5 rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 hover:border-emerald-300"
      >
        <i class="pi pi-arrow-left rtl:rotate-180"></i>
        <span>{{ $t('product_detail.back') }}</span>
      </NuxtLink>

      <div class="flex items-center gap-3">
        <button
          @click="toggleEditMode"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-sm"
          :class="isEditing ? 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/20 border border-gray-300 dark:border-white/10' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'"
        >
          <i :class="isEditing ? 'pi pi-times' : 'pi pi-pencil'"></i>
          <span>{{ isEditing ? $t('product_detail.cancel_edit') : $t('product_detail.edit_product') }}</span>
        </button>

        <button
          @click="showDeleteConfirm = true"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-700 transition-colors border border-red-200 dark:border-red-500/20"
        >
          <i class="pi pi-trash"></i>
          <span>{{ $t('product_detail.delete') }}</span>
        </button>
      </div>
    </div>

    <div v-if="loading" class="bg-white dark:bg-gray-900 rounded-3xl p-16 text-center shadow-sm border border-gray-100 dark:border-white/10">
      <div class="inline-block animate-spin text-emerald-600 text-4xl mb-4">
        <i class="pi pi-spin pi-spinner"></i>
      </div>
      <p class="text-gray-500 font-medium">{{ $t('product_detail.loading') }}</p>
    </div>

    <div v-else-if="error || !product" class="bg-white dark:bg-gray-900 rounded-3xl p-16 text-center shadow-sm border border-red-100 dark:border-red-500/20">
      <div class="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4 text-2xl">
        <i class="pi pi-exclamation-triangle"></i>
      </div>
      <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ $t('product_detail.not_found') }}</h2>
      <p class="text-gray-500 mb-6">{{ error?.statusMessage || $t('product_detail.not_found_sub') }}</p>
      <NuxtLink
        :to="localePath('/')"
        class="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-2xl text-sm font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
      >
        <i class="pi pi-arrow-left rtl:rotate-180"></i>
        <span>{{ $t('product_detail.return') }}</span>
      </NuxtLink>
    </div>

    <div v-else class="space-y-6">
      <div class="bg-gradient-to-r from-gray-100 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 rounded-3xl p-6 sm:p-8 text-gray-900 dark:text-white shadow-xl relative overflow-hidden border border-gray-200 dark:border-white/10">
        <div class="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <i class="pi pi-box text-9xl"></i>
        </div>

        <div class="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/5 dark:bg-white/10 text-emerald-600 dark:text-emerald-400 border border-black/5 dark:border-white/10">
                {{ $t('product_detail.product_id', { id: product.id }) }}
              </span>
              <span
                class="px-3 py-1 rounded-full text-xs font-semibold"
                :class="product.active ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-600 dark:text-red-300 border border-red-500/30'"
              >
                {{ product.active ? $t('product_detail.active') : $t('product_detail.inactive') }}
              </span>
            </div>
            <h1 class="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {{ product.name }}
            </h1>
            <p class="text-gray-500 dark:text-gray-400 text-sm mt-1 flex items-center gap-2">
              <i class="pi pi-tag text-xs text-emerald-500 dark:text-emerald-400"></i>
              <span>{{ $t('product_detail.category') }} <strong class="text-gray-800 dark:text-gray-200">{{ product.category }}</strong></span>
            </p>
          </div>

          <div class="text-end bg-black/5 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl p-4 min-w-[140px]">
            <span class="text-xs uppercase text-gray-400 font-semibold tracking-wider block">{{ $t('product_detail.price') }}</span>
            <span class="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              ${{ Number(product.price).toLocaleString(numberLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="isEditing" class="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-sm border-2 border-emerald-500/30 ring-4 ring-emerald-500/5">
        <div class="flex items-center justify-between pb-4 mb-6 border-b border-gray-100 dark:border-white/10">
          <div>
            <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <i class="pi pi-pencil text-emerald-600"></i>
              <span>{{ $t('product_detail.edit_title') }}</span>
            </h2>
            <p class="text-xs text-gray-500 mt-0.5">{{ $t('product_detail.edit_subtitle') }}</p>
          </div>
        </div>

        <form @submit.prevent="saveProduct" class="space-y-5">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div class="sm:col-span-2 input-wrap">
              <label>{{ $t('product_detail.name_label') }} <span class="text-red-500">*</span></label>
              <div class="input">
                <i class="pi pi-box"></i>
                <input
                  v-model="editForm.name"
                  type="text"
                  required
                  :placeholder="$t('product_detail.name_placeholder')"
                />
              </div>
            </div>

            <div class="sm:col-span-2 input-wrap">
              <label>{{ $t('product_detail.category_label') }} <span class="text-red-500">*</span></label>
              <div class="input">
                <i class="pi pi-tag pointer-events-none"></i>
                <select v-model="categorySelection" required>
                  <option value="" disabled>{{ $t('product_detail.category_placeholder') }}</option>
                  <option v-for="cat in availableCategories" :key="cat" :value="cat">
                    {{ cat }}
                  </option>
                  <option value="__NEW__">
                    {{ $t('product_detail.new_category') }}
                  </option>
                </select>
                <i class="pi pi-chevron-down pointer-events-none ms-auto text-xs"></i>
              </div>

              <div v-if="categorySelection === '__NEW__'" class="mt-2.5">
                <label class="!text-emerald-700 dark:!text-emerald-400">{{ $t('product_detail.new_category_label') }} <span class="text-red-500">*</span></label>
                <div class="input !border-emerald-400 focus-within:!border-emerald-600">
                  <i class="pi pi-plus-circle !text-emerald-600"></i>
                  <input
                    v-model="customCategoryInput"
                    type="text"
                    required
                    :placeholder="$t('product_detail.new_category_placeholder')"
                  />
                </div>
              </div>
            </div>

            <div class="input-wrap">
              <label>{{ $t('product_detail.price_label') }} <span class="text-red-500">*</span></label>
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

            <div class="input-wrap">
              <label>{{ $t('product_detail.stock_label') }} <span class="text-red-500">*</span></label>
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

            <div class="sm:col-span-2 flex items-center pt-2">
              <label class="relative flex items-center gap-3 cursor-pointer select-none">
                <input
                  v-model="editForm.active"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                <span class="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {{ editForm.active ? $t('product_detail.active_label') : $t('product_detail.inactive_label') }}
                </span>
              </label>
            </div>
          </div>

          <div class="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-white/10">
            <button
              type="button"
              @click="cancelEdit"
              class="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition"
            >
              {{ $t('product_detail.btn_cancel') }}
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
            >
              <i v-if="saving" class="pi pi-spin pi-spinner"></i>
              <i v-else class="pi pi-check"></i>
              <span>{{ saving ? $t('product_detail.btn_saving') : $t('product_detail.btn_save') }}</span>
            </button>
          </div>
        </form>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-white/10">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg">
              <i class="pi pi-box"></i>
            </div>
            <div>
              <h3 class="text-sm font-bold text-gray-900 dark:text-white">{{ $t('product_detail.inventory.title') }}</h3>
              <p class="text-xs text-gray-400">{{ $t('product_detail.inventory.subtitle') }}</p>
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between py-2 border-b border-gray-50 dark:border-white/10 text-sm">
              <span class="text-gray-500">{{ $t('product_detail.inventory.available') }}</span>
              <span class="font-bold text-gray-900 dark:text-white text-base">{{ product.stock }} {{ $t('product_detail.inventory.units') }}</span>
            </div>

            <div class="flex items-center justify-between py-2 border-b border-gray-50 dark:border-white/10 text-sm">
              <span class="text-gray-500">{{ $t('product_detail.inventory.status') }}</span>
              <span
                class="px-2.5 py-1 rounded-full text-xs font-semibold"
                :class="getStockBadgeClass(product.stock)"
              >
                {{ getStockStatusText(product.stock) }}
              </span>
            </div>

            <div class="flex items-center justify-between py-2 text-sm">
              <span class="text-gray-500">{{ $t('product_detail.inventory.total_value') }}</span>
              <span class="font-bold text-emerald-600">
                ${{ (Number(product.price) * Number(product.stock)).toLocaleString(numberLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
              </span>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-white/10">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg">
              <i class="pi pi-tag"></i>
            </div>
            <div>
              <h3 class="text-sm font-bold text-gray-900 dark:text-white">{{ $t('product_detail.classification.title') }}</h3>
              <p class="text-xs text-gray-400">{{ $t('product_detail.classification.subtitle') }}</p>
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between py-2 border-b border-gray-50 dark:border-white/10 text-sm">
              <span class="text-gray-500">{{ $t('product_detail.classification.category') }}</span>
              <span class="font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-white/5 px-3 py-1 rounded-lg border border-gray-100 dark:border-white/10">
                {{ product.category }}
              </span>
            </div>

            <div class="flex items-center justify-between py-2 border-b border-gray-50 dark:border-white/10 text-sm">
              <span class="text-gray-500">{{ $t('product_detail.classification.id') }}</span>
              <span class="font-mono text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded">
                #{{ product.id }}
              </span>
            </div>

            <div class="flex items-center justify-between py-2 text-sm">
              <span class="text-gray-500">{{ $t('product_detail.classification.visibility') }}</span>
              <span class="font-medium" :class="product.active ? 'text-emerald-600' : 'text-gray-400'">
                {{ product.active ? $t('product_detail.classification.published') : $t('product_detail.classification.hidden') }}
              </span>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-white/10">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg">
              <i class="pi pi-file-excel"></i>
            </div>
            <div>
              <h3 class="text-sm font-bold text-gray-900 dark:text-white">{{ $t('product_detail.excel_info.title') }}</h3>
              <p class="text-xs text-gray-400">{{ $t('product_detail.excel_info.subtitle') }}</p>
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between py-2 border-b border-gray-50 dark:border-white/10 text-sm">
              <span class="text-gray-500">{{ $t('product_detail.excel_info.file') }}</span>
              <span class="font-mono text-xs text-gray-700 dark:text-gray-300 truncate max-w-[150px]" title="data/nuxt-excel-demo.xlsx">
                nuxt-excel-demo.xlsx
              </span>
            </div>

            <div class="flex items-center justify-between py-2 border-b border-gray-50 dark:border-white/10 text-sm">
              <span class="text-gray-500">{{ $t('product_detail.excel_info.sheet') }}</span>
              <span class="font-semibold text-gray-800 dark:text-gray-200">{{ $t('product_detail.excel_info.sheet_name') }}</span>
            </div>

            <div class="flex items-center justify-between py-2 text-sm">
              <span class="text-gray-500">{{ $t('product_detail.excel_info.modified') }}</span>
              <span class="text-xs font-medium text-gray-600 dark:text-gray-300">
                {{ formatDate(product.updatedAt) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 top-0 left-0 w-screen h-screen min-h-screen z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto"
    >
      <div class="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-gray-100 dark:border-white/10 my-auto">
        <div class="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 flex items-center justify-center text-xl mb-4">
          <i class="pi pi-exclamation-triangle"></i>
        </div>

        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">{{ $t('product_detail.delete_modal.title') }}</h3>
        <p class="text-sm text-gray-500 mb-6">
          {{ $t('product_detail.delete_modal.message') }} <strong class="text-gray-800 dark:text-white">"{{ product?.name }}"</strong>{{ $t('product_detail.delete_modal.message_suffix') }}
        </p>

        <div class="flex items-center justify-end gap-3">
          <button
            type="button"
            @click="showDeleteConfirm = false"
            class="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition"
          >
            {{ $t('product_detail.delete_modal.btn_cancel') }}
          </button>
          <button
            type="button"
            @click="deleteProduct"
            :disabled="deleting"
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20 transition disabled:opacity-50"
          >
            <i v-if="deleting" class="pi pi-spin pi-spinner"></i>
            <i v-else class="pi pi-trash"></i>
            <span>{{ deleting ? $t('product_detail.delete_modal.btn_deleting') : $t('product_detail.delete_modal.btn_confirm') }}</span>
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
const { t, locale } = useI18n()
const { showSuccessToast, showErrorToast } = useToastMsg()

const numberLocale = computed(() => (locale.value === 'ar' ? 'ar-EG' : 'en-US'))
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
      error.value = { statusMessage: t('product_detail.toasts.not_found') }
    }

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
    showErrorToast(t('product_detail.toasts.category_required'))
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
      showSuccessToast(t('product_detail.toasts.updated'))
    }
  } catch (err) {
    showErrorToast(err?.statusMessage || t('product_detail.toasts.update_failed'))
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
    showSuccessToast(t('product_detail.toasts.deleted'))
    showDeleteConfirm.value = false
    router.push(localePath('/'))
  } catch (err) {
    showErrorToast(err?.statusMessage || t('product_detail.toasts.delete_failed'))
  } finally {
    deleting.value = false
  }
}

const getStockBadgeClass = (stock) => {
  const s = Number(stock)
  if (s <= 0) return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
  if (s < 10) return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
  return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
}

const getStockStatusText = (stock) => {
  const s = Number(stock)
  if (s <= 0) return t('product_detail.inventory.out_of_stock')
  if (s < 10) return t('product_detail.inventory.low_stock')
  return t('product_detail.inventory.in_stock')
}

const formatDate = (dateStr) => {
  if (!dateStr) return t('product_detail.na')
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : 'en-US', {
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
