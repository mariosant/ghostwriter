import { defineConfig } from "drizzle-kit";
import { get } from "radash";

export default defineConfig({
  dialect: "postgresql",
  schema: "./server/database/schema.ts",
  out: "./server/database/migrations",
  dbCredentials: {
    url: get(process, "env.NUXT_DATABASE_URL"),
  },
});
