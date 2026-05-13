CREATE TABLE `waitlist` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`email` text NOT NULL,
	`confirmation_code` text NOT NULL,
	`confirmation_expires_at` text NOT NULL,
	`confirmed_at` text,
	`source` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `waitlist_signups_email_idx` ON `waitlist` (`email`);