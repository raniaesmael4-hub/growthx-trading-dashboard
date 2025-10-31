import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { 
  createLead, 
  createPayment,
  getAllLeads,
  getAllPayments
} from "./db";

export const botRouter = router({
  recordLead: publicProcedure
    .input(z.object({
      telegramId: z.string(),
      firstName: z.string(),
      username: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        await createLead({
          telegramId: input.telegramId,
          firstName: input.firstName,
          username: input.username,
          status: "lead",
        });
        return { success: true };
      } catch (error) {
        console.error("Error recording lead:", error);
        return { success: false, error: String(error) };
      }
    }),

  recordPayment: publicProcedure
    .input(z.object({
      telegramId: z.string(),
      plan: z.string(),
      amount: z.number(),
      paymentMethod: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        await createPayment({
          telegramId: input.telegramId,
          plan: input.plan,
          amount: input.amount,
          paymentMethod: input.paymentMethod,
          status: "pending",
        });
        return { success: true };
      } catch (error) {
        console.error("Error recording payment:", error);
        return { success: false, error: String(error) };
      }
    }),

  getLeads: publicProcedure.query(async () => {
    try {
      return await getAllLeads();
    } catch (error) {
      console.error("Error getting leads:", error);
      return [];
    }
  }),

  getPayments: publicProcedure.query(async () => {
    try {
      return await getAllPayments();
    } catch (error) {
      console.error("Error getting payments:", error);
      return [];
    }
  }),
});
