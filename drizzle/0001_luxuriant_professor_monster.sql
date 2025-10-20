CREATE TABLE `backtesting_metrics` (
	`id` varchar(64) NOT NULL,
	`symbol` varchar(64) NOT NULL,
	`initialCapital` int NOT NULL,
	`netProfit` int NOT NULL,
	`netProfitPercent` varchar(64) NOT NULL,
	`totalTrades` int NOT NULL,
	`winRate` varchar(64) NOT NULL,
	`avgPnl` varchar(64) NOT NULL,
	`profitFactor` varchar(64) NOT NULL,
	`maxDrawdown` varchar(64) NOT NULL,
	`monthlyReturnPercent` varchar(64) NOT NULL,
	`quarterlyReturnPercent` varchar(64) NOT NULL,
	`annualReturnPercent` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `backtesting_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `live_trades` (
	`id` varchar(64) NOT NULL,
	`tradeId` varchar(64) NOT NULL,
	`type` varchar(64) NOT NULL,
	`entryPrice` varchar(64) NOT NULL,
	`exitPrice` varchar(64),
	`quantity` varchar(64) NOT NULL,
	`entryTime` timestamp NOT NULL,
	`exitTime` timestamp,
	`pnl` varchar(64),
	`pnlPercent` varchar(64),
	`status` varchar(64) NOT NULL,
	`signal` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `live_trades_id` PRIMARY KEY(`id`)
);
