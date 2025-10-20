import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  getBacktestingMetrics,
  getAllLiveTrades,
  getOpenTrades,
  createOrUpdateTrade,
  upsertBacktestingMetrics,
} from "./db";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  trading: router({
    getBacktestingMetrics: publicProcedure
      .input(z.object({ symbol: z.string() }))
      .query(async ({ input }) => {
        return await getBacktestingMetrics(input.symbol);
      }),

    getAllTrades: publicProcedure.query(async () => {
      return await getAllLiveTrades();
    }),

    getOpenTrades: publicProcedure.query(async () => {
      return await getOpenTrades();
    }),

    webhook: publicProcedure
      .input(
        z.object({
          tradeId: z.string(),
          type: z.enum(["LONG", "SHORT"]),
          entryPrice: z.string(),
          exitPrice: z.string().optional(),
          quantity: z.string(),
          entryTime: z.string(),
          exitTime: z.string().optional(),
          pnl: z.string().optional(),
          pnlPercent: z.string().optional(),
          status: z.enum(["OPEN", "CLOSED"]),
          signal: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await createOrUpdateTrade({
          id: input.tradeId,
          tradeId: input.tradeId,
          type: input.type,
          entryPrice: input.entryPrice,
          exitPrice: input.exitPrice,
          quantity: input.quantity,
          entryTime: new Date(input.entryTime),
          exitTime: input.exitTime ? new Date(input.exitTime) : undefined,
          pnl: input.pnl,
          pnlPercent: input.pnlPercent,
          status: input.status,
          signal: input.signal,
        });
        return { success: true };
      }),

    initializeMetrics: publicProcedure
      .input(
        z.object({
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
          quarterlyReturnPercent: z.number(),
          annualReturnPercent: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        await upsertBacktestingMetrics({
          id: `metrics_${input.symbol}_${Date.now()}`,
          symbol: input.symbol,
          initialCapital: input.initialCapital,
          netProfit: input.netProfit,
          netProfitPercent: input.netProfitPercent.toString(),
          totalTrades: input.totalTrades,
          winRate: input.winRate.toString(),
          avgPnl: input.avgPnl.toString(),
          profitFactor: input.profitFactor.toString(),
          maxDrawdown: input.maxDrawdown.toString(),
          monthlyReturnPercent: input.monthlyReturnPercent.toString(),
          quarterlyReturnPercent: input.quarterlyReturnPercent.toString(),
          annualReturnPercent: input.annualReturnPercent.toString(),
        });
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

