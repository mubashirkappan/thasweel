export default defineNuxtRouteMiddleware((to, from) => {
    const ctx = useNuxtApp()
    const authStatus = useAuth()
    const { loggedIn,isOwner } = authStatus
    const toast = useToast()
    if (!loggedIn) {
        toast.add({ title: "Please Login", color: 'red', icon: 'i-heroicons-x-circle' })
        return navigateTo('/')
    }
    if (isOwner !== 1) {
        toast.add({ title: "Access Denied", color: 'red', icon: 'i-heroicons-x-circle' })
        return navigateTo('/')
      }
})
