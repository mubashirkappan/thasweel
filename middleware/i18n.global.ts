export default defineNuxtRouteMiddleware((to) => {
  const { syncLocaleFromRoute } = useI18n()
  syncLocaleFromRoute(to.path)
})
