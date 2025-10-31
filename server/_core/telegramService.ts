import axios from 'axios';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export interface SignalData {
  message: string;
  entryPrice?: string;
  exitPrice?: string;
  stopLoss?: string;
  takeProfit?: string;
  type?: string;
}

/**
 * Send a trading signal to a user via Telegram
 */
export async function sendSignalToUser(telegramId: string, signal: SignalData): Promise<boolean> {
  try {
    if (!TELEGRAM_BOT_TOKEN) {
      console.warn('[Telegram] Bot token not configured');
      return false;
    }

    const messageText = formatSignalMessage(signal);
    
    const response = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
      chat_id: telegramId,
      text: messageText,
      parse_mode: 'HTML',
    });

    if (response.data.ok) {
      console.log(`[Telegram] Signal sent to ${telegramId}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('[Telegram] Failed to send signal:', error);
    return false;
  }
}

/**
 * Send a follow-up message to a non-paying user
 */
export async function sendFollowupToUser(telegramId: string, followupLevel: 1 | 2 | 3): Promise<boolean> {
  try {
    if (!TELEGRAM_BOT_TOKEN) {
      console.warn('[Telegram] Bot token not configured');
      return false;
    }

    const messageText = getFollowupMessage(followupLevel);
    
    const response = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
      chat_id: telegramId,
      text: messageText,
      parse_mode: 'HTML',
    });

    if (response.data.ok) {
      console.log(`[Telegram] Follow-up ${followupLevel} sent to ${telegramId}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('[Telegram] Failed to send follow-up:', error);
    return false;
  }
}

/**
 * Format signal data into a nice Telegram message
 */
function formatSignalMessage(signal: SignalData): string {
  let message = `<b>🚀 NEW TRADING SIGNAL</b>\n\n`;
  message += `<b>Signal:</b>\n${signal.message}\n\n`;
  
  if (signal.entryPrice) {
    message += `<b>Entry Price:</b> $${signal.entryPrice}\n`;
  }
  if (signal.exitPrice) {
    message += `<b>Exit Price:</b> $${signal.exitPrice}\n`;
  }
  if (signal.stopLoss) {
    message += `<b>Stop Loss:</b> $${signal.stopLoss}\n`;
  }
  if (signal.takeProfit) {
    message += `<b>Take Profit:</b> $${signal.takeProfit}\n`;
  }
  
  message += `\n<i>Sent at ${new Date().toLocaleString()}</i>`;
  
  return message;
}

/**
 * Get follow-up message based on level
 */
function getFollowupMessage(level: 1 | 2 | 3): string {
  const messages = {
    1: `<b>Don't Miss Out! 🎯</b>\n\nHey! We noticed you're interested in our trading signals.\n\n<b>Our Results:</b>\n• 73.64% Win Rate\n• +779.54% Total Return\n• +12.99% Monthly Average\n\nJoin our paid members and start receiving exclusive trading signals!\n\n<b>Plans:</b>\n• Monthly: $100\n• Quarterly: $249.99\n• VIP Unlimited: $500/year\n\nClick below to upgrade:`,
    2: `<b>Limited Time Offer! 🎁</b>\n\nWe're offering <b>50% OFF</b> on annual plans this week only!\n\nInstead of $500/year for VIP Unlimited, get it for just <b>$250</b>!\n\n<b>What You Get:</b>\n✅ Unlimited trading signals\n✅ 5 concurrent positions\n✅ Priority support\n✅ 73.64% win rate signals\n\nThis offer expires in 3 days. Don't miss out!`,
    3: `<b>See What Others Are Making 💰</b>\n\n"I made $5,000 in the first month using these signals!"\n- John M.\n\n"The accuracy is incredible. 73.64% win rate is no joke!"\n- Sarah T.\n\n"Best investment I've made. ROI is amazing!"\n- Mike D.\n\nJoin hundreds of successful traders. Start today!\n\n<b>Money-back guarantee:</b> If you're not satisfied after 30 days, we'll refund you 100%`,
  };

  return messages[level];
}

export default {
  sendSignalToUser,
  sendFollowupToUser,
};
