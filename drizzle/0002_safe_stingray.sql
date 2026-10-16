CREATE TABLE `deletion_events` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`actor_id` text NOT NULL,
	`created_at` text NOT NULL
);
