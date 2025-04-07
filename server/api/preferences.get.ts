export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const db = useDrizzle();

  const user = await db.query.users.findFirst({
    where: (f, o) => o.eq(f.id, session.user.id),
    with: {
      preferences: true,
    },
  });

  return user?.preferences.data;
});
