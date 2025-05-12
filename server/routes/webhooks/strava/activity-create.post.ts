import { get, omit, draw } from "radash";
import { createActivityContent } from "~~/server/utils/create-content";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const db = useDrizzle();
  const openai = useOpenAI();

  const user = await db.query.users.findFirst({
    where: (f, o) => o.eq(f.id, body.owner_id),
    with: {
      preferences: true,
    },
  });

  if (!user?.preferences.data?.enabled) {
    return;
  }

  const tone = draw([
    "casual",
    "funny",
    "epic",
    "poetic",
    "reflective",
    "snarky",
  ]);

  const strava = await useStrava(body.owner_id);

  const [, activity] = await strava!<any>(`/activities/${body.object_id}`);

  const [aiError, aiResponse] = await createActivityContent(activity, user);
  if (aiError) {
    throw createError({
      statusCode: 500,
      message: `OPENAI API: ${aiError.message}`,
    });
  }

  const responseObject = JSON.parse(
    get(aiResponse, "output.0.content.0.text"),
  ) as {
    title: string;
    description: string;
  };

  const promo = "Written by https://ghostwriter.rocks 👻";

  const stravaRequestBody = {
    name: responseObject.title,
    description: [responseObject.description, promo].join("\n"),
  };

  const [stravaError] = await strava!(`activities/${body.object_id}`, {
    method: "PUT",
    body: stravaRequestBody,
  });

  if (stravaError) {
    throw createError({
      statusCode: 500,
      message: `Strava API: ${stravaError.message}`,
    });
  }
});
