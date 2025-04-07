export default defineNuxtConfig({
  css: ["~/assets/css/main.css"],
  modules: [
    "@nuxthub/core",
    "@nuxt/ui",
    "@nuxt/icon",
    "@vee-validate/nuxt",
    "nuxt-auth-utils",
    "@nuxt/image",
  ],
  devtools: { enabled: true },
  runtimeConfig: {
    webhooksUrl: "",
    stravaVerifyToken: "",
  },
  future: { compatibilityVersion: 4 },
  compatibilityDate: "2025-03-01",
  hub: {
    ai: true,
    database: true,
  },
});
