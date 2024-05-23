const { API_KEY, SERVICE_DOMAIN, WEBHOOK_SIGNATURE, R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_ACCESS_KEY_SECRET } = process.env;

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
    webhookSignature: WEBHOOK_SIGNATURE,
    r2Endpoint: R2_ENDPOINT,
    r2AccessKeyId: R2_ACCESS_KEY_ID,
    r2AccessKeySecret: R2_ACCESS_KEY_SECRET,
  }
})
