import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isSignedIn: false,
  }),
  getters: {
    isSigned: (state) => state.isSignedIn,
  },
  actions: {
    signIn() {
      this.isSignedIn = true;
    },
    signOut() {
      this.isSignedIn = false;
    },
  },
})