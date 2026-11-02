import { defineStore } from "pinia";
import { createCookieStorage } from "~/utils/piniaCookieStorage";

export const useAuthStore = defineStore(
  "authStore",
  () => {
    const user = ref(null);

    const isLoggedIn = computed(() => !!user.value);

    const handleUserData = (newUser) => {
      user.value = newUser;
    };

    const logout = () => {
      user.value = null;
    };

    return {
      user,
      isLoggedIn,
      handleUserData,
      logout,
    };
  },
  {
    persist: {
      storage: createCookieStorage(60 * 60 * 24 * 7), // 7 days
    },
  },
);
