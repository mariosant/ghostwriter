export default defineNuxtConfig({
  css: ["~/assets/css/main.css"],
  modules: [
    "@nuxt/ui",
    "@nuxt/icon",
    "nuxt-auth-utils",
    "@nuxt/image",
    "@vueuse/nuxt",
  ],
  devtools: { enabled: true },
  runtimeConfig: {
    webhooksUrl: "",
    stravaVerifyToken: "",
    hookdeckKey: "",
    openaiApiKey: "",
    databaseUrl: "",
    public: {
      aptabaseAppKey: "",
    },
  },
  future: { compatibilityVersion: 4 },
  compatibilityDate: "2025-03-01",
  app: {
    head: {
      link: [
        {
          rel: "icon",
          href: "/favicon.ico",
          type: "image/x-icon",
          sizes: "any",
        },
        {
          rel: "icon",
          href: "/favicon-32x32.png",
          type: "image/png",
          sizes: "32x32",
        },
        {
          rel: "icon",
          href: "/favicon-16x16.png",
          type: "image/png",
          sizes: "16x16",
        },
        {
          rel: "apple-touch-icon",
          href: "/apple-touch-icon.png",
          sizes: "180x180",
        },
        {
          rel: "manifest",
          href: "/site.webmanifest",
        },
      ],
    },
  },
});
