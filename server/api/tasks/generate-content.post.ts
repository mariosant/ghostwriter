import { get } from "radash";
import { createActivityContent } from "~~/server/utils/create-content";

export default defineEventHandler(async (event) => {
  await validateHookdeck(event);

  const posthog = event.context.posthog;

  const body = await readBody(event);
  const db = useDrizzle();

  const user = await db.query.users.findFirst({
    where: (f, o) => o.eq(f.id, body.owner_id),
    with: {
      preferences: true,
    },
  });

  if (!user?.preferences.data?.enabled) {
    return;
  }

  const strava = await useStrava(body.owner_id);

  const currentActivity = await strava!<any>(`/activities/${body.object_id}`);
  const [, ...previousActivities] = await strava!<any[]>(`/activities`, {
    query: {
      per_page: 20,
    },
  });

  const [aiError, stravaRequestBody] = await createActivityContent({
    currentActivity,
    previousActivities,
    user: user!,
  }).catch((err) => [err]);
  if (aiError) {
    throw createError({
      statusCode: 500,
      message: `OPENAI API: ${aiError.message}`,
    });
  }

  await strava!(`activities/${body.object_id}`, {
    method: "PUT",
    body: {
      name: stravaRequestBody.name,
      description: stravaRequestBody.description,
    },
  }).catch((error) => {
    throw createError({
      statusCode: 500,
      message: `Strava API: ${error.message}`,
    });
  });

  posthog.captureImmediate({
    distinctId: String(user.id),
    event: "content generated",
    properties: {
      activity: currentActivity.id,
      activityType: get(currentActivity, "sport_type", "unknown"),
      highlight: stravaRequestBody.meta.highlight,
      tone: stravaRequestBody.meta.tone,
    },
  });
});
