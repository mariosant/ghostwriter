export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const db = useDrizzle();
  const body = await readBody(event);

  const [preferences] = await db
    .update(tables.preferences)
    .set({
      data: {
        enabled: body.enabled,
        language: body.language,
        units: body.units,
      },
    })
    .where(eq(tables.preferences.userId, session.user.id))
    .returning();

  return preferences.data;
});
