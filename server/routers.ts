import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { botRouter } from "./botApi";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { z } from "zod";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  bot: botRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  admin: router({
    getLeads: publicProcedure.query(async () => {
      return await db.getAllLeads();
    }),

    getLeadStats: publicProcedure.query(async () => {
      return await db.getLeadStats();
    }),

    getPayments: publicProcedure.query(async () => {
      return await db.getAllPayments();
    }),

    getRevenueStats: publicProcedure.query(async () => {
      return await db.getRevenueStats();
    }),

    getSignals: publicProcedure.query(async () => {
      return await db.getAllSignals();
    }),

    getPendingFollowups: publicProcedure.query(async () => {
      return await db.getPendingFollowups();
    }),

    sendSignal: publicProcedure
      .input(z.object({
        telegramId: z.string(),
        signalText: z.string(),
        entryPrice: z.string().optional(),
        exitPrice: z.string().optional(),
        stopLoss: z.string().optional(),
        takeProfit: z.string().optional(),
        type: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const signal = await db.sendSignal(
          input.telegramId,
          input.signalText,
          input.entryPrice,
          input.exitPrice,
          input.stopLoss,
          input.takeProfit,
          input.type
        );
        return signal;
      }),

    broadcastSignal: publicProcedure
      .input(z.object({
        signalText: z.string(),
        entryPrice: z.string().optional(),
        exitPrice: z.string().optional(),
        stopLoss: z.string().optional(),
        takeProfit: z.string().optional(),
        type: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const leads = await db.getAllLeads();
        const paidUsers = leads.filter(l => l.status === 'paid');
        
        const signals = await Promise.all(
          paidUsers.map(user =>
            db.sendSignal(
              user.telegramId,
              input.signalText,
              input.entryPrice,
              input.exitPrice,
              input.stopLoss,
              input.takeProfit,
              input.type
            )
          )
        );
        
        return { signalsSent: signals.length, totalPaidUsers: paidUsers.length };
      }),

    confirmPayment: publicProcedure
      .input(z.object({
        paymentId: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await db.confirmPayment(input.paymentId);
      }),

    approveUser: publicProcedure
      .input(z.object({
        telegramId: z.string(),
        tier: z.enum(["basic", "pro", "vip", "premium"]),
        plan: z.enum(["monthly", "quarterly", "yearly", "lifetime"]),
      }))
      .mutation(async ({ input }) => {
        try {
          // Find pending payment for this user
          const payments = await db.getAllPayments();
          const userPayment = payments.find(p => 
            p.telegramId === input.telegramId && p.status === "pending"
          );
          
          // Confirm payment in dashboard database
          if (userPayment) {
            await db.confirmPayment(userPayment.id);
          }
          
          // Call Telegram bot to activate subscription
          const BOT_URL = process.env.BOT_URL || "https://growthx-bot.onrender.com";
          const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
          
          if (BOT_TOKEN) {
            const axios = (await import('axios')).default;
            try {
              const response = await axios.post(
                `${BOT_URL}/admin/activate-subscription`,
                {
                  telegram_id: input.telegramId,
                  tier: input.tier,
                  plan: input.plan,
                },
                {
                  headers: {
                    "Content-Type": "application/json",
                    "X-Admin-Token": BOT_TOKEN,
                  },
                  timeout: 10000,
                }
              );
              
              return { 
                success: true, 
                message: "User approved and subscription activated in bot",
                botResponse: response.data 
              };
            } catch (botError: any) {
              console.error("Error activating in bot:", botError.message);
              return { 
                success: false, 
                error: `Payment confirmed, but bot activation failed: ${botError.message}` 
              };
            }
          }
          
          return { 
            success: true, 
            message: "Payment confirmed. Activate manually in bot with /activate command." 
          };
        } catch (error) {
          console.error("Error approving user:", error);
          return { success: false, error: String(error) };
        }
      }),

    sendFollowup: publicProcedure
      .input(z.object({
        followupId: z.string(),
        message: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.updateFollowupStatus(input.followupId, 'sent');
        return { success: true };
      }),

    markLeadInactive: publicProcedure
      .input(z.object({
        telegramId: z.string(),
      }))
      .mutation(async ({ input }) => {
        return { success: true };
      }),

    getLeadDetails: publicProcedure
      .input(z.object({
        telegramId: z.string(),
      }))
      .query(async ({ input }) => {
        const lead = await db.getTelegramLead(input.telegramId);
        const payments = await db.getPaymentsByTelegramId(input.telegramId);
        const signals = await db.getSignalsByTelegramId(input.telegramId);
        const followups = await db.getFollowupsByTelegramId(input.telegramId);

        return {
          lead,
          payments,
          signals,
          followups,
        };
      }),
  }),

  telegram: router({
    sendFollowupMessage: publicProcedure
      .input(z.object({
        telegramId: z.string(),
        followupLevel: z.enum(['1', '2', '3']),
      }))
      .mutation(async ({ input }) => {
        const { sendFollowupToUser } = await import('./_core/telegramService');
        const level = parseInt(input.followupLevel) as 1 | 2 | 3;
        const sent = await sendFollowupToUser(input.telegramId, level);
        
        return { success: sent, message: sent ? 'Message sent successfully' : 'Failed to send message' };
      }),

    sendBulkFollowupMessages: publicProcedure
      .input(z.object({
        followupLevel: z.enum(['1', '2', '3']),
      }))
      .mutation(async ({ input }) => {
        const { sendFollowupToUser } = await import('./_core/telegramService');
        const followups = await db.getFollowupsNeedingEmail();
        
        let sent = 0;
        let failed = 0;

        for (const followup of followups) {
          const email = await db.getLeadEmailByTelegramId(followup.telegramId);
          const lead = await db.getTelegramLead(followup.telegramId);

          if (email && lead) {
            const level = parseInt(input.followupLevel) as 1 | 2 | 3;
            const emailSent = await sendFollowupToUser(email, lead.firstName || 'User', level);
            
            if (emailSent) {
              await db.recordEmailSent(followup.telegramId, email, level);
              sent++;
            } else {
              failed++;
            }
          }
        }

        return { success: true, sent, failed, total: followups.length };
      }),

    getEmailTemplates: publicProcedure.query(async () => {
      const { emailTemplates } = await import('./_core/emailService');
      return {
        followup1: {
          subject: emailTemplates.followup1.subject,
          preview: 'First follow-up email - Don\'t miss out reminder',
        },
        followup2: {
          subject: emailTemplates.followup2.subject,
          preview: 'Second follow-up email - Limited time discount offer',
        },
        followup3: {
          subject: emailTemplates.followup3.subject,
          preview: 'Third follow-up email - Social proof & testimonials',
        },
      };
    }),
  }),

  trading: router({
    initializeMetrics: publicProcedure
      .input(z.object({
        symbol: z.string(),
        initialCapital: z.number(),
        netProfit: z.number(),
        netProfitPercent: z.number(),
        totalTrades: z.number(),
        winRate: z.number(),
        avgPnl: z.number(),
        profitFactor: z.number(),
        maxDrawdown: z.number(),
        monthlyReturnPercent: z.number(),
        quarterlyReturnPercent: z.number().optional(),
        annualReturnPercent: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return { success: true };
      }),

    getBacktestingMetrics: publicProcedure.query(async () => {
      return {
        id: "default",
        symbol: "SOL/USDT",
        initialCapital: 10000,
        netProfit: 77953,
        netProfitPercent: "779.54",
        totalTrades: 24431,
        winRate: "73.64",
        avgPnl: "3.19",
        profitFactor: "1.441",
        maxDrawdown: "7884.11",
        monthlyReturnPercent: "12.99",
        quarterlyReturnPercent: "39.99",
        annualReturnPercent: "155.91",
        createdAt: new Date(),
      };
    }),

    getLiveTrades: publicProcedure.query(async () => {
      return [];
    }),

    getAllTrades: publicProcedure.query(async () => {
      return await db.getAllLiveTrades();
    }),
  }),
});

export type AppRouter = typeof appRouter;
