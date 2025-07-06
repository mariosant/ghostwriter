import { get } from "radash";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  await validateHookdeck(event);

  const posthog = event.context.posthog;

  const body = await readBody(event);
  const db = useDrizzle();

  if (get(body, "updates.authorized") !== false) {
    return;
  }

  const user = await db.query.users.findFirst({
    where: (f, o) => o.eq(f.id, get(body, "object_id")),
    with: {
      preferences: true,
    },
  });

  posthog.identifyImmediate({
    distinctId: String(user!.id),
    properties: {
      name: user!.name,
      country: user!.country,
    },
  });

  await db
    .delete(tables.users)
    .where(eq(tables.users.id, get(body, "object_id")));

  posthog.captureImmediate({
    distinctId: get(body, "object_id"),
    event: "user deleted",
  });

  sendNoContent(event);
});
