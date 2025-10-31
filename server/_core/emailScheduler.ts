import cron from 'node-cron';
import * as db from '../db';
import { sendFollowupEmail } from './emailService';

let schedulerRunning = false;

export function startEmailScheduler() {
  if (schedulerRunning) {
    console.log('[Email Scheduler] Already running');
    return;
  }

  schedulerRunning = true;
  console.log('[Email Scheduler] Started');

  // Run every 6 hours to check for pending follow-ups
  cron.schedule('0 */6 * * *', async () => {
    console.log('[Email Scheduler] Running scheduled check...');
    await sendScheduledFollowups();
  });

  // Also run immediately on startup (after a small delay)
  setTimeout(() => {
    console.log('[Email Scheduler] Running initial check...');
    sendScheduledFollowups().catch(err => console.error('[Email Scheduler] Error:', err));
  }, 5000);
}

async function sendScheduledFollowups() {
  try {
    const followups = await db.getFollowupsNeedingEmail();
    console.log(`[Email Scheduler] Found ${followups.length} users needing follow-up emails`);

    for (const followup of followups) {
      try {
        const email = await db.getLeadEmailByTelegramId(followup.telegramId);
        const lead = await db.getTelegramLead(followup.telegramId);

        if (!email || !lead) {
          console.log(`[Email Scheduler] Skipping ${followup.telegramId} - no email or lead found`);
          continue;
        }

        // Determine which follow-up level to send
        let followupLevel: 1 | 2 | 3 = 1;
        if (followup.followupCount >= 2) {
          followupLevel = 3;
        } else if (followup.followupCount >= 1) {
          followupLevel = 2;
        }

        console.log(`[Email Scheduler] Sending follow-up ${followupLevel} to ${email}`);
        const sent = await sendFollowupEmail(email, lead.firstName || 'User', followupLevel);

        if (sent) {
          await db.recordEmailSent(followup.telegramId, email, followupLevel);
          console.log(`[Email Scheduler] Successfully sent follow-up ${followupLevel} to ${email}`);
        } else {
          console.log(`[Email Scheduler] Failed to send follow-up ${followupLevel} to ${email}`);
        }
      } catch (error) {
        console.error(`[Email Scheduler] Error processing followup:`, error);
      }
    }

    console.log('[Email Scheduler] Check completed');
  } catch (error) {
    console.error('[Email Scheduler] Error in sendScheduledFollowups:', error);
  }
}

export function stopEmailScheduler() {
  schedulerRunning = false;
  console.log('[Email Scheduler] Stopped');
}
