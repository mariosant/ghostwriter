import { get, omit, draw } from "radash";

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
    "casual",
    "casual",
    "casual",
    "funny",
    "epic",
    "poetic",
    "reflective",
    "snarky",
  ]);

  const strava = await useStrava(body.owner_id);

  const [, activity] = await strava!<any>(`/activities/${body.object_id}`);

  const [aiError, aiResponse] = await openai("/responses", {
    body: {
      model: "gpt-4o",
      input: [
        {
          role: "user",
          content: `
            Generate a short title and description for my strava activity. Use my preferred language and unit system.
            Don't exaggerate. Try keeping it calm as I am using Strava often and I don't want to have boring feed. Keep things short.
            Use a little bit of ${tone} bits to make things less boring.

            My user profile:
            Sex: ${user?.sex}
            Weight: ${user?.weight}
            Language: ${user?.preferences.data.language}
            Unit system: ${user?.preferences.data.units}

            Activity notes:
            distance is in meters, time is in seconds, don't include average speed.
            Convert time to hours or minutes, whatever's closer.
            Convert distance to larger units when appropriate, keep in mind we don't need much accuracy.

            The activity data in json format from strava:
            ${JSON.stringify(
              omit(activity, [
                "laps",
                "segment_efforts",
                "splits_metric",
                "splits_standard",
                "hide_from_home",
                "available_zones",
                "map",
                "start_date_local",
                "gear",
                "stats_visibility",
                "embed_token",
                "name",
                "description",
              ]),
            )}
        `,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "activity",
          schema: {
            type: "object",
            properties: {
              title: {
                type: "string",
              },
              description: {
                type: "string",
              },
            },
            required: ["title", "description"],
            additionalProperties: false,
          },
        },
      },
    },
  });

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
