ALTER TABLE "posts" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "favorites_posts" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "favorites_posts" ALTER COLUMN "post_id" SET NOT NULL;