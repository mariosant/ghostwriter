import { chain, draw, get, isEmpty, omit, tryit } from "radash";
import { safeDestr } from "destr";
import { match } from "ts-pattern";
import { User } from "./drizzle";
import { availableHighlights, availableTones } from "~/shared/constants";

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

const stringifyActivity = chain(
  ({ activity, shouldKeepNames = false }) => {
    const baseFieldsToOmit = [
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
    ];

    const nameFields = shouldKeepNames ? [] : ["name", "description"];

    if (movingActivityTypes.includes(activity.type)) {
      return omit(activity, [...baseFieldsToOmit, ...nameFields]);
    }

    if (staticActivityTypes.includes(activity.type)) {
      return omit(activity, [...baseFieldsToOmit, ...nameFields, "distance"]);
    }

    return omit(activity, [...baseFieldsToOmit, ...nameFields]);
  },
  (activity) => JSON.stringify(activity),
);

export const createActivityContent = async ({
  currentActivity,
  previousActivities,
  user,
}: {
  currentActivity: Activity;
  previousActivities: Activity[];
  user: User & { preferences: Preferences };
}) => {
  const openai = useOpenAI();

  const tone = isEmpty(user.preferences.data?.tone)
    ? (draw(availableTones) as string)
    : draw(user.preferences.data!.tone!);

  const highlight = isEmpty(user.preferences.data?.highlights)
    ? (draw(availableHighlights) as string)
    : draw(user.preferences.data!.highlights!);

  const length = match({ tone })
    .with({ tone: "Minimalist" }, () => "short")
    .otherwise(() => draw(["short", "medium", "a-little-more-than-medium"]));

  const prompt = `
    Generate a short title and a ${length}-lengthed description for my strava activity. Use my preferred language and unit system.
    Use first person, as this will be posting for myself. Try to not exaggerate as I am using Strava often and I want my activites to be unique and easy to read. Don't use repeative language.

    Depending the activity conditions and achievements, use one of the following tones to make things less boring:
    ${availableTones.join(", ")}. Accordingly, depending on the activity's conditions, highlight area exploration, athletic achievements, mood swings or weather conditions.
    If there is nothing interesting to say, try making a mild joke or say an interesting fact about the route. Do not add fun facts if mentioned in the recent activities.

    Take heart data, suffer score and weather into consideration if available, combine them to understand the effort. No need to mention suffer score every time.

    Maybe comment if any interesting fact in comparison to previous activities.

    NEVER use — symbol. Not for titles, not for descriptions.
    Depending the length of the description, maybe add hashtags.

    Language: ${user?.preferences.data!.language}
    Unit system: ${user?.preferences.data!.units}

    Activity notes:
    Distance is in meters, time is in seconds, don't include average speed.
    Convert time to hours or minutes, whatever's closer.
    Convert distance to larger units when appropriate, we don't need accuracy. Better say almost 50 instead of 48.67 for example.

    In the end of the description, add "${promo}" translated to my language.

    The activity data in json format from strava:
    ${stringifyActivity({ activity: currentActivity })}

    The recent previous activities in json format:
    [${previousActivities.map((activity) => stringifyActivity({ activity, shouldKeepNames: true }))}]
  `;

  const aiResponse = await openai.responses.create({
    model: "gpt-5",
    input: [{ role: "user", content: prompt }],
    reasoning: {
      effort: "minimal",
    },
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
  });

  const [parseError, responseObject] = tryit(
    chain(
      (r) => get(r, "output_text"),
      (r) => safeDestr<{ title: string; description: string }>(r),
    ),
  )(aiResponse);

  const stravaRequestBody = {
    name: responseObject!.title,
    description: responseObject!.description,
  };

  return [parseError, stravaRequestBody] as const;
};
