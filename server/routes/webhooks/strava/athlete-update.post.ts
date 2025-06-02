import { get } from "radash";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  await validateHookdeck(event);

  const body = await readBody(event);
  const db = useDrizzle();

  if (get(body, "updates.authorized") !== false) {
    return;
  }

  await db
    .delete(tables.users)
    .where(eq(tables.users.id, get(body, "object_id")));

  sendNoContent(event);
});
