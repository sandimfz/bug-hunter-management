CREATE TYPE "asset_status" AS ENUM('active', 'dead', 'unchecked', 'flagged');--> statement-breakpoint
CREATE TYPE "asset_type" AS ENUM('domain', 'subdomain', 'endpoint', 'api', 'ip');--> statement-breakpoint
CREATE TYPE "finding_severity" AS ENUM('critical', 'high', 'medium', 'low', 'info');--> statement-breakpoint
CREATE TYPE "finding_status" AS ENUM('draft', 'submitted', 'triaged', 'accepted', 'rejected', 'paid');--> statement-breakpoint
CREATE TYPE "plan" AS ENUM('free', 'pro', 'team');--> statement-breakpoint
CREATE TYPE "platform" AS ENUM('hackerone', 'bugcrowd', 'private', 'other');--> statement-breakpoint
CREATE TYPE "program_status" AS ENUM('active', 'paused', 'completed');--> statement-breakpoint
CREATE TABLE "asset_snapshots" (
	"id" serial PRIMARY KEY,
	"program_id" integer NOT NULL,
	"scan_date" timestamp DEFAULT now() NOT NULL,
	"total_assets" integer DEFAULT 0 NOT NULL,
	"new_assets" integer DEFAULT 0 NOT NULL,
	"removed_assets" integer DEFAULT 0 NOT NULL,
	"new_values" jsonb DEFAULT '[]',
	"removed_values" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" serial PRIMARY KEY,
	"uuid" text NOT NULL UNIQUE,
	"program_id" integer NOT NULL,
	"type" "asset_type" NOT NULL,
	"value" text NOT NULL,
	"status" "asset_status" DEFAULT 'unchecked'::"asset_status" NOT NULL,
	"tags" jsonb DEFAULT '[]',
	"notes" text,
	"method" text,
	"request_headers" jsonb DEFAULT '{}',
	"request_body" text,
	"response_status" integer,
	"response_headers" jsonb DEFAULT '{}',
	"response_body" text,
	"content_type" text,
	"first_seen_at" timestamp DEFAULT now() NOT NULL,
	"last_seen_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "findings" (
	"id" serial PRIMARY KEY,
	"uuid" text NOT NULL UNIQUE,
	"asset_id" integer NOT NULL,
	"title" text NOT NULL,
	"severity" "finding_severity" NOT NULL,
	"status" "finding_status" DEFAULT 'draft'::"finding_status" NOT NULL,
	"poc" text,
	"reward_amount" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_settings" (
	"id" serial PRIMARY KEY,
	"user_id" integer NOT NULL,
	"channel" text NOT NULL,
	"webhook_url" text,
	"enabled" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "programs" (
	"id" serial PRIMARY KEY,
	"uuid" text NOT NULL UNIQUE,
	"workspace_id" integer NOT NULL,
	"name" text NOT NULL,
	"platform" "platform" NOT NULL,
	"status" "program_status" DEFAULT 'active'::"program_status" NOT NULL,
	"scope_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY,
	"email" text NOT NULL UNIQUE,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"plan" "plan" DEFAULT 'free'::"plan" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" serial PRIMARY KEY,
	"uuid" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"owner_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "asset_snapshots" ADD CONSTRAINT "asset_snapshots_program_id_programs_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id");--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_program_id_programs_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id");--> statement-breakpoint
ALTER TABLE "findings" ADD CONSTRAINT "findings_asset_id_assets_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id");--> statement-breakpoint
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "programs" ADD CONSTRAINT "programs_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id");--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_owner_id_users_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id");