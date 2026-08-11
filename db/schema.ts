import { index, integer, pgTable, real, serial, text, timestamp } from "drizzle-orm/pg-core";

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type", { enum: ["api", "application", "database", "server", "cloud"] }).notNull(),
  environment: text("environment", { enum: ["production", "staging", "development"] }).notNull(),
  owner: text("owner").notNull(),
  criticality: text("criticality", { enum: ["critical", "high", "medium", "low"] }).notNull(),
  status: text("status", { enum: ["healthy", "attention", "critical"] }).notNull(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("assets_status_idx").on(table.status)]);

export const findings = pgTable("findings", {
  id: serial("id").primaryKey(),
  reference: text("reference").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity", { enum: ["critical", "high", "medium", "low"] }).notNull(),
  score: real("score").notNull(),
  status: text("status", { enum: ["open", "in_progress", "resolved", "accepted"] }).notNull().default("open"),
  source: text("source").notNull(),
  assetId: integer("asset_id").notNull().references(() => assets.id),
  assignedTo: text("assigned_to"),
  remediation: text("remediation").notNull(),
  detectedAt: timestamp("detected_at", { withTimezone: true }).notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("findings_severity_idx").on(table.severity), index("findings_status_idx").on(table.status), index("findings_asset_idx").on(table.assetId)]);

export const auditEvents = pgTable("audit_events", {
  id: serial("id").primaryKey(),
  action: text("action").notNull(),
  entityType: text("entity_type", { enum: ["finding", "asset", "report"] }).notNull(),
  entityId: integer("entity_id"),
  actor: text("actor").notNull(),
  details: text("details").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("audit_events_created_idx").on(table.createdAt)]);
