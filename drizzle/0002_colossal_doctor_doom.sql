CREATE TABLE `followups` (
	`id` varchar(64) NOT NULL,
	`telegramId` varchar(64) NOT NULL,
	`plan` varchar(64) NOT NULL,
	`reason` text,
	`status` enum('pending','sent','converted') NOT NULL DEFAULT 'pending',
	`followupCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	`lastFollowupAt` timestamp,
	`nextFollowupAt` timestamp,
	CONSTRAINT `followups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` varchar(64) NOT NULL,
	`telegramId` varchar(64) NOT NULL,
	`plan` varchar(64) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`paymentMethod` varchar(64) NOT NULL,
	`status` enum('pending','confirmed','failed') NOT NULL DEFAULT 'pending',
	`screenshotUrl` text,
	`createdAt` timestamp DEFAULT (now()),
	`confirmedAt` timestamp,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `signals` (
	`id` varchar(64) NOT NULL,
	`telegramId` varchar(64) NOT NULL,
	`signalText` text NOT NULL,
	`entryPrice` varchar(64),
	`exitPrice` varchar(64),
	`stopLoss` varchar(64),
	`takeProfit` varchar(64),
	`type` varchar(64),
	`status` varchar(64),
	`sentAt` timestamp DEFAULT (now()),
	`closedAt` timestamp,
	CONSTRAINT `signals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `telegram_leads` (
	`id` varchar(64) NOT NULL,
	`telegramId` varchar(64) NOT NULL,
	`firstName` varchar(255),
	`lastName` varchar(255),
	`username` varchar(255),
	`status` enum('lead','paid','inactive') NOT NULL DEFAULT 'lead',
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `telegram_leads_id` PRIMARY KEY(`id`),
	CONSTRAINT `telegram_leads_telegramId_unique` UNIQUE(`telegramId`)
);
