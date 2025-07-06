import { PostHog } from "posthog-node";

let client: PostHog;

export const usePosthog = () => {
  const runtimeConfig = useRuntimeConfig();

  client =
    client ??
    new PostHog(runtimeConfig.public.posthogPublicKey, {
      host: runtimeConfig.public.posthogHost,
      defaults: runtimeConfig.public.posthogDefaults,
    });

  if (process.dev) {
    client.debug();
  }

  return client;
};
