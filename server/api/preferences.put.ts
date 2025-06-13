import * as z from "zod";
import {
  availableHighlights,
  availableLanguages,
  availableTones,
  availableUnits,
} from "~/shared/constants";
//
const bodySchema = z.strictObject({
  enabled: z.boolean(),
  language: z.enum(availableLanguages),
  units: z.enum(availableUnits),
  tone: z.array(z.enum(availableTones)),
  highlights: z.array(z.enum(availableHighlights)),
});

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const body = await readValidatedBody(event, (body) => bodySchema.parse(body));

  const db = useDrizzle();

  const [preferences] = await db
    .update(tables.preferences)
    .set({
      data: {
        enabled: body.enabled,
        language: body.language,
        units: body.units,
        tone: body.tone,
        highlights: body.highlights,
      },
    })
    .where(eq(tables.preferences.userId, session.user.id))
    .returning();

  return preferences.data;
});
