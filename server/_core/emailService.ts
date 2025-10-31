import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'raniaesmael4@gmail.com',
    pass: process.env.EMAIL_PASSWORD || '', // Use app password for Gmail
  },
});

// Email templates
export const emailTemplates = {
  followup1: {
    subject: 'Don\'t Miss Out on 73.64% Win Rate Trading Signals 🚀',
    html: (userName: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
        <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #1a1a1a; margin-top: 0;">Hi ${userName},</h2>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            We noticed you were interested in our trading signals but didn't complete your purchase. We'd love to have you on board!
          </p>
          
          <div style="background: #f0f7ff; padding: 20px; border-left: 4px solid #0066cc; margin: 20px 0;">
            <h3 style="color: #0066cc; margin-top: 0;">Why Join Growthx Trading Signals?</h3>
            <ul style="color: #333; line-height: 1.8;">
              <li><strong>73.64% Win Rate</strong> - Proven backtesting results</li>
              <li><strong>+779.54% Total Return</strong> - Consistent profitability</li>
              <li><strong>Real-time Signals</strong> - Delivered via Telegram instantly</li>
              <li><strong>Expert Analysis</strong> - Professional trading strategies</li>
            </ul>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Our trading signals have helped hundreds of traders achieve consistent profits. Don't miss this opportunity to join a community of successful traders.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://t.me/Growthx_Signals_Bot" style="background: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Join Now on Telegram
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            Questions? Reply to this email or contact us at <strong>raniaesmael4@gmail.com</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            © 2025 Growthx Trading Signals. All rights reserved.
          </p>
        </div>
      </div>
    `,
  },
  
  followup2: {
    subject: 'Last Chance: 50% Discount on Annual Plan ⏰',
    html: (userName: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
        <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #1a1a1a; margin-top: 0;">Special Offer for ${userName}!</h2>
          
          <div style="background: #fff3cd; padding: 20px; border-left: 4px solid #ff9800; margin: 20px 0; border-radius: 4px;">
            <h3 style="color: #ff9800; margin-top: 0;">🎁 Limited Time: 50% OFF Annual Plan</h3>
            <p style="color: #333; font-size: 18px; font-weight: bold; margin: 10px 0;">
              Only $250 instead of $500 - Unlimited signals for a full year!
            </p>
            <p style="color: #666; margin: 10px 0;">
              This exclusive offer expires in 48 hours. Secure your spot now!
            </p>
          </div>
          
          <h3 style="color: #1a1a1a;">What You'll Get:</h3>
          <ul style="color: #333; line-height: 1.8;">
            <li>✅ Unlimited trading signals for 12 months</li>
            <li>✅ Real-time Telegram notifications</li>
            <li>✅ 73.64% win rate signals</li>
            <li>✅ Priority support</li>
            <li>✅ Access to signal history & analytics</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://t.me/Growthx_Signals_Bot" style="background: #ff9800; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Claim 50% Discount Now
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            This is a limited-time offer exclusively for our interested traders. Don't let this opportunity pass!
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            © 2025 Growthx Trading Signals. All rights reserved.
          </p>
        </div>
      </div>
    `,
  },
  
  followup3: {
    subject: 'Join 500+ Successful Traders Using Growthx Signals 📈',
    html: (userName: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
        <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #1a1a1a; margin-top: 0;">Success Stories from Our Community 🌟</h2>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Hi ${userName},
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Over 500 traders are already profiting from our signals. Here's what they're saying:
          </p>
          
          <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #4caf50; margin: 15px 0; border-radius: 4px;">
            <p style="color: #333; margin: 0; font-style: italic;">
              "I've been using Growthx signals for 3 months and made +$15,000. Best investment I ever made!" - Ahmed M.
            </p>
          </div>
          
          <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #4caf50; margin: 15px 0; border-radius: 4px;">
            <p style="color: #333; margin: 0; font-style: italic;">
              "The win rate is consistent. I trust these signals completely." - Sarah K.
            </p>
          </div>
          
          <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #4caf50; margin: 15px 0; border-radius: 4px;">
            <p style="color: #333; margin: 0; font-style: italic;">
              "Finally found a signal service that actually works. Highly recommended!" - Mike T.
            </p>
          </div>
          
          <h3 style="color: #1a1a1a;">Our Guarantee:</h3>
          <p style="color: #333; line-height: 1.8;">
            We're so confident in our signals that we offer a <strong>7-day money-back guarantee</strong>. If you're not satisfied, we'll refund 100% of your payment. No questions asked.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://t.me/Growthx_Signals_Bot" style="background: #4caf50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Start Trading Today
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Questions? Contact us at <strong>raniaesmael4@gmail.com</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            © 2025 Growthx Trading Signals. All rights reserved.
          </p>
        </div>
      </div>
    `,
  },
};

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  userName?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    if (!process.env.EMAIL_PASSWORD) {
      console.warn('[Email] EMAIL_PASSWORD not set. Skipping email send.');
      return false;
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'raniaesmael4@gmail.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log(`[Email] Successfully sent email to ${options.to}`);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send email:', error);
    return false;
  }
}

export async function sendFollowupEmail(
  email: string,
  userName: string,
  followupLevel: 1 | 2 | 3
): Promise<boolean> {
  const template = emailTemplates[`followup${followupLevel}` as keyof typeof emailTemplates];
  
  if (!template) {
    console.error(`[Email] Template followup${followupLevel} not found`);
    return false;
  }

  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html(userName),
    userName,
  });
}
