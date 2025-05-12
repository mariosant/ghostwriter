import { chain, draw, omit } from "radash";
import { User } from "./drizzle";

type Activity = Record<string, any>;

const movingActivityTypes = [
  "AlpineSki",
  "BackcountrySki",
  "Canoeing",
  "Crossfit",
  "EBikeRide",
  "Elliptical",
  "Hike",
  "IceSkate",
  "InlineSkate",
  "Kayaking",
  "Kitesurf",
  "NordicSki",
  "Ride",
  "RockClimbing",
  "RollerSki",
  "Rowing",
  "Run",
  "Sail",
  "Skateboard",
  "Snowboard",
  "Snowshoe",
  "StandUpPaddling",
  "Surfing",
  "Swim",
  "Velomobile",
  "VirtualRide",
  "VirtualRun",
  "Walk",
  "Wheelchair",
  "Windsurf",
  "Yoga",
];

const staticActivityTypes = [
  "Handcycle",
  "Soccer",
  "Workout",
  "WeightTraining",
  "StairStepper",
  "Golf",
];

const stringifyActivity = chain<[Activity], Activity, string>(
  (activity) => {
    if (movingActivityTypes.includes(activity.type)) {
      return omit(activity, [
        "laps",
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
      ]);
    }

    if (staticActivityTypes.includes(activity.type)) {
      return omit(activity, [
        "laps",
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
        "distance",
      ]);
    }

    return omit(activity, [
      "laps",
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
    ]);
  },
  (activity) => JSON.stringify(activity),
);

export const createActivityContent = async (activity: Activity, user: User) => {
  const openai = useOpenAI();

  const tone = draw([
    "casual",
    "funny",
    "epic",
    "poetic",
    "reflective",
    "snarky",
  ]);

  console.log(tone, activity.type);

  const prompt = `
    Generate a short title and description for my strava activity. Use my preferred language and unit system.
    Don't exaggerate. Try keeping it calm as I am using Strava often and I don't want to have boring feed. Keep things short.
    Use a little bit of ${tone} to make things less boring. Highlight any PR if available.

    Language: ${user?.preferences.data.language}
    Unit system: ${user?.preferences.data.units}

    Activity notes:
    Distance is in meters, time is in seconds, don't include average speed.
    Convert time to hours or minutes, whatever's closer.
    Convert distance to larger units when appropriate, keep in mind we don't need much accuracy.

    The activity data in json format from strava:
    ${stringifyActivity(activity)}
  `;

  const [aiError, aiResponse] = await openai("/responses", {
    body: {
      model: "gpt-4o",
      input: [
        {
          role: "user",
          content: prompt,
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

  return [aiError, aiResponse] as const;
};
