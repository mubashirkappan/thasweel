import { defineStore } from 'pinia'

export const useAuth = defineStore('useAuth', () => {
  const loggedIn = ref(false)
  const signPop = ref(false)
  const loginPop = ref(false)
  const token = ref('')
  const isOwner = ref('')
  const ItemsCount = ref('')

  return {
    ItemsCount,
    loggedIn,
    signPop,
    loginPop,
    token,
    isOwner
  }
}, {
  persist: true
})