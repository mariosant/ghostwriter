import { init, trackEvent } from "@aptabase/web";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  nuxtApp.hook("app:mounted", () => {
    init(config.public.aptabaseAppKey, { isDebug: import.meta.dev });
  });

  nuxtApp.hook("page:finish", () => {
    const route = useRoute();

    trackEvent("page_view", {
      path: route.path,
      name: String(route.name),
      redirectedFrom: String(route.redirectedFrom),
    });
  });
});
