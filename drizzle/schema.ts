import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Backtesting metrics table
export const backtestingMetrics = mysqlTable("backtesting_metrics", {
  id: varchar("id", { length: 64 }).primaryKey(),
  symbol: varchar("symbol", { length: 64 }).notNull(),
  initialCapital: int("initialCapital").notNull(),
  netProfit: int("netProfit").notNull(),
  netProfitPercent: varchar("netProfitPercent", { length: 64 }).notNull(),
  totalTrades: int("totalTrades").notNull(),
  winRate: varchar("winRate", { length: 64 }).notNull(),
  avgPnl: varchar("avgPnl", { length: 64 }).notNull(),
  profitFactor: varchar("profitFactor", { length: 64 }).notNull(),
  maxDrawdown: varchar("maxDrawdown", { length: 64 }).notNull(),
  monthlyReturnPercent: varchar("monthlyReturnPercent", { length: 64 }).notNull(),
  quarterlyReturnPercent: varchar("quarterlyReturnPercent", { length: 64 }).notNull(),
  annualReturnPercent: varchar("annualReturnPercent", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type BacktestingMetrics = typeof backtestingMetrics.$inferSelect;
export type InsertBacktestingMetrics = typeof backtestingMetrics.$inferInsert;

// Live trades table
export const liveTrades = mysqlTable("live_trades", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tradeId: varchar("tradeId", { length: 64 }).notNull(),
  type: varchar("type", { length: 64 }).notNull(), // 'LONG' or 'SHORT'
  entryPrice: varchar("entryPrice", { length: 64 }).notNull(),
  exitPrice: varchar("exitPrice", { length: 64 }),
  quantity: varchar("quantity", { length: 64 }).notNull(),
  entryTime: timestamp("entryTime").notNull(),
  exitTime: timestamp("exitTime"),
  pnl: varchar("pnl", { length: 64 }),
  pnlPercent: varchar("pnlPercent", { length: 64 }),
  status: varchar("status", { length: 64 }).notNull(), // 'OPEN' or 'CLOSED'
  signal: varchar("signal", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type LiveTrade = typeof liveTrades.$inferSelect;
export type InsertLiveTrade = typeof liveTrades.$inferInsert;

// Telegram users/leads table
export const telegramLeads = mysqlTable("telegram_leads", {
  id: varchar("id", { length: 64 }).primaryKey(),
  telegramId: varchar("telegramId", { length: 64 }).notNull().unique(),
  firstName: varchar("firstName", { length: 255 }),
  lastName: varchar("lastName", { length: 255 }),
  username: varchar("username", { length: 255 }),
  status: mysqlEnum("status", ["lead", "paid", "inactive"]).default("lead").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type TelegramLead = typeof telegramLeads.$inferSelect;
export type InsertTelegramLead = typeof telegramLeads.$inferInsert;

// Payments table
export const payments = mysqlTable("payments", {
  id: varchar("id", { length: 64 }).primaryKey(),
  telegramId: varchar("telegramId", { length: 64 }).notNull(),
  plan: varchar("plan", { length: 64 }).notNull(), // 'monthly', 'quarterly', 'vip_unlimited'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("paymentMethod", { length: 64 }).notNull(), // 'paypal', 'crypto'
  status: mysqlEnum("status", ["pending", "confirmed", "failed"]).default("pending").notNull(),
  screenshotUrl: text("screenshotUrl"),
  createdAt: timestamp("createdAt").defaultNow(),
  confirmedAt: timestamp("confirmedAt"),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

// Trading signals sent to users
export const signals = mysqlTable("signals", {
  id: varchar("id", { length: 64 }).primaryKey(),
  telegramId: varchar("telegramId", { length: 64 }).notNull(),
  signalText: text("signalText").notNull(),
  entryPrice: varchar("entryPrice", { length: 64 }),
  exitPrice: varchar("exitPrice", { length: 64 }),
  stopLoss: varchar("stopLoss", { length: 64 }),
  takeProfit: varchar("takeProfit", { length: 64 }),
  type: varchar("type", { length: 64 }), // 'LONG', 'SHORT'
  status: varchar("status", { length: 64 }), // 'active', 'closed', 'hit_tp', 'hit_sl'
  sentAt: timestamp("sentAt").defaultNow(),
  closedAt: timestamp("closedAt"),
});

export type Signal = typeof signals.$inferSelect;
export type InsertSignal = typeof signals.$inferInsert;

// Follow-up messages for non-paying users
export const followups = mysqlTable("followups", {
  id: varchar("id", { length: 64 }).primaryKey(),
  telegramId: varchar("telegramId", { length: 64 }).notNull(),
  plan: varchar("plan", { length: 64 }).notNull(),
  reason: text("reason"),
  status: mysqlEnum("status", ["pending", "sent", "converted"]).default("pending").notNull(),
  followupCount: int("followupCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastFollowupAt: timestamp("lastFollowupAt"),
  nextFollowupAt: timestamp("nextFollowupAt"),
});

export type Followup = typeof followups.$inferSelect;
export type InsertFollowup = typeof followups.$inferInsert;
