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
  const highlightInstructions = match({ highlight, activity: currentActivity })
    .when(
      ({ highlight, activity }) =>
        highlight === "Area Exploration" &&
        movingActivityTypes.includes(get(activity, "type")),
      () =>
        "Focus on places visited and areas explored. Highlight any previous or new visits.",
    )
    .with(
      { highlight: "Athletic" },
      () =>
        "Highlight athletic properties and performance. Highlight PR's as well but only if available.",
    )
    .with(
      { highlight: "Mood" },
      () =>
        "Focus on how mood was swinging through the activity, ie I was feeling exhausted because of climb, I was feeling super happy on that descent!",
    )
    .with({ highlight: "Conditions" }, () => "Highlight on weather conditions")
    .otherwise(() => "");

  const length = match({ tone })
    .with({ tone: "Minimalist" }, () => "short")
    .otherwise(() => draw(["short", "medium", "a-little-more-than-medium"]));

  const prompt = `
    Generate a short title and a ${length}-lengthed description for my strava activity. Use my preferred language and unit system.
    Use first person, as this will be posting for myself. Try to not exaggerate as I am using Strava often and I want my activites to be unique and easy to read. Don't use repeative language.
    Use a little bit of ${tone} tone to make things less boring.
    ${highlightInstructions}
    Maybe comment if any interesting fact in comparison to previous activities.

    Add #${tone} and #${highlight} at the end of the description. Depending the length of the description, maybe add more hashtags.

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
    model: "gpt-5-mini",
    input: [{ role: "user", content: prompt }],
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
    meta: {
      highlight,
      tone,
    },
  };

  return [parseError, stravaRequestBody] as const;
};
