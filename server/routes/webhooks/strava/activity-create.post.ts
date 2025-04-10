import { get, omit, tryit } from "radash";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const db = useDrizzle();

  const ai = hubAI();

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

  const activity = (await strava!(`/activities/${body.object_id}`)) as any;

  const promptActivity = `
    type: ${get(activity, "type")}
    distance: ${get(activity, "distance")}m
    moving time: ${get(activity, "moving_time")}sec
    elapsed time: ${get(activity, "elapsed_time")}sec
    total elevation gain: ${get(activity, "total_elevation_gain")}m
    start (local): ${get(activity, "start_date_local")}
    trainer: ${get(activity, "trainer")}
    commute: ${get(activity, "commute")}
    suffer score: ${get(activity, "suffer_score")}/100
    calories: ${get(activity, "calories")}
  `;

  const [aiError, aiResponse] = await tryit(ai.run)(
    "@cf/meta/llama-3.1-8b-instruct",
    {
      response_format: {
        type: "json_schema",
        json_schema: {
          type: "object",
          properties: {
            title: "string",
            description: "string",
          },
          required: ["title", "description"],
        },
      },
      prompt: `
      Generate a title and a short description for my strava activity. Use my preferred language.
      Use ${user?.preferences.data.tone} tone to generate content.
      Add emojis unless tone is set to minimalist.

      My user profile:
      Sex: ${user?.sex}
      Weight: ${user?.weight}
      Language: ${user?.preferences.data.language}

      The activity data:
      ${promptActivity}
    `,
    },
  );

  console.log(
    omit(activity, [
      "map",
      "laps",
      "stats_visibility",
      "embed_token",
      "private_note",
    ]),
  );

  console.error(aiError?.message);

  // console.log(activity);
  // console.log(aiResponse.response.title);
  // console.log(aiResponse.response.description);
  await strava!(`activities/${body.object_id}`, {
    method: "PUT",
    body: {
      name: get(aiResponse, "response.title"),
      description: get(aiResponse, "response.description"),
    },
  });
});
