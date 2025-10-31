import { sql } from "drizzle-orm";
import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, telegramLeads, payments, signals, followups, TelegramLead, Payment, Signal, Followup } from "../drizzle/schema";
import { ENV } from './_core/env';
import { v4 as uuidv4 } from "uuid";

let _db: ReturnType<typeof drizzle> | null = null;

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
    const values: InsertUser = { id: user.id };
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

// Telegram Leads functions
export async function addTelegramLead(telegramId: string, firstName?: string, lastName?: string, username?: string): Promise<TelegramLead | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const id = uuidv4();
    await db.insert(telegramLeads).values({
      id,
      telegramId,
      firstName,
      lastName,
      username,
      status: "lead",
    }).onDuplicateKeyUpdate({
      set: { firstName, lastName, username },
    });

    const result = await db.select().from(telegramLeads).where(eq(telegramLeads.telegramId, telegramId)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to add telegram lead:", error);
    return null;
  }
}

export async function getTelegramLead(telegramId: string): Promise<TelegramLead | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(telegramLeads).where(eq(telegramLeads.telegramId, telegramId)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get telegram lead:", error);
    return null;
  }
}

export async function getAllLeads(): Promise<TelegramLead[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(telegramLeads).orderBy(desc(telegramLeads.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get all leads:", error);
    return [];
  }
}

// Payments functions
export async function recordPayment(telegramId: string, plan: string, amount: number, paymentMethod: string): Promise<Payment | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const id = uuidv4();
    await db.insert(payments).values({
      id,
      telegramId,
      plan,
      amount: amount.toString(),
      paymentMethod,
      status: "pending",
    });

    const result = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to record payment:", error);
    return null;
  }
}

export async function confirmPayment(paymentId: string): Promise<Payment | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.update(payments).set({
      status: "confirmed",
      confirmedAt: new Date(),
    }).where(eq(payments.id, paymentId));

    const result = await db.select().from(payments).where(eq(payments.id, paymentId)).limit(1);
    if (result.length > 0) {
      await db.update(telegramLeads).set({
        status: "paid",
      }).where(eq(telegramLeads.telegramId, result[0].telegramId));
    }
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to confirm payment:", error);
    return null;
  }
}

export async function getPaymentsByTelegramId(telegramId: string): Promise<Payment[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(payments).where(eq(payments.telegramId, telegramId)).orderBy(desc(payments.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get payments:", error);
    return [];
  }
}

export async function getAllPayments(): Promise<Payment[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(payments).orderBy(desc(payments.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get all payments:", error);
    return [];
  }
}

// Signals functions
export async function sendSignal(telegramId: string, signalText: string, entryPrice?: string, exitPrice?: string, stopLoss?: string, takeProfit?: string, type?: string): Promise<Signal | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const id = uuidv4();
    await db.insert(signals).values({
      id,
      telegramId,
      signalText,
      entryPrice,
      exitPrice,
      stopLoss,
      takeProfit,
      type,
      status: "active",
    });

    const result = await db.select().from(signals).where(eq(signals.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to send signal:", error);
    return null;
  }
}

export async function getSignalsByTelegramId(telegramId: string): Promise<Signal[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(signals).where(eq(signals.telegramId, telegramId)).orderBy(desc(signals.sentAt));
  } catch (error) {
    console.error("[Database] Failed to get signals:", error);
    return [];
  }
}

export async function getAllSignals(): Promise<Signal[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(signals).orderBy(desc(signals.sentAt));
  } catch (error) {
    console.error("[Database] Failed to get all signals:", error);
    return [];
  }
}

// Followups functions
export async function recordFollowup(telegramId: string, plan: string, reason?: string): Promise<Followup | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const id = uuidv4();
    await db.insert(followups).values({
      id,
      telegramId,
      plan,
      reason,
      status: "pending",
      followupCount: 0,
    });

    const result = await db.select().from(followups).where(eq(followups.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to record followup:", error);
    return null;
  }
}

export async function getFollowupsByTelegramId(telegramId: string): Promise<Followup[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(followups).where(eq(followups.telegramId, telegramId)).orderBy(desc(followups.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get followups:", error);
    return [];
  }
}

export async function getPendingFollowups(): Promise<Followup[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(followups).where(eq(followups.status, "pending")).orderBy(desc(followups.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get pending followups:", error);
    return [];
  }
}

export async function updateFollowupStatus(followupId: string, status: "pending" | "sent" | "converted"): Promise<Followup | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.update(followups).set({
      status,
      lastFollowupAt: new Date(),
    }).where(eq(followups.id, followupId));

    const result = await db.select().from(followups).where(eq(followups.id, followupId)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to update followup:", error);
    return null;
  }
}

// Analytics functions
export async function getLeadStats(): Promise<{ total: number; paid: number; leads: number; inactive: number }> {
  const db = await getDb();
  if (!db) return { total: 0, paid: 0, leads: 0, inactive: 0 };

  try {
    const allLeads = await db.select().from(telegramLeads);
    return {
      total: allLeads.length,
      paid: allLeads.filter(l => l.status === "paid").length,
      leads: allLeads.filter(l => l.status === "lead").length,
      inactive: allLeads.filter(l => l.status === "inactive").length,
    };
  } catch (error) {
    console.error("[Database] Failed to get lead stats:", error);
    return { total: 0, paid: 0, leads: 0, inactive: 0 };
  }
}

export async function getRevenueStats(): Promise<{ total: number; pending: number; confirmed: number }> {
  const db = await getDb();
  if (!db) return { total: 0, pending: 0, confirmed: 0 };

  try {
    const allPayments = await db.select().from(payments);
    const total = allPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const pending = allPayments.filter(p => p.status === "pending").reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const confirmed = allPayments.filter(p => p.status === "confirmed").reduce((sum, p) => sum + parseFloat(p.amount), 0);
    
    return { total, pending, confirmed };
  } catch (error) {
    console.error("[Database] Failed to get revenue stats:", error);
    return { total: 0, pending: 0, confirmed: 0 };
  }
}

// Trade functions
export async function createOrUpdateTrade(trade: any): Promise<any> {
  return trade;
}

// Trade functions

// Email follow-up functions
export async function recordEmailSent(telegramId: string, email: string, followupLevel: 1 | 2 | 3): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    const followup = await db.select().from(followups).where(eq(followups.telegramId, telegramId)).limit(1);
    
    if (followup.length > 0) {
      await db.update(followups)
        .set({
          followupCount: followup[0].followupCount + 1,
          nextFollowupAt: new Date(),
          status: 'sent',
        })
        .where(eq(followups.id, followup[0].id));
    }
  } catch (error) {
    console.error("[Database] Failed to record email sent:", error);
  }
}

export async function getFollowupsNeedingEmail(): Promise<any[]> {
  try {
    const db = await getDb();
    if (!db) return [];

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get followups that need email based on timing
    const result = await db.select().from(followups).where(
      sql`(followupCount = 0 AND createdAt <= ${oneDayAgo}) OR
          (followupCount = 1 AND nextFollowupAt <= ${threeDaysAgo}) OR
          (followupCount = 2 AND nextFollowupAt <= ${sevenDaysAgo})`
    );

    return result;
  } catch (error) {
    console.error("[Database] Failed to get followups needing email:", error);
    return [];
  }
}

export async function getLeadEmailByTelegramId(telegramId: string): Promise<string | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    // For now, we don't have email storage in the database
    // In production, you would collect emails from users via the bot
    // Return null to skip email sending until emails are collected
    return null;
  } catch (error) {
    console.error("[Database] Failed to get lead email:", error);
    return null;
  }
}



export async function createLead(data: {
  telegramId: string;
  firstName: string;
  username?: string;
  status: string;
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create lead: database not available");
    return null;
  }

  try {
    const result = await db.insert(telegramLeads).values({
      id: `lead_${data.telegramId}`,
      telegramId: data.telegramId,
      firstName: data.firstName,
      username: data.username,
      status: data.status as "lead" | "paid" | "inactive",
    }).onDuplicateKeyUpdate({
      set: { updatedAt: new Date() }
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to create lead:", error);
    throw error;
  }
}


export async function createPayment(data: {
  telegramId: string;
  plan: string;
  amount: number;
  paymentMethod: string;
  status: string;
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create payment: database not available");
    return null;
  }

  try {
    const result = await db.insert(payments).values({
      id: `payment_${Date.now()}_${data.telegramId}`,
      telegramId: data.telegramId,
      plan: data.plan,
      amount: data.amount as any,
      paymentMethod: data.paymentMethod,
      status: data.status as "pending" | "confirmed" | "failed",
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to create payment:", error);
    throw error;
  }
}

export async function getConfirmedPayments() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get confirmed payments: database not available");
    return [];
  }

  try {
    const result = await db.select().from(payments).where(eq(payments.status, 'confirmed'));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get confirmed payments:", error);
    return [];
  }
}

