import { PostHog } from "posthog-node";
import { waitUntil } from "@vercel/functions";
export default defineNitroPlugin((nitroApp) => {
  const runtimeConfig = useRuntimeConfig();

  const posthog = new PostHog(runtimeConfig.public.posthogPublicKey, {
    host: runtimeConfig.public.posthogHost,
    flushAt: 1,
    flushInterval: 0,
  });

  nitroApp.hooks.hook("request", (event) => {
    event.context.posthog = posthog;
  });

  nitroApp.hooks.hook("beforeResponse", () => {
    waitUntil(posthog.shutdown());
  });

  nitroApp.hooks.hook("close", () => {
    waitUntil(posthog.shutdown());
  });
});

declare module "h3" {
  interface H3EventContext {
    posthog: PostHog;
  }
}
