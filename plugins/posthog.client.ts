import posthog from "posthog-js";

export default defineNuxtPlugin(() => {
  const runtimeConfig = useRuntimeConfig();

  const posthogClient = posthog.init(runtimeConfig.public.posthogPublicKey, {
    api_host: runtimeConfig.public.posthogHost,
    //@ts-expect-error typing is more explicit than what it should
    defaults: runtimeConfig.public.posthogDefaults,
    loaded: (posthog) => {
      if (import.meta.env.MODE === "development") posthog.debug();
    },
  });

  return {
    provide: {
      posthog: () => posthogClient,
    },
  };
});
