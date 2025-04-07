CREATE TABLE `preferences` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer,
	`data` jsonb,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `preferences_user_id_unique` ON `preferences` (`user_id`);