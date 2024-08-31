import { defineStore } from 'pinia'

export const useAuth = defineStore('useAuth', () => {
  const loggedIn = ref(false)
  const leadGen = ref(false)
  const loginPop = ref(false)
  const token = ref('')
  const isOwner = ref('')
  const ItemsCount = ref('')

  return {
    ItemsCount,
    loggedIn,
    leadGen,
    loginPop,
    token,
    isOwner
  }
}, {
  persist: true
})