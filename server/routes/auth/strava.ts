import { get, omit } from "radash";
import type { H3Event } from "h3";

const requiredScope = ["read", "activity:write", "activity:read_all"];
const hasEnoughScope = (scope: string) => {
  const permissions = scope.split(",");

  return requiredScope.every((p) => permissions.includes(p));
};

export default defineOAuthStravaEventHandler({
  config: {
    scope: [requiredScope.join(",")],
  },
  onSuccess: async (event: H3Event, auth: any) => {
    const query = getQuery(event);
    const scope = get(query, "scope", "");

    if (!hasEnoughScope(scope)) {
      throw createError({
        statusCode: 403,
        message:
          "Insufficient authentication scope. Please make sure all required permissions are allowed during Strava authentication process.",
      });
    }

    const posthog = event.context.posthog;

    const userPayload = {
      id: auth.user.id,
      name: `${auth.user.firstname} ${auth.user.lastname}`,
      city: auth.user.city,
      country: auth.user.country,
      sex: auth.user.sex,
      weight: auth.user.weight,
      avatar: auth.user.profile,
    };

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
          units: "Metric",
        },
      })
      .onConflictDoNothing();

    await setUserSession(event, {
      user: userPayload,
    });

    posthog.identify({
      distinctId: String(user!.id),
      properties: {
        name: user!.name,
        country: user!.country,
      },
    });

    posthog.capture({
      distinctId: String(user!.id),
      event: "user logged in",
    });

    sendRedirect(event, "/");
  },
});
