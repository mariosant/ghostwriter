import { omit } from "radash";

export default defineOAuthStravaEventHandler({
  config: {
    scope: ["read,activity:read,activity:write"],
  },
  onSuccess: async (event, auth) => {
    const userPayload = {
      id: auth.user.id,
      name: `${auth.user.firstname} ${auth.user.lastname}`,
      city: auth.user.city,
      country: auth.user.country,
      sex: auth.user.sex,
      weight: auth.user.weight,
      avatar: auth.user.profile,
    };

    await setUserSession(event, {
      user: userPayload,
    });

    const db = useDrizzle();

    const [user] = await db
      .insert(tables.users)
      .values(userPayload)
      .onConflictDoUpdate({
        target: tables.users.id,
        set: omit(userPayload, ["id"]),
      })
      .returning();

    const tokenExpiration = new Date(auth.tokens.expires_at * 1000);

    await db
      .insert(tables.tokens)
      .values({
        userId: user.id,
        refreshToken: auth.tokens.refresh_token,
        accessToken: auth.tokens.access_token,
        expiresAt: tokenExpiration,
      })
      .onConflictDoUpdate({
        target: tables.tokens.userId,
        set: {
          refreshToken: auth.tokens.refresh_token,
          accessToken: auth.tokens.access_token,
          expiresAt: tokenExpiration,
        },
      });

    await db
      .insert(tables.preferences)
      .values({
        userId: user.id,
        data: {
          enabled: true,
          language: "English",
          tone: "Casual",
        },
      })
      .onConflictDoNothing();

    sendRedirect(event, "/");
  },
});
