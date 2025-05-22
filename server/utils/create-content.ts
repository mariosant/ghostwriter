import { chain, draw, get, omit, tryit } from "radash";
import { safeDestr } from "destr";
import { User } from "./drizzle";

const promo = "Written by https://ghostwriter.rocks 👻";

type Activity = Record<string, any>;

const movingActivityTypes = [
  "AlpineSki",
  "BackcountrySki",
  "Canoeing",
  "Crossfit",
  "EBikeRide",
  "Elliptical",
  "Handcycle",
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

export const createActivityContent = async (
  activity: Activity,
  user: User & { preferences: any },
) => {
  const openai = useOpenAI();

  const tone = draw([
    "casual",
    "funny",
    "epic",
    "poetic",
    "reflective",
    "snarky",
  ]);

  const length = draw([
    "short",
    "short",
    "short",
    "medium",
    "a-little-more-than-medium",
  ]);

  const prompt = `
    Generate a short title and a ${length}-lengthed description for my strava activity. Use my preferred language and unit system.
    Try to not exaggerate as I am using Strava often and I want my activites to be unique and easy to read. Don't say things like nothing too fancy or wild.
    Use a little bit of ${tone} to make things less boring. Highlight any PR only if available, do not mention them if no PRs.

    Add #${tone} at the end of the description. Depending the length of the description, maybe add more hashtags.

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
      model: "gpt-4.1",
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

  const [parseError, responseObject] = tryit(
    chain(
      (r) => get(r, "output.0.content.0.text"),
      (r) => safeDestr<{ title: string; description: string }>(r),
    ),
  )(aiResponse);

  const stravaRequestBody = {
    name: responseObject!.title,
    description: [responseObject!.description, promo].join("\n"),
  };

  return [aiError || parseError, stravaRequestBody] as const;
};
