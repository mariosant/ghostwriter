import { drizzle } from "drizzle-orm/neon-http";
export { sql, eq, and, or } from "drizzle-orm";

import * as schema from "../database/schema";

export const tables = schema;

export function useDrizzle() {
  const config = useRuntimeConfig();

  return drizzle(config.databaseUrl, { schema });
}

export type User = typeof schema.users.$inferSelect;
export type Tokens = typeof schema.tokens.$inferSelect;
