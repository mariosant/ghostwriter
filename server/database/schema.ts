import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  numeric,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  avatar: text("avatar").notNull(),
  city: text("city"),
  country: text("country"),
  sex: text("sex"),
  weight: numeric("weight", {
    mode: "number",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const preferences = pgTable("preferences", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .unique(),
  data: jsonb("data")
    .$type<{
      enabled: boolean;
      language: string;
      units: "Imperial" | "Metric";
      tone?: string[];
      highlights?: string[];
    }>()
    .$defaultFn(() => ({
      enabled: true,
      language: "English",
      units: "Metric",
      tone: [],
      highlights: [],
    })),
});

export const tokens = pgTable("tokens", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .unique(),
  refreshToken: text("refresh_token"),
  accessToken: text("access_token"),
  expiresAt: timestamp("expires_at").notNull().defaultNow(),
});

// Define relationships
export const usersRelations = relations(users, ({ one }) => ({
  tokens: one(tokens, {
    fields: [users.id],
    references: [tokens.userId],
  }),
  preferences: one(preferences, {
    fields: [users.id],
    references: [preferences.userId],
  }),
}));

export const referencesRelations = relations(preferences, ({ one }) => ({
  user: one(users, {
    fields: [preferences.userId],
    references: [users.id],
  }),
}));

export const tokensRelations = relations(tokens, ({ one }) => ({
  user: one(users, {
    fields: [tokens.userId],
    references: [users.id],
  }),
}));
