CREATE TABLE `applications` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`tracking_hash` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`city` text NOT NULL,
	`state` text NOT NULL,
	`business` text NOT NULL,
	`revenue` text NOT NULL,
	`customer_note` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`public_message` text DEFAULT '' NOT NULL,
	`internal_notes` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`consent_version` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`reviewed_by` text,
	`last_review_id` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `applications_reference_unique` ON `applications` (`reference`);--> statement-breakpoint
CREATE UNIQUE INDEX `applications_tracking_unique` ON `applications` (`tracking_hash`);--> statement-breakpoint
CREATE INDEX `applications_status_created` ON `applications` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `applications_created` ON `applications` (`created_at`);--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `rate_limits_expiry` ON `rate_limits` (`expires_at`);--> statement-breakpoint
CREATE TABLE `review_events` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`actor_id` text NOT NULL,
	`status` text NOT NULL,
	`public_message` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `reviews_application` ON `review_events` (`application_id`);