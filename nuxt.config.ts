// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxt/ui','@nuxtjs/google-fonts','@pinia/nuxt','@pinia-plugin-persistedstate/nuxt','app-lock','nuxt-swiper'],
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
  }

})