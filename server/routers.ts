import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
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

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  admin: router({
    getLeads: adminProcedure.query(async () => {
      return await db.getAllLeads();
    }),

    getLeadStats: adminProcedure.query(async () => {
      return await db.getLeadStats();
    }),

    getPayments: adminProcedure.query(async () => {
      return await db.getAllPayments();
    }),

    getRevenueStats: adminProcedure.query(async () => {
      return await db.getRevenueStats();
    }),

    getSignals: adminProcedure.query(async () => {
      return await db.getAllSignals();
    }),

    getPendingFollowups: adminProcedure.query(async () => {
      return await db.getPendingFollowups();
    }),

    sendSignal: adminProcedure
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

    broadcastSignal: adminProcedure
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

    confirmPayment: adminProcedure
      .input(z.object({
        paymentId: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await db.confirmPayment(input.paymentId);
      }),

    sendFollowup: adminProcedure
      .input(z.object({
        followupId: z.string(),
        message: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.updateFollowupStatus(input.followupId, 'sent');
        return { success: true };
      }),

    markLeadInactive: adminProcedure
      .input(z.object({
        telegramId: z.string(),
      }))
      .mutation(async ({ input }) => {
        return { success: true };
      }),

    getLeadDetails: adminProcedure
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
    sendFollowupMessage: adminProcedure
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

    sendBulkFollowupMessages: adminProcedure
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

    getEmailTemplates: adminProcedure.query(async () => {
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
