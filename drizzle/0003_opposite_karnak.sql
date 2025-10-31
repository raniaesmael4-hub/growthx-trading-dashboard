CREATE TABLE `public_signals` (
	`id` varchar(64) NOT NULL,
	`tradeNumber` int NOT NULL,
	`signal` varchar(64) NOT NULL,
	`dateTime` varchar(64) NOT NULL,
	`price` varchar(64) NOT NULL,
	`pnlUsd` varchar(64),
	`pnlPercent` varchar(64),
	`status` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `public_signals_id` PRIMARY KEY(`id`)
);
