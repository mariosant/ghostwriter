import { isEmpty } from "radash";
import { URLSearchParams } from "url";

export default defineNitroPlugin(() => {
  onHubReady(async () => {
    const config = useRuntimeConfig();

    const webhooks = await $fetch(
      "https://www.strava.com/api/v3/push_subscriptions",
      {
        params: {
          client_id: config.oauth.strava.clientId,
          client_secret: config.oauth.strava.clientSecret,
        },
      },
    );

    if (!isEmpty(webhooks)) {
      return;
    }

    await $fetch("https://www.strava.com/api/v3/push_subscriptions", {
      method: "post",
      body: new URLSearchParams({
        client_id: config.oauth.strava.clientId,
        client_secret: config.oauth.strava.clientSecret,
        callback_url: config.webhooksUrl,
        verify_token: config.stravaVerifyToken,
      }),
    });

    console.log("Webhook registered successfully!");
  });
});
