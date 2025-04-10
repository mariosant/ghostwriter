import { get } from "radash";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const aspectType = get(body, "aspect_type");
  const objectType = get(body, "object_type");

  await $fetch(`/webhooks/strava/${objectType}-${aspectType}`, {
    method: "post",
    body,
  });
});
