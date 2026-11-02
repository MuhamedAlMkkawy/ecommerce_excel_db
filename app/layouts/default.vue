<template>
  <div class="min-h-screen flex flex-col bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">

    <!-- Top Navbar -->
    <header class="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-200 dark:border-white/5">
      <div class="max-w-[95%] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        <!-- Brand -->
        <NuxtLink :to="localePath('/')" class="flex items-center gap-2 text-gray-900 dark:text-white font-bold text-sm">
          <div class="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <i class="pi pi-file-excel text-emerald-500 dark:text-emerald-400 text-xs"></i>
          </div>
          <span class="hidden sm:inline">{{ $t('nav.brand') }}</span>
        </NuxtLink>

        <!-- Right side -->
        <div class="flex items-stretch gap-2 sm:gap-3">
          <SwitchLanguage />
          <!-- <SwitchTheme /> -->

          <!-- User email badge -->
          <div
            v-if="authStore.user"
            class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-500 dark:text-gray-400"
          >
            <i class="pi pi-user text-emerald-500 dark:text-emerald-400 text-xs"></i>
            <span class="max-w-[180px] truncate">{{ authStore.user.email }}</span>
          </div>

          <!-- Logout button -->
          <button
            @click="handleLogout"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-500 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all"
          >
            <i class="pi pi-sign-out text-xs"></i>
            <span>{{ $t('nav.logout') }}</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Page Content -->
    <main class="flex-1 page">
      <slot />
    </main>

  </div>
</template>

<script setup>
const authStore = useAuthStore()
const router = useRouter()
const localePath = useLocalePath()

async function handleLogout() {
  authStore.logout()
  await router.push(localePath('/auth'))
}
</script>
