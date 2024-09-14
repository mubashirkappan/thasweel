// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
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
      Quicksand: [300, 400,500,600,700],
      Poppins: [300, 400,500,600,700],
    }
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.BASE_URL
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
})