CREATE TABLE `tokens` (
	`user_id` integer PRIMARY KEY NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tokens_user_id_unique` ON `tokens` (`user_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`avatar` text NOT NULL,
	`city` text,
	`country` text,
	`sex` text,
	`weight` integer,
	`created_at` integer
);
