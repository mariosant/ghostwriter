import { createActivityContent } from "~~/server/utils/create-content";

export default defineEventHandler(async (event) => {
  await validateHookdeck(event);

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
    body: stravaRequestBody,
  }).catch((error) => {
    throw createError({
      statusCode: 500,
      message: `Strava API: ${error.message}`,
    });
  });
});
