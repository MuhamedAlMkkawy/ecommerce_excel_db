<template>
  <div class="py-8 max-w-[100%] px-4 sm:px-6 lg:px-8 space-y-8">
    <!-- Hero / Header Section -->
    <div class="bg-gradient-to-br from-gray-950 via-gray-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-white/10">
      <!-- Glow & background effects -->
      <div class="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3">
            <i class="pi pi-file-excel text-xs"></i>
            <span>Excel-Backed Live Database</span>
          </div>
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            Products Dashboard
          </h1>
          <p class="text-gray-400 text-sm sm:text-base mt-2 max-w-xl">
            Manage your catalog with instant two-way synchronization to
            <code class="text-emerald-400 bg-white/5 px-2 py-0.5 rounded font-mono text-xs">data/nuxt-excel-demo.xlsx</code>.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <button
            @click="fetchProducts"
            :disabled="loading"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all backdrop-blur-sm disabled:opacity-50"
            title="Refresh from Excel"
          >
            <i class="pi pi-refresh" :class="{ 'animate-spin': loading }"></i>
            <span>Refresh</span>
          </button>

          <button
            @click="openAddModal"
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5"
          >
            <i class="pi pi-plus text-xs"></i>
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      <!-- Stats Cards Row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10">
        <div class="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
          <div class="flex items-center justify-between text-gray-400 mb-1">
            <span class="text-xs uppercase font-bold tracking-wider">Total Products</span>
            <i class="pi pi-box text-emerald-400"></i>
          </div>
          <div class="text-2xl sm:text-3xl font-extrabold text-white">
            {{ products.length }}
          </div>
          <div class="text-[11px] text-gray-400 mt-1">Across {{ categories.length }} categories</div>
        </div>

        <div class="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
          <div class="flex items-center justify-between text-gray-400 mb-1">
            <span class="text-xs uppercase font-bold tracking-wider">Active Items</span>
            <i class="pi pi-check-circle text-emerald-400"></i>
          </div>
          <div class="text-2xl sm:text-3xl font-extrabold text-white">
            {{ activeCount }}
          </div>
          <div class="text-[11px] text-emerald-400/80 mt-1">{{ inactiveCount }} inactive / archived</div>
        </div>

        <div class="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
          <div class="flex items-center justify-between text-gray-400 mb-1">
            <span class="text-xs uppercase font-bold tracking-wider">Total Stock</span>
            <i class="pi pi-database text-blue-400"></i>
          </div>
          <div class="text-2xl sm:text-3xl font-extrabold text-white">
            {{ totalStock.toLocaleString() }}
          </div>
          <div class="text-[11px] text-gray-400 mt-1">{{ outOfStockCount }} out of stock</div>
        </div>

        <div class="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
          <div class="flex items-center justify-between text-gray-400 mb-1">
            <span class="text-xs uppercase font-bold tracking-wider">Inventory Value</span>
            <i class="pi pi-dollar text-teal-400"></i>
          </div>
          <div class="text-2xl sm:text-3xl font-extrabold text-white">
            ${{ totalValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }}
          </div>
          <div class="text-[11px] text-gray-400 mt-1">Total retail value</div>
        </div>
      </div>
    </div>

    <!-- Content Area: Aside (Filters) + Main (Products) -->
    <div class="flex gap-6 items-start lg:flex-row flex-col">

      <!-- ASIDE: Filters Sidebar -->
      <aside class="lg:w-72 lg:flex-shrink-0 w-full bg-white rounded-3xl p-5 shadow-sm border border-gray-200/80 lg:sticky lg:top-6">
        <!-- Aside Header -->
        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <i class="pi pi-filter text-sm"></i>
            </div>
            <span class="font-bold text-gray-900 text-sm">Filters & Sort</span>
          </div>
          <button
            v-if="hasActiveFilters"
            @click="resetFilters"
            class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
            title="Reset all filters"
          >
            <i class="pi pi-filter-slash text-xs"></i>
            Reset
          </button>
        </div>

        <!-- Filters in column layout, grid on medium screens -->
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-4">

          <!-- Search -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Search</label>
            <div class="input">
              <i class="pi pi-search"></i>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search products..."
              />
              <button
                v-if="searchQuery"
                @click="searchQuery = ''"
                class="text-gray-400 hover:text-gray-600 p-1 text-xs"
                title="Clear search"
              >
                <i class="pi pi-times-circle"></i>
              </button>
            </div>
          </div>

          <!-- Category Filter -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Category</label>
            <div class="input">
              <i class="pi pi-tag pointer-events-none"></i>
              <select v-model="selectedCategory">
                <option value="">All Categories ({{ products.length }})</option>
                <option v-for="cat in categories" :key="cat" :value="cat">
                  {{ cat }}
                </option>
              </select>
              <i class="pi pi-chevron-down pointer-events-none ml-auto text-xs"></i>
            </div>
          </div>

          <!-- Status Filter -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</label>
            <div class="input">
              <i class="pi pi-filter pointer-events-none"></i>
              <select v-model="selectedStatus">
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
              <i class="pi pi-chevron-down pointer-events-none ml-auto text-xs"></i>
            </div>
          </div>

          <!-- Sort By -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Sort By</label>
            <div class="input">
              <i class="pi pi-sort-alt pointer-events-none"></i>
              <select v-model="sortBy">
                <option value="id-asc">ID (Default)</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="price-asc">Price (Low → High)</option>
                <option value="price-desc">Price (High → Low)</option>
                <option value="stock-desc">Stock (Highest)</option>
              </select>
              <i class="pi pi-chevron-down pointer-events-none ml-auto text-xs"></i>
            </div>
          </div>
        </div>

        <!-- Active Filter Tags -->
        <div v-if="hasActiveFilters" class="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
          <span class="text-xs text-gray-400 font-medium w-full">Active filters:</span>
          <span v-if="searchQuery" class="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200 text-xs">
            "{{ searchQuery }}"
            <button @click="searchQuery = ''" class="hover:text-emerald-900"><i class="pi pi-times text-[10px]"></i></button>
          </span>
          <span v-if="selectedCategory" class="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200 text-xs">
            {{ selectedCategory }}
            <button @click="selectedCategory = ''" class="hover:text-blue-900"><i class="pi pi-times text-[10px]"></i></button>
          </span>
          <span v-if="selectedStatus !== 'all'" class="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg border border-purple-200 text-xs">
            {{ selectedStatus }}
            <button @click="selectedStatus = 'all'" class="hover:text-purple-900"><i class="pi pi-times text-[10px]"></i></button>
          </span>
        </div>

        <!-- Results count -->
        <div class="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
          Showing <strong class="text-gray-700">{{ filteredProducts.length }}</strong> of <strong class="text-gray-700">{{ products.length }}</strong> products
        </div>
      </aside>

      <!-- MAIN: Products area -->
      <div class="flex-1 min-w-0">

    <!-- Products Grid -->
    <div v-if="loading && products.length === 0" class="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
      <div class="inline-block animate-spin text-emerald-600 text-4xl mb-4">
        <i class="pi pi-spin pi-spinner"></i>
      </div>
      <p class="text-gray-500 font-medium">Fetching products from Excel...</p>
    </div>

    <div v-else-if="filteredProducts.length === 0" class="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
      <div class="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-4 text-2xl">
        <i class="pi pi-inbox"></i>
      </div>
      <h3 class="text-lg font-bold text-gray-800 mb-1">No products found</h3>
      <p class="text-sm text-gray-500 mb-6">No items match your search or filter criteria.</p>
      <button
        @click="resetFilters"
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-sm font-semibold transition"
      >
        <i class="pi pi-filter-slash"></i>
        <span>Clear Filters</span>
      </button>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col justify-between relative overflow-hidden"
      >
        <!-- Top Row: ID & Status -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <span class="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              #{{ product.id }}
            </span>

            <span
              class="px-3 py-0.5 rounded-full text-xs font-semibold"
              :class="product.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500 border border-gray-200'"
            >
              {{ product.active ? '● Active' : '○ Inactive' }}
            </span>
          </div>

          <!-- Product Title & Category -->
          <NuxtLink
            :to="localePath(`/products/${product.id}`)"
            class="block group-hover:text-emerald-600 transition-colors"
          >
            <h3 class="text-lg font-bold text-gray-900 leading-snug">
              {{ product.name }}
            </h3>
          </NuxtLink>

          <div class="mt-1.5 mb-4">
            <span class="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
              <i class="pi pi-tag text-[10px] text-emerald-500"></i>
              <span>{{ product.category }}</span>
            </span>
          </div>

          <!-- Price & Stock Info Box -->
          <div class="bg-gray-50/80 rounded-2xl p-4 my-4 border border-gray-100 grid grid-cols-2 gap-3">
            <div>
              <span class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Price</span>
              <span class="text-xl font-extrabold text-gray-900">
                ${{ Number(product.price).toFixed(2) }}
              </span>
            </div>

            <div>
              <span class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Stock</span>
              <span
                class="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-bold"
                :class="getStockBadgeClass(product.stock)"
              >
                {{ product.stock }} units
              </span>
            </div>
          </div>
        </div>

        <div class="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
          <!-- View details route button -->
          <NuxtLink
            :to="localePath(`/products/${product.id}`)"
            class="flex-1 h-10 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
          >
            <i class="pi pi-eye text-xs"></i>
            <span>Details</span>
          </NuxtLink>

          <!-- Quick Edit button -->
          <button
            @click="openEditModal(product)"
            class="w-10 h-10 rounded-xl text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition"
            title="Edit Product"
          >
            <i class="pi pi-pencil text-sm"></i>
          </button>

          <!-- Delete button -->
          <button
            @click="confirmDelete(product)"
            class="w-10 h-10 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition"
            title="Delete Product"
          >
            <i class="pi pi-trash text-sm"></i>
          </button>
        </div>
      </div>
    </div>

      </div><!-- /main flex-1 -->
    </div><!-- /flex layout container -->

  </div>
  <!-- ADD PRODUCT MODAL (Fixed 100vh Backdrop & div.input wrappers) -->
  <div
    v-if="showAddModal"
    class="fixed inset-0 top-0 left-0 w-screen h-screen min-h-screen z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto"
    style="height: 100vh; position: fixed;"
  >
    <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border-2 border-gray-100 my-auto animate-in fade-in zoom-in-95 duration-200">
      <div class="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
            <i class="pi pi-plus"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900">Add New Product</h3>
            <p class="text-xs text-gray-400">Appends a new row to data/nuxt-excel-demo.xlsx</p>
          </div>
        </div>
        <button
          @click="showAddModal = false"
          class="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition"
        >
          <i class="pi pi-times"></i>
        </button>
      </div>

      <form @submit.prevent="submitAddProduct" class="space-y-4">
        <!-- Name Input wrapped in div.input -->
        <div class="input-wrap">
          <label>Product Name <span class="text-red-500">*</span></label>
          <div class="input">
            <i class="pi pi-box"></i>
            <input
              v-model="productForm.name"
              type="text"
              required
              placeholder="e.g. 4K Ultra Webcam"
            />
          </div>
        </div>

        <!-- Category Selection in div.input -->
        <div class="input-wrap">
          <label>Category <span class="text-red-500">*</span></label>
          <div class="input">
            <i class="pi pi-tag pointer-events-none"></i>
            <select v-model="categorySelection" required>
              <option value="" disabled>-- Select Category or Add New --</option>
              <option v-for="cat in categories" :key="cat" :value="cat">
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

        <!-- Price & Stock Inputs in div.input -->
        <div class="grid grid-cols-2 gap-4">
          <div class="input-wrap">
            <label>Price ($) <span class="text-red-500">*</span></label>
            <div class="input">
              <i class="pi pi-dollar"></i>
              <input
                v-model.number="productForm.price"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
              />
            </div>
          </div>

          <div class="input-wrap">
            <label>Stock Quantity <span class="text-red-500">*</span></label>
            <div class="input">
              <i class="pi pi-database"></i>
              <input
                v-model.number="productForm.stock"
                type="number"
                min="0"
                required
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <!-- Active Status Switch -->
        <div class="pt-2">
          <label class="relative flex items-center gap-3 cursor-pointer select-none">
            <input
              v-model="productForm.active"
              type="checkbox"
              class="sr-only peer"
            />
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            <span class="text-sm font-semibold text-gray-800">
              {{ productForm.active ? 'Active (Ready for Sale)' : 'Inactive' }}
            </span>
          </label>
        </div>

        <!-- Form Buttons -->
        <div class="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
          <button
            type="button"
            @click="showAddModal = false"
            class="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="submitting"
            class="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
          >
            <i v-if="submitting" class="pi pi-spin pi-spinner"></i>
            <i v-else class="pi pi-check"></i>
            <span>{{ submitting ? 'Adding to Excel...' : 'Create Product' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- QUICK EDIT MODAL (Fixed 100vh Backdrop & div.input wrappers) -->
  <div
    v-if="showEditModal"
    class="fixed inset-0 top-0 left-0 w-screen h-screen min-h-screen z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto"
    style="height: 100vh; position: fixed;"
  >
    <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border-2 border-gray-100 my-auto animate-in fade-in zoom-in-95 duration-200">
      <div class="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
            <i class="pi pi-pencil"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900">Edit Product #{{ activeProduct?.id }}</h3>
            <p class="text-xs text-gray-400">Updates Excel row in real-time</p>
          </div>
        </div>
        <button
          @click="showEditModal = false"
          class="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition"
        >
          <i class="pi pi-times"></i>
        </button>
      </div>

      <form @submit.prevent="submitEditProduct" class="space-y-4">
        <!-- Name Input in div.input -->
        <div class="input-wrap">
          <label>Product Name <span class="text-red-500">*</span></label>
          <div class="input">
            <i class="pi pi-box"></i>
            <input
              v-model="productForm.name"
              type="text"
              required
            />
          </div>
        </div>

        <!-- Category Selection in div.input -->
        <div class="input-wrap">
          <label>Category <span class="text-red-500">*</span></label>
          <div class="input">
            <i class="pi pi-tag pointer-events-none"></i>
            <select v-model="categorySelection" required>
              <option value="" disabled>-- Select Category or Add New --</option>
              <option v-for="cat in categories" :key="cat" :value="cat">
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

        <!-- Price & Stock Inputs in div.input -->
        <div class="grid grid-cols-2 gap-4">
          <div class="input-wrap">
            <label>Price ($) <span class="text-red-500">*</span></label>
            <div class="input">
              <i class="pi pi-dollar"></i>
              <input
                v-model.number="productForm.price"
                type="number"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div class="input-wrap">
            <label>Stock Quantity <span class="text-red-500">*</span></label>
            <div class="input">
              <i class="pi pi-database"></i>
              <input
                v-model.number="productForm.stock"
                type="number"
                min="0"
                required
              />
            </div>
          </div>
        </div>

        <!-- Active Status Switch -->
        <div class="pt-2">
          <label class="relative flex items-center gap-3 cursor-pointer select-none">
            <input
              v-model="productForm.active"
              type="checkbox"
              class="sr-only peer"
            />
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            <span class="text-sm font-semibold text-gray-800">
              {{ productForm.active ? 'Active Product' : 'Inactive' }}
            </span>
          </label>
        </div>

        <!-- Form Buttons -->
        <div class="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
          <button
            type="button"
            @click="showEditModal = false"
            class="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="submitting"
            class="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition disabled:opacity-50"
          >
            <i v-if="submitting" class="pi pi-spin pi-spinner"></i>
            <i v-else class="pi pi-check"></i>
            <span>{{ submitting ? 'Saving...' : 'Update Product' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>


  <!-- DELETE CONFIRMATION MODAL (Fixed 100vh Backdrop) -->
  <div
    v-if="showDeleteModal"
    class="fixed inset-0 top-0 left-0 w-screen h-screen min-h-screen z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto"
    style="height: 100vh; position: fixed;"
  >
    <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-gray-100 my-auto animate-in fade-in zoom-in-95 duration-200">
      <div class="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-xl mb-4">
        <i class="pi pi-exclamation-triangle"></i>
      </div>

      <h3 class="text-lg font-bold text-gray-900 mb-2">Delete Product</h3>
      <p class="text-sm text-gray-500 mb-6">
        Are you sure you want to delete <strong class="text-gray-900">"{{ activeProduct?.name }}"</strong>? This change will immediately be saved to the Excel file.
      </p>

      <div class="flex items-center justify-end gap-3">
        <button
          type="button"
          @click="showDeleteModal = false"
          class="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="submitDeleteProduct"
          :disabled="submitting"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 transition disabled:opacity-50"
        >
          <i v-if="submitting" class="pi pi-spin pi-spinner"></i>
          <i v-else class="pi pi-trash"></i>
          <span>{{ submitting ? 'Deleting...' : 'Confirm Delete' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const localePath = useLocalePath()
const { showSuccessToast, showErrorToast } = useToastMsg()

const products = ref([])
const loading = ref(false)
const submitting = ref(false)

const searchQuery = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('all')
const sortBy = ref('id-asc')

const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const activeProduct = ref(null)

// Category choice state for Add/Edit modals
const categorySelection = ref('')
const customCategoryInput = ref('')

const productForm = reactive({
  name: '',
  price: 0,
  stock: 0,
  active: true,
})

// Check if any filter is actively applied
const hasActiveFilters = computed(() => {
  return Boolean(
    searchQuery.value.trim() ||
    selectedCategory.value ||
    selectedStatus.value !== 'all' ||
    sortBy.value !== 'id-asc'
  )
})

// Fetch all products from our Excel GET endpoint
const fetchProducts = async () => {
  loading.value = true
  try {
    const res = await $fetch('/api/products')
    if (res?.data) {
      products.value = res.data
    }
  } catch (err) {
    showErrorToast(err?.statusMessage || 'Failed to fetch products')
  } finally {
    loading.value = false
  }
}

// Categories list computed from data
const categories = computed(() => {
  const cats = new Set(products.value.map((p) => p.category).filter(Boolean))
  return Array.from(cats)
})

// Stats
const activeCount = computed(() => products.value.filter((p) => p.active).length)
const inactiveCount = computed(() => products.value.filter((p) => !p.active).length)
const totalStock = computed(() => products.value.reduce((acc, p) => acc + (Number(p.stock) || 0), 0))
const outOfStockCount = computed(() => products.value.filter((p) => Number(p.stock) <= 0).length)
const totalValue = computed(() =>
  products.value.reduce((acc, p) => acc + (Number(p.price) || 0) * (Number(p.stock) || 0), 0)
)

// Filtered & Sorted Products
const filteredProducts = computed(() => {
  let list = [...products.value]

  // Search filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    )
  }

  // Category filter
  if (selectedCategory.value) {
    list = list.filter((p) => p.category === selectedCategory.value)
  }

  // Status filter
  if (selectedStatus.value === 'active') {
    list = list.filter((p) => p.active)
  } else if (selectedStatus.value === 'inactive') {
    list = list.filter((p) => !p.active)
  }

  // Sorting
  switch (sortBy.value) {
    case 'name-asc':
      list.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'price-asc':
      list.sort((a, b) => Number(a.price) - Number(b.price))
      break
    case 'price-desc':
      list.sort((a, b) => Number(b.price) - Number(a.price))
      break
    case 'stock-desc':
      list.sort((a, b) => Number(b.stock) - Number(a.stock))
      break
    default:
      list.sort((a, b) => Number(a.id) - Number(b.id))
      break
  }

  return list
})

const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedStatus.value = 'all'
  sortBy.value = 'id-asc'
}

const openAddModal = () => {
  productForm.name = ''
  productForm.price = ''
  productForm.stock = ''
  productForm.active = true

  // Default to first existing category or let user select
  if (categories.value.length > 0) {
    categorySelection.value = categories.value[0]
  } else {
    categorySelection.value = '__NEW__'
  }
  customCategoryInput.value = ''

  showAddModal.value = true
}

const getFinalCategory = () => {
  if (categorySelection.value === '__NEW__') {
    return customCategoryInput.value.trim()
  }
  return categorySelection.value.trim()
}

const submitAddProduct = async () => {
  const finalCategory = getFinalCategory()
  if (!finalCategory) {
    showErrorToast('Please select or enter a category')
    return
  }

  submitting.value = true
  try {
    const res = await $fetch('/api/products', {
      method: 'POST',
      body: {
        name: productForm.name,
        category: finalCategory,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        active: Boolean(productForm.active),
      },
    })

    if (res?.data) {
      products.value.push(res.data)
      showAddModal.value = false
      showSuccessToast('Product added to Excel successfully!')
    }
  } catch (err) {
    showErrorToast(err?.statusMessage || 'Failed to create product')
  } finally {
    submitting.value = false
  }
}

const openEditModal = (product) => {
  activeProduct.value = product
  productForm.name = product.name
  productForm.price = product.price
  productForm.stock = product.stock
  productForm.active = Boolean(product.active)

  if (categories.value.includes(product.category)) {
    categorySelection.value = product.category
    customCategoryInput.value = ''
  } else {
    categorySelection.value = '__NEW__'
    customCategoryInput.value = product.category
  }

  showEditModal.value = true
}

const submitEditProduct = async () => {
  if (!activeProduct.value) return
  const finalCategory = getFinalCategory()
  if (!finalCategory) {
    showErrorToast('Please select or enter a category')
    return
  }

  submitting.value = true
  try {
    const res = await $fetch(`/api/products/${activeProduct.value.id}`, {
      method: 'PUT',
      body: {
        name: productForm.name,
        category: finalCategory,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        active: Boolean(productForm.active),
      },
    })

    if (res?.data) {
      const idx = products.value.findIndex((p) => p.id === activeProduct.value.id)
      if (idx !== -1) {
        products.value[idx] = res.data
      }
      showEditModal.value = false
      showSuccessToast('Product updated in Excel successfully!')
    }
  } catch (err) {
    showErrorToast(err?.statusMessage || 'Failed to update product')
  } finally {
    submitting.value = false
  }
}

const confirmDelete = (product) => {
  activeProduct.value = product
  showDeleteModal.value = true
}

const submitDeleteProduct = async () => {
  if (!activeProduct.value) return
  submitting.value = true
  try {
    await $fetch(`/api/products/${activeProduct.value.id}`, {
      method: 'DELETE',
    })

    products.value = products.value.filter((p) => p.id !== activeProduct.value.id)
    showDeleteModal.value = false
    showSuccessToast('Product removed from Excel successfully!')
  } catch (err) {
    showErrorToast(err?.statusMessage || 'Failed to delete product')
  } finally {
    submitting.value = false
  }
}

const getStockBadgeClass = (stock) => {
  const s = Number(stock)
  if (s <= 0) return 'bg-red-100 text-red-700'
  if (s < 10) return 'bg-amber-100 text-amber-700'
  return 'bg-emerald-100 text-emerald-700'
}

onMounted(() => {
  fetchProducts()
})
</script>
