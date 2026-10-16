CREATE TABLE `admin_audit` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_id` text NOT NULL,
	`actor_email` text NOT NULL,
	`action` text NOT NULL,
	`target_id` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `admin_invitations` (
	`hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	`created_by` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `admin_users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `admin_invitations_user` ON `admin_invitations` (`user_id`);--> statement-breakpoint
CREATE TABLE `admin_sessions` (
	`hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`auth_version` integer NOT NULL,
	`csrf_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`last_seen` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `admin_users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `admin_sessions_user` ON `admin_sessions` (`user_id`);--> statement-breakpoint
CREATE TABLE `admin_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`password_hash` text,
	`enabled` integer DEFAULT 1 NOT NULL,
	`auth_version` integer DEFAULT 0 NOT NULL,
	`last_change` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_email_unique` ON `admin_users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `single_admin_owner` ON `admin_users` (`role`) WHERE "admin_users"."role" = 'owner';