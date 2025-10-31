#!/usr/bin/env python3
"""
GrowthX Trading Signals Telegram Bot
Handles user registration, subscription management, and signal distribution
"""

import os
import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, MessageHandler, CallbackQueryHandler, filters, ContextTypes
import httpx
import json
from datetime import datetime

# Configure logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Configuration
TELEGRAM_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', '8039162031:AAHBd8GwE4bXX8w5uoyHwBakIH6WxT5_fHY')
DASHBOARD_URL = os.getenv('DASHBOARD_URL', 'https://growthx-trading-dashboard.onrender.com')
API_URL = f'{DASHBOARD_URL}/api/trpc'

# Subscription plans
PLANS = {
    'basic': {'price': 29, 'name': 'Basic', 'signals': 'Limited'},
    'pro': {'price': 99, 'name': 'Pro', 'signals': 'Unlimited'},
    'vip': {'price': 299, 'name': 'VIP', 'signals': 'Unlimited + Priority'}
}

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /start command"""
    user = update.effective_user
    chat_id = update.effective_chat.id
    
    keyboard = [
        [InlineKeyboardButton("📊 View Plans", callback_data='view_plans')],
        [InlineKeyboardButton("💳 Subscribe", callback_data='subscribe')],
        [InlineKeyboardButton("📈 My Account", callback_data='my_account')],
        [InlineKeyboardButton("❓ Help", callback_data='help')]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    welcome_text = f"""
👋 Welcome to GrowthX Trading Signals, {user.first_name}!

I'm your AI-powered trading bot that sends real-time signals from professional traders.

🎯 What I do:
• Send live trading signals from verified strategies
• Manage your subscription
• Track your trading performance
• Provide 24/7 support

Choose an option below to get started:
"""
    
    await update.message.reply_text(welcome_text, reply_markup=reply_markup)
    
    # Register user in database
    try:
        async with httpx.AsyncClient() as client:
            await client.post(
                f'{API_URL}/bot.registerUser',
                json={
                    'telegramId': str(user.id),
                    'username': user.username or '',
                    'firstName': user.first_name or '',
                    'lastName': user.last_name or '',
                    'chatId': str(chat_id)
                }
            )
    except Exception as e:
        logger.error(f'Error registering user: {e}')

async def view_plans(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Show subscription plans"""
    query = update.callback_query
    await query.answer()
    
    plans_text = "💎 **Available Plans**\n\n"
    keyboard = []
    
    for plan_id, plan in PLANS.items():
        plans_text += f"**{plan['name']}** - ${plan['price']}/month\n"
        plans_text += f"Signals: {plan['signals']}\n\n"
        keyboard.append([InlineKeyboardButton(f"Choose {plan['name']}", callback_data=f'choose_plan_{plan_id}')])
    
    keyboard.append([InlineKeyboardButton("← Back", callback_data='back_to_menu')])
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await query.edit_message_text(text=plans_text, reply_markup=reply_markup, parse_mode='Markdown')

async def choose_plan(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle plan selection"""
    query = update.callback_query
    await query.answer()
    
    plan_id = query.data.replace('choose_plan_', '')
    plan = PLANS.get(plan_id)
    
    if not plan:
        await query.answer("Invalid plan", show_alert=True)
        return
    
    confirmation_text = f"""
✅ **You selected: {plan['name']}**

Price: ${plan['price']}/month
Signals: {plan['signals']}

To complete your payment:
1. Click the payment button below
2. Complete payment
3. You'll get instant access to signals

Ready to proceed?
"""
    
    keyboard = [
        [InlineKeyboardButton("💳 Pay Now", callback_data=f'pay_{plan_id}')],
        [InlineKeyboardButton("← Back", callback_data='view_plans')]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await query.edit_message_text(text=confirmation_text, reply_markup=reply_markup, parse_mode='Markdown')

async def process_payment(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Process payment"""
    query = update.callback_query
    await query.answer()
    
    plan_id = query.data.replace('pay_', '')
    user_id = query.from_user.id
    
    payment_text = f"""
💳 **Payment Instructions**

Plan: {PLANS[plan_id]['name']}
Price: ${PLANS[plan_id]['price']}

**Payment Methods:**
1. **Crypto** (Recommended)
   - Bitcoin: 1A1z7agoat...
   - USDT: 0x742d...
   
2. **Credit Card**
   - Coming soon

3. **Bank Transfer**
   - Contact support

**After Payment:**
Send proof of payment and I'll activate your account immediately!

Your User ID: `{user_id}`
"""
    
    keyboard = [
        [InlineKeyboardButton("✅ I Have Paid", callback_data=f'confirm_payment_{plan_id}')],
        [InlineKeyboardButton("❌ Cancel", callback_data='view_plans')]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await query.edit_message_text(text=payment_text, reply_markup=reply_markup, parse_mode='Markdown')

async def confirm_payment(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Confirm payment and register subscription"""
    query = update.callback_query
    await query.answer()
    
    plan_id = query.data.replace('confirm_payment_', '')
    user = query.from_user
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f'{API_URL}/bot.recordPayment',
                json={
                    'telegramId': str(user.id),
                    'plan': plan_id,
                    'amount': PLANS[plan_id]['price'],
                    'status': 'pending',
                    'timestamp': datetime.now().isoformat()
                }
            )
            
            if response.status_code == 200:
                confirmation_text = f"""
✅ **Payment Recorded!**

Your payment has been submitted for verification.
An admin will review and activate your account within 24 hours.

In the meantime, you can:
• View trading signals (read-only)
• Check your account status
• Contact support

Thank you for joining GrowthX! 🚀
"""
                
                keyboard = [
                    [InlineKeyboardButton("📊 View Signals", callback_data='view_signals')],
                    [InlineKeyboardButton("📈 My Account", callback_data='my_account')]
                ]
                reply_markup = InlineKeyboardMarkup(keyboard)
                
                await query.edit_message_text(text=confirmation_text, reply_markup=reply_markup, parse_mode='Markdown')
    except Exception as e:
        logger.error(f'Error recording payment: {e}')
        await query.answer(f"Error: {str(e)}", show_alert=True)

async def my_account(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Show user account information"""
    query = update.callback_query
    await query.answer()
    
    user = query.from_user
    
    account_text = f"""
👤 **Your Account**

Name: {user.first_name} {user.last_name or ''}
Username: @{user.username or 'Not set'}
User ID: `{user.id}`

Status: Checking...
Plan: Free
Signals Received: 0

To upgrade, click below:
"""
    
    keyboard = [
        [InlineKeyboardButton("💎 Upgrade Plan", callback_data='view_plans')],
        [InlineKeyboardButton("← Back", callback_data='back_to_menu')]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await query.edit_message_text(text=account_text, reply_markup=reply_markup, parse_mode='Markdown')

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Show help information"""
    query = update.callback_query
    await query.answer()
    
    help_text = """
❓ **Help & Support**

**FAQ:**

Q: How often do you send signals?
A: Multiple times per day when market conditions are favorable.

Q: What's the win rate?
A: Our strategies average 73%+ win rate based on backtesting.

Q: Can I cancel anytime?
A: Yes, no lock-in period. Cancel anytime.

Q: How do I get paid?
A: We provide detailed trade reports. You execute trades on your own.

**Contact Support:**
Email: support@growthx.io
Telegram: @GrowthXSupport

**Terms:**
By using this bot, you agree to our Terms of Service.
"""
    
    keyboard = [[InlineKeyboardButton("← Back", callback_data='back_to_menu')]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await query.edit_message_text(text=help_text, reply_markup=reply_markup, parse_mode='Markdown')

async def back_to_menu(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Return to main menu"""
    query = update.callback_query
    await query.answer()
    
    keyboard = [
        [InlineKeyboardButton("📊 View Plans", callback_data='view_plans')],
        [InlineKeyboardButton("💳 Subscribe", callback_data='subscribe')],
        [InlineKeyboardButton("📈 My Account", callback_data='my_account')],
        [InlineKeyboardButton("❓ Help", callback_data='help')]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    menu_text = "🏠 **Main Menu**\n\nChoose an option:"
    
    await query.edit_message_text(text=menu_text, reply_markup=reply_markup, parse_mode='Markdown')

async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle button callbacks"""
    query = update.callback_query
    
    if query.data == 'view_plans':
        await view_plans(update, context)
    elif query.data == 'subscribe':
        await view_plans(update, context)
    elif query.data == 'my_account':
        await my_account(update, context)
    elif query.data == 'help':
        await help_command(update, context)
    elif query.data == 'back_to_menu':
        await back_to_menu(update, context)
    elif query.data == 'view_signals':
        await query.answer("Signals feature coming soon!", show_alert=True)
    elif query.data.startswith('choose_plan_'):
        await choose_plan(update, context)
    elif query.data.startswith('pay_'):
        await process_payment(update, context)
    elif query.data.startswith('confirm_payment_'):
        await confirm_payment(update, context)

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle regular messages"""
    await update.message.reply_text(
        "I didn't understand that. Use /start to see available commands.",
        reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🏠 Main Menu", callback_data='back_to_menu')]])
    )

def main() -> None:
    """Start the bot"""
    application = Application.builder().token(TELEGRAM_TOKEN).build()
    
    # Command handlers
    application.add_handler(CommandHandler("start", start))
    
    # Callback query handler
    application.add_handler(CallbackQueryHandler(button_callback))
    
    # Message handler
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    
    # Start the bot
    logger.info("Starting bot...")
    application.run_polling()

if __name__ == '__main__':
    main()
