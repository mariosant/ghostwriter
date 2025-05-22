export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const db = useDrizzle();

  const query = getQuery(event);

  const user = await db.query.users.findFirst({
    where: (f, o) => o.eq(f.id, session.user.id),
    with: {
      preferences: true,
    },
  });

  if (!user?.premium) {
    throw createError({
      statusCode: 400,
      message: "Premium membership required.",
    });
  }

  const activityId = (query.activity as string).replace(
    /https:\/\/(www\.)?strava\.com\/activities\//,
    "",
  );

  const strava = await useStrava(session.user.id);

  const activity = await strava!<any>(`/activities/${activityId}`);

  const [aiError, stravaRequestBody] = await createActivityContent(
    activity,
    user!,
  );
  if (aiError) {
    throw createError({
      statusCode: 500,
      message: `OPENAI API: ${aiError.message}`,
    });
  }

  await strava!(`activities/${activityId}`, {
    method: "PUT",
    body: stravaRequestBody,
  }).catch((error) => {
    throw createError({
      statusCode: 500,
      message: `Strava API: ${error.message}`,
    });
  });

  sendNoContent(event);
});
