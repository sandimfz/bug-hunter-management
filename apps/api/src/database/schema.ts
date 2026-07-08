import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core"

// ─── Enums ─────────────────────────────────────────────

export const planEnum = pgEnum("plan", ["free", "pro", "team"])
export const platformEnum = pgEnum("platform", [
  "hackerone",
  "bugcrowd",
  "private",
  "other",
])
export const programStatusEnum = pgEnum("program_status", [
  "active",
  "paused",
  "completed",
])
export const assetTypeEnum = pgEnum("asset_type", [
  "domain",
  "subdomain",
  "endpoint",
  "api",
  "ip",
])
export const assetStatusEnum = pgEnum("asset_status", [
  "active",
  "dead",
  "unchecked",
  "flagged",
])
export const findingSeverityEnum = pgEnum("finding_severity", [
  "critical",
  "high",
  "medium",
  "low",
  "info",
])
export const findingStatusEnum = pgEnum("finding_status", [
  "draft",
  "submitted",
  "triaged",
  "accepted",
  "rejected",
  "paid",
])

// ─── Tables ────────────────────────────────────────────

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  plan: planEnum("plan").notNull().default("free"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const workspaces = pgTable("workspaces", {
  id: serial("id").primaryKey(),
  uuid: text("uuid").notNull().unique(),
  name: text("name").notNull(),
  ownerId: integer("owner_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  uuid: text("uuid").notNull().unique(),
  workspaceId: integer("workspace_id")
    .notNull()
    .references(() => workspaces.id),
  name: text("name").notNull(),
  platform: platformEnum("platform").notNull(),
  status: programStatusEnum("status").notNull().default("active"),
  scopeNotes: text("scope_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  uuid: text("uuid").notNull().unique(),
  programId: integer("program_id")
    .notNull()
    .references(() => programs.id),
  type: assetTypeEnum("type").notNull(),
  value: text("value").notNull(),
  status: assetStatusEnum("status").notNull().default("unchecked"),
  tags: jsonb("tags").$type<string[]>().default([]),
  notes: text("notes"),
  // Endpoint detail fields
  method: text("method"), // GET, POST, PUT, DELETE, PATCH
  requestHeaders: jsonb("request_headers").$type<Record<string, string>>().default({}),
  requestBody: text("request_body"),
  responseStatus: integer("response_status"),
  responseHeaders: jsonb("response_headers").$type<Record<string, string>>().default({}),
  responseBody: text("response_body"),
  contentType: text("content_type"),
  firstSeenAt: timestamp("first_seen_at").notNull().defaultNow(),
  lastSeenAt: timestamp("last_seen_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const findings = pgTable("findings", {
  id: serial("id").primaryKey(),
  uuid: text("uuid").notNull().unique(),
  assetId: integer("asset_id")
    .notNull()
    .references(() => assets.id),
  title: text("title").notNull(),
  severity: findingSeverityEnum("severity").notNull(),
  status: findingStatusEnum("status").notNull().default("draft"),
  poc: text("poc"),
  rewardAmount: integer("reward_amount").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const notificationSettings = pgTable("notification_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  channel: text("channel").notNull(), // "slack" | "discord" | "email"
  webhookUrl: text("webhook_url"),
  enabled: timestamp("enabled"), // null = enabled, timestamp = disabled at
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const assetSnapshots = pgTable("asset_snapshots", {
  id: serial("id").primaryKey(),
  programId: integer("program_id")
    .notNull()
    .references(() => programs.id),
  scanDate: timestamp("scan_date").notNull().defaultNow(),
  totalAssets: integer("total_assets").notNull().default(0),
  newAssets: integer("new_assets").notNull().default(0),
  removedAssets: integer("removed_assets").notNull().default(0),
  newValues: jsonb("new_values").$type<string[]>().default([]),
  removedValues: jsonb("removed_values").$type<string[]>().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// ─── Relations (v1 RC — defineRelations) ──────────────

import { defineRelations } from "drizzle-orm"

export const relations = defineRelations(
  { users, workspaces, programs, assets, findings, notificationSettings, assetSnapshots },
  (r) => ({
    users: {
      workspaces: r.many.workspaces(),
      notificationSettings: r.many.notificationSettings(),
    },
    notificationSettings: {
      user: r.one.users({
        from: r.notificationSettings.userId,
        to: r.users.id,
      }),
    },
    workspaces: {
      owner: r.one.users({
        from: r.workspaces.ownerId,
        to: r.users.id,
      }),
      programs: r.many.programs(),
    },
    programs: {
      workspace: r.one.workspaces({
        from: r.programs.workspaceId,
        to: r.workspaces.id,
      }),
      assets: r.many.assets(),
      snapshots: r.many.assetSnapshots(),
    },
    assetSnapshots: {
      program: r.one.programs({
        from: r.assetSnapshots.programId,
        to: r.programs.id,
      }),
    },
    assets: {
      program: r.one.programs({
        from: r.assets.programId,
        to: r.programs.id,
      }),
      findings: r.many.findings(),
    },
    findings: {
      asset: r.one.assets({
        from: r.findings.assetId,
        to: r.assets.id,
      }),
    },
  }),
)
