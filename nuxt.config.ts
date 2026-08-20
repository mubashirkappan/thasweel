// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/img/favicon-16x16.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/img/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '48x48', href: '/img/favicon-48x48.png' },
        { rel: 'icon', type: 'image/png', sizes: '64x64', href: '/img/favicon-64x64.png' },
        { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/img/favicon-96x96.png' },
        { rel: 'apple-touch-icon', sizes: '512x512', href: '/img/favicon-512x512.png' },
      ]
    }
  },
  modules: [
    '@nuxt/ui',
    '@nuxtjs/google-fonts',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    'app-lock',
    'nuxt-swiper',
    '@nuxt/image',
  ],
  googleFonts: {
    families: {
      Quicksand: [300, 400, 500, 600, 700],
      Poppins: [300, 400, 500, 600, 700],
    }
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.BASE_URL || process.env.NUXT_PUBLIC_BASE_URL || '',
      frontendUrl: process.env.FRONTEND_URL || process.env.NUXT_PUBLIC_FRONTEND_URL || ''
    }
  },
  colorMode: {
    preference: 'light'
  },
  image: {
    dir: 'public',
    format: ['webp', 'jpg'],
    densities: [1, 2], // https://observablehq.com/@eeeps/visual-acuity-and-device-pixel-ratio
    presets: {
      default: {
        modifiers: {
          format: 'webp',
        },
      },
    },
    defaultPreset: 'default',
  },
  // watchers: {
  //   webpack: {
  //     poll: true
  //   }
  // }
})