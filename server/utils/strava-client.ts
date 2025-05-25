import { get, isEmpty } from "radash";
import { isAfter } from "@formkit/tempo";
import { eq } from "drizzle-orm";
import { URLSearchParams } from "url";

const refreshStravaToken = async (refreshToken: string) => {
  const config = useRuntimeConfig();

  const tokensResponse = await $fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: config.oauth.strava.clientId,
      client_secret: config.oauth.strava.clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  return {
    refreshToken: get(tokensResponse, "refresh_token"),
    accessToken: get(tokensResponse, "access_token"),
    expiresAt: new Date(get(tokensResponse, "expires_at", 0) * 1000),
    needsUpdate: true,
  };
};

export const useStrava = async (userId: number) => {
  const db = useDrizzle();
  const now = new Date();

  const user = await db.query.users.findFirst({
    where: (f, o) => o.eq(f.id, userId),
    with: {
      tokens: true,
    },
  });

  if (isEmpty(user)) {
    console.error("No user found.");
    return;
  }

  const tokens = isAfter(now, user?.tokens?.expiresAt)
    ? await refreshStravaToken(user?.tokens?.refreshToken)
    : user?.tokens;

  if (get(tokens, "needsUpdate", false)) {
    db.update(tables.tokens)
      .set({
        refreshToken: tokens?.refreshToken as string,
        accessToken: tokens?.accessToken as string,
        expiresAt: tokens?.expiresAt,
      })
      .where(eq(tables.tokens.userId, userId));
  }

  const client = $fetch.create({
    baseURL: "https://www.strava.com/api/v3/",
    onRequest({ options }) {
      options.headers.set("Authorization", `Bearer ${tokens?.accessToken}`);
    },
  });

  return client;
};
