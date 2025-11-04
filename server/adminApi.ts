import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { 
  getAllLeads,
  getAllPayments,
  confirmPayment,
  getTelegramLead
} from "./db";
import axios from "axios";

// Get bot URL from environment or use default
const BOT_URL = process.env.BOT_URL || "https://growthx-bot.onrender.com";
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export const adminRouter = router({
  // Get all leads with their payment status
  getLeadsWithPayments: publicProcedure.query(async () => {
    try {
      const leads = await getAllLeads();
      const payments = await getAllPayments();
      
      // Combine leads with their payments
      const leadsWithPayments = leads.map(lead => {
        const userPayments = payments.filter(p => p.telegramId === lead.telegramId);
        const lastPayment = userPayments[0]; // Already sorted by desc
        
        return {
          ...lead,
          payments: userPayments,
          lastPayment,
          totalPaid: userPayments
            .filter(p => p.status === "confirmed")
            .reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0),
        };
      });
      
      return leadsWithPayments;
    } catch (error) {
      console.error("Error getting leads with payments:", error);
      return [];
    }
  }),

  // Approve user and activate subscription in Telegram bot
  approveUser: publicProcedure
    .input(z.object({
      telegramId: z.string(),
      tier: z.enum(["basic", "pro", "vip", "premium"]),
      plan: z.enum(["monthly", "quarterly", "yearly", "lifetime"]),
    }))
    .mutation(async ({ input }) => {
      try {
        // First, find the payment to confirm
        const payments = await getAllPayments();
        const userPayments = payments.filter(p => 
          p.telegramId === input.telegramId && p.status === "pending"
        );
        
        // Confirm the payment in dashboard database
        if (userPayments.length > 0) {
          await confirmPayment(userPayments[0].id);
        }
        
        // Activate subscription in Telegram bot via webhook
        if (BOT_TOKEN) {
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
                  "X-Admin-Token": BOT_TOKEN, // Use bot token as admin auth
                },
                timeout: 10000,
              }
            );
            
            return { 
              success: true, 
              message: "User approved and subscription activated",
              botResponse: response.data 
            };
          } catch (botError: any) {
            console.error("Error activating in bot:", botError.message);
            return { 
              success: false, 
              error: `Payment confirmed in dashboard, but bot activation failed: ${botError.message}` 
            };
          }
        }
        
        return { 
          success: true, 
          message: "Payment confirmed in dashboard. Please activate manually in bot using /activate command." 
        };
      } catch (error) {
        console.error("Error approving user:", error);
        return { success: false, error: String(error) };
      }
    }),

  // Get dashboard statistics
  getStats: publicProcedure.query(async () => {
    try {
      const leads = await getAllLeads();
      const payments = await getAllPayments();
      
      const totalLeads = leads.length;
      const paidUsers = leads.filter(l => l.status === "paid").length;
      const pendingPayments = payments.filter(p => p.status === "pending").length;
      const totalRevenue = payments
        .filter(p => p.status === "confirmed")
        .reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0);
      
      return {
        totalLeads,
        paidUsers,
        pendingPayments,
        totalRevenue,
      };
    } catch (error) {
      console.error("Error getting stats:", error);
      return {
        totalLeads: 0,
        paidUsers: 0,
        pendingPayments: 0,
        totalRevenue: 0,
      };
    }
  }),
});
