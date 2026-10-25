CREATE TABLE "admin_sessions" (
	"token" text PRIMARY KEY,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ngl_messages" (
	"id" text PRIMARY KEY,
	"recipient_id" text DEFAULT 'CLASS' NOT NULL,
	"recipient_name" text DEFAULT 'Seluruh XII Social' NOT NULL,
	"message" text NOT NULL,
	"sticker_tag" text DEFAULT 'confession' NOT NULL,
	"reply" text,
	"reply_at" timestamp with time zone,
	"likes_count" integer DEFAULT 0 NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_content" (
	"id" text PRIMARY KEY,
	"data" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
