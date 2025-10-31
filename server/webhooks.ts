import { Router, Request, Response } from 'express';
import { z } from 'zod';
import * as db from './db';
import { sendSignalToUser } from './_core/telegramService';

const router = Router();

// Webhook secret for security
const WEBHOOK_SECRET = process.env.TRADINGVIEW_WEBHOOK_SECRET || 'your-secret-key';

// Zod schema for TradingView webhook payload
const TradingViewSignalSchema = z.object({
  symbol: z.string(),
  action: z.enum(['buy', 'sell', 'close']),
  price: z.string().optional(),
  message: z.string().optional(),
  entryPrice: z.string().optional(),
  exitPrice: z.string().optional(),
  stopLoss: z.string().optional(),
  takeProfit: z.string().optional(),
});

type TradingViewSignal = z.infer<typeof TradingViewSignalSchema>;

/**
 * POST /api/webhooks/tradingview
 * Receives signals from TradingView Pine Script
 * Broadcasts to all paid users via Telegram
 */
router.post('/tradingview', async (req: Request, res: Response) => {
  try {
    // Verify webhook secret
    const secret = req.headers['x-webhook-secret'] as string;
    if (secret !== WEBHOOK_SECRET) {
      console.warn('[Webhook] Unauthorized webhook attempt');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Parse and validate payload
    const payload = TradingViewSignalSchema.parse(req.body);
    console.log('[Webhook] Received signal:', payload);

    // Get all users with CONFIRMED payments only
    const leads = await db.getAllLeads();
    const confirmedPayments = await db.getConfirmedPayments();
    const confirmedUserIds = new Set(confirmedPayments.map((p: any) => p.telegramId));
    const paidUsers = leads.filter(l => confirmedUserIds.has(l.telegramId));

    if (paidUsers.length === 0) {
      console.log('[Webhook] No paid users to send signal to');
      return res.json({ success: true, sent: 0, message: 'No paid users' });
    }

    // Format signal message
    const signalMessage = formatSignalMessage(payload);

    // Send signal to all paid users
    let sent = 0;
    let failed = 0;

    for (const user of paidUsers) {
      try {
        const success = await sendSignalToUser(user.telegramId, {
          message: signalMessage,
          entryPrice: payload.entryPrice,
          exitPrice: payload.exitPrice,
          stopLoss: payload.stopLoss,
          takeProfit: payload.takeProfit,
          type: payload.action,
        });

        if (success) {
          sent++;
          // Record signal in database
          await db.sendSignal(
            user.telegramId,
            signalMessage,
            payload.entryPrice,
            payload.exitPrice,
            payload.stopLoss,
            payload.takeProfit,
            payload.action
          );
        } else {
          failed++;
        }
      } catch (error) {
        console.error('[Webhook] Error sending signal to user:', error);
        failed++;
      }
    }

    console.log(`[Webhook] Signal broadcast complete: ${sent} sent, ${failed} failed`);

    res.json({
      success: true,
      sent,
      failed,
      total: paidUsers.length,
      message: `Signal sent to ${sent} users`,
    });
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    res.status(400).json({
      error: 'Invalid webhook payload',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/webhooks/test
 * Test endpoint to verify webhook is working
 */
router.get('/test', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Webhook endpoint is running',
    endpoint: '/api/webhooks/tradingview',
    method: 'POST',
    headers_required: {
      'x-webhook-secret': 'Your webhook secret',
      'content-type': 'application/json',
    },
    example_payload: {
      symbol: 'SOL/USDT',
      action: 'buy',
      message: 'Strong buy signal on SOL',
      entryPrice: '150.50',
      exitPrice: '160.00',
      stopLoss: '145.00',
      takeProfit: '170.00',
    },
  });
});

/**
 * Format signal data into a readable message
 */
function formatSignalMessage(signal: TradingViewSignal): string {
  let message = `${signal.symbol} - ${signal.action.toUpperCase()} SIGNAL\n\n`;

  if (signal.message) {
    message += `${signal.message}\n\n`;
  }

  if (signal.price) {
    message += `Current Price: $${signal.price}\n`;
  }

  return message;
}

export default router;
