ALTER TABLE "keys" ADD COLUMN "limit_5h_usd" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "keys" ADD COLUMN "limit_weekly_usd" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "keys" ADD COLUMN "limit_monthly_usd" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "keys" ADD COLUMN "limit_concurrent_sessions" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "providers" ADD COLUMN "limit_5h_usd" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "providers" ADD COLUMN "limit_weekly_usd" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "providers" ADD COLUMN "limit_monthly_usd" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "providers" ADD COLUMN "limit_concurrent_sessions" integer DEFAULT 0;