import en from '~/locales/en'
import ar from '~/locales/ar'

const locales: Record<string, Record<string, string>> = { en, ar }
const currentLocale = ref<'en' | 'ar'>('en')

export function useI18n() {
  const route = useRoute()
  const router = useRouter()

  // Sync locale based on route path or parameters
  const syncLocaleFromRoute = (path?: string) => {
    const currentPath = path || route?.path || ''
    const paramName = (route?.params?.name as string) || ''

    if (
      currentPath.startsWith('/ar/') ||
      currentPath === '/ar' ||
      currentPath.includes('/ar/') ||
      paramName.startsWith('ar/') ||
      paramName.startsWith('ar-') ||
      paramName.startsWith('ar_') ||
      paramName === 'ar'
    ) {
      currentLocale.value = 'ar'
    } else {
      currentLocale.value = 'en'
    }
    updateDocumentDir()
  }

  const updateDocumentDir = () => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = currentLocale.value === 'ar' ? 'rtl' : 'ltr'
      document.documentElement.lang = currentLocale.value
    }
  }

  const isRtl = computed(() => currentLocale.value === 'ar')

  function t(key: string, params?: Record<string, any>, fallback?: string): string {
    let message = locales[currentLocale.value]?.[key] || locales['en']?.[key] || fallback || key

    if (params && typeof params === 'object') {
      Object.keys(params).forEach((paramKey) => {
        const val = params[paramKey] !== undefined && params[paramKey] !== null ? params[paramKey] : ''
        message = message.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val))
      })
    }

    return message
  }

  function setLocale(newLocale: 'en' | 'ar', shopSlug?: string) {
    currentLocale.value = newLocale
    updateDocumentDir()

    // Determine shop slug from argument or current route params
    let rawSlug = shopSlug || (route?.params?.name as string) || ''
    rawSlug = rawSlug.replace(/^(ar\/|\/ar\/|ar-|ar_)/i, '')
    if (rawSlug.includes('/ar/')) {
      rawSlug = rawSlug.split('/ar/').pop() || rawSlug
    }

    if (rawSlug) {
      const targetPath = newLocale === 'ar' ? `/ar/${rawSlug}` : `/${rawSlug}`
      if (route && route.path !== targetPath) {
        router.push(targetPath)
      }
    }
  }

  function toggleLocale(shopSlug?: string) {
    const target = currentLocale.value === 'ar' ? 'en' : 'ar'
    setLocale(target, shopSlug)
  }

  // Sync immediately when composable is invoked so locale is correct before template render
  syncLocaleFromRoute()

  onMounted(() => {
    syncLocaleFromRoute()
  })

  watch(() => route?.path, (newPath) => {
    if (newPath) {
      syncLocaleFromRoute(newPath)
    }
  })

  return {
    currentLocale,
    isRtl,
    t,
    setLocale,
    toggleLocale,
    syncLocaleFromRoute,
  }
}

