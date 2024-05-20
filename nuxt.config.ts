const { API_KEY, SERVICE_DOMAIN } = process.env;

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  nitro: {
    preset: 'aws-lambda',
  },
  modules: [
    'unplugin-font-to-buffer/nuxt',
    'v-satori/nuxt',
  ],
  runtimeConfig: {
    apiKey: API_KEY,
    serviceDomain: SERVICE_DOMAIN,
  }
})
