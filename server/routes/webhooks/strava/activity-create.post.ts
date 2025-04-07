import { get } from "radash";

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

  const activity = await strava!(`/activities/${body.object_id}`);

  const aiResponse = await ai.run("@cf/meta/llama-3-8b-instruct", {
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
      Generate a title and a short description for my strava activity. Use my preferred language. Make sure to include emojis and make it fun.

      My user profile:
      Sex: ${user?.sex}
      City: ${user?.city}
      Country: ${user?.country}
      Weight: ${user?.weight}
      Language: ${user?.preferences.data.language}

      The activity data in json format:
      ${JSON.stringify(activity)}
    `,
  });

  await strava!(`activities/${body.object_id}`, {
    method: "PUT",
    body: {
      name: get(aiResponse, "response.title"),
      description: get(aiResponse, "response.description"),
    },
  });
});
