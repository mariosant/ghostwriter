import { PostHog } from "posthog-node";

export default defineNitroPlugin((nitroApp) => {
  const runtimeConfig = useRuntimeConfig();

  const posthog = new PostHog(runtimeConfig.public.posthogPublicKey, {
    host: runtimeConfig.public.posthogHost,
    defaults: runtimeConfig.public.posthogDefaults,
  });

  nitroApp.hooks.hook("request", (event) => {
    event.context.posthog = posthog;
  });

  nitroApp.hooks.hook("beforeResponse", async () => {
    await posthog.shutdown();
  });

  nitroApp.hooks.hook("close", async () => {
    await posthog.shutdown();
  });
});

declare module "h3" {
  interface H3EventContext {
    posthog: PostHog;
  }
}
