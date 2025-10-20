import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  backtestingMetrics,
  InsertBacktestingMetrics,
  InsertLiveTrade,
  InsertUser,
  liveTrades,
  users,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getBacktestingMetrics(symbol: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(backtestingMetrics)
    .where(eq(backtestingMetrics.symbol, symbol))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAllLiveTrades() {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(liveTrades)
    .orderBy(desc(liveTrades.createdAt));

  return result;
}

export async function getOpenTrades() {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(liveTrades)
    .where(eq(liveTrades.status, 'OPEN'))
    .orderBy(desc(liveTrades.entryTime));

  return result;
}

export async function createOrUpdateTrade(trade: InsertLiveTrade) {
  const db = await getDb();
  if (!db) return;

  if (!trade.id) {
    trade.id = `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  await db
    .insert(liveTrades)
    .values(trade)
    .onDuplicateKeyUpdate({
      set: {
        exitPrice: trade.exitPrice,
        exitTime: trade.exitTime,
        pnl: trade.pnl,
        pnlPercent: trade.pnlPercent,
        status: trade.status,
        updatedAt: new Date(),
      },
    });
}

export async function upsertBacktestingMetrics(
  metrics: InsertBacktestingMetrics
) {
  const db = await getDb();
  if (!db) return;

  if (!metrics.id) {
    metrics.id = `metrics_${metrics.symbol}_${Date.now()}`;
  }

  await db
    .insert(backtestingMetrics)
    .values(metrics)
    .onDuplicateKeyUpdate({
      set: metrics,
    });
}
