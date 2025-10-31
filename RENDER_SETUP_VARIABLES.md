# Render Deployment - Complete Setup Guide

## Step 1: Create Web Service on Render

### 1.1 Basic Configuration
When creating a new Web Service on Render:

**Name:** `growthx-trading-dashboard`
**Environment:** `Node`
**Region:** Choose closest to your users (e.g., `Oregon` for US, `Frankfurt` for EU)
**Plan:** `Free` (or `Starter $7/mo` for production)

### 1.2 Build & Start Commands

**Build Command:**
```
pnpm install && pnpm build
```

**Start Command:**
```
pnpm start
```

---

## Step 2: Add Environment Variables

Copy and paste ALL these variables into Render's Environment section:

### Core Application Variables
```
NODE_ENV=production
PORT=3000
```

### OAuth & Authentication
```
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
JWT_SECRET=your-super-secret-jwt-key-here-min-32-chars
```

### Owner Information
```
OWNER_OPEN_ID=your-owner-id-from-manus
OWNER_NAME=Your Name
```

### Branding
```
VITE_APP_TITLE=GrowthX Trading Signals
VITE_APP_LOGO=https://your-domain.com/logo.png
```

### Manus Built-in APIs
```
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-forge-api-key
```

### Analytics
```
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your-analytics-website-id
```

### Database
```
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

---

## Step 3: Create PostgreSQL Database

### 3.1 In Render Dashboard
1. Click "New +" → "PostgreSQL"
2. **Name:** `growthx-db`
3. **Region:** Same as your web service
4. **PostgreSQL Version:** 14 or higher
5. Click "Create Database"

### 3.2 Copy Database URL
After database is created:
1. Go to database details
2. Copy the "External Database URL"
3. Paste it as `DATABASE_URL` in your web service environment variables

**Format:** `postgresql://user:password@host:port/dbname`

---

## Step 4: Environment Variables - Complete List

Here's the COMPLETE list to copy-paste:

```
NODE_ENV=production
PORT=3000
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
JWT_SECRET=generate-random-string-here-at-least-32-chars
OWNER_OPEN_ID=your-owner-id
OWNER_NAME=Your Name
VITE_APP_TITLE=GrowthX Trading Signals
VITE_APP_LOGO=https://your-domain.com/logo.png
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-forge-api-key
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your-analytics-website-id
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

---

## Step 5: How to Add Variables in Render

### Method 1: Manual Entry (Recommended for First Time)
1. In Render dashboard, go to your Web Service
2. Click "Environment" tab
3. Click "Add Environment Variable"
4. Enter each variable one by one:
   - **Key:** (variable name)
   - **Value:** (variable value)
5. Click "Save"

### Method 2: Bulk Import
1. Create a `.env.render` file with all variables
2. In Render, go to "Environment"
3. Click "Import" and paste all variables at once

---

## Step 6: Build Settings

### Build Configuration
- **Build Command:** `pnpm install && pnpm build`
- **Start Command:** `pnpm start`
- **Node Version:** 18.x or higher (auto-detected)

### Deploy Hook (Optional)
Leave blank unless you need custom deployment logic.

---

## Step 7: Post-Deployment Setup

### 7.1 Run Database Migrations
After deployment completes:
1. Go to your Web Service → "Shell"
2. Run: `pnpm db:push`
3. Wait for migrations to complete

### 7.2 Update TradingView Webhook URL
In your OPS Pine Script, update line 37:
```
webhook_url = "https://your-render-app.onrender.com/api/webhook/trade"
```

Replace `your-render-app` with your actual Render app name.

### 7.3 Update Telegram Bot Webhook
Configure your Telegram bot to use:
```
https://your-render-app.onrender.com/api/telegram/webhook
```

### 7.4 Test the Deployment
1. Visit: `https://your-render-app.onrender.com`
2. You should see the GrowthX Trading Signals home page
3. Click "Open Dashboard" to verify it works

---

## Step 8: Getting Your Values

### Where to Get Each Variable

| Variable | Where to Get | Example |
|----------|-------------|---------|
| `VITE_APP_ID` | Manus Dashboard | `app_123456` |
| `OWNER_OPEN_ID` | Manus Account Settings | `user_789` |
| `OWNER_NAME` | Your Name | `Rania Esmael` |
| `VITE_APP_LOGO` | Your Logo URL | `https://example.com/logo.png` |
| `BUILT_IN_FORGE_API_KEY` | Manus API Keys | `sk_live_xxxxx` |
| `JWT_SECRET` | Generate Random | Use: `openssl rand -base64 32` |
| `DATABASE_URL` | Render PostgreSQL | Provided by Render |
| `VITE_ANALYTICS_WEBSITE_ID` | Analytics Dashboard | `site_123` |

---

## Step 9: Deployment Checklist

Before clicking "Create Web Service":

- [ ] Repository connected: `raniaesmael4-hub/growthx-trading-dashboard`
- [ ] Build Command: `pnpm install && pnpm build`
- [ ] Start Command: `pnpm start`
- [ ] All environment variables added (see Step 2)
- [ ] PostgreSQL database created
- [ ] DATABASE_URL added to environment
- [ ] Region selected (same for web service and database)
- [ ] Plan selected (Free or Starter)

---

## Step 10: Troubleshooting

### Build Fails
**Error:** `pnpm: command not found`
- **Solution:** Node version too old. Render will auto-detect, but ensure `package.json` has `pnpm` in `engines`

**Error:** `Cannot find module`
- **Solution:** Run `pnpm install` locally first to ensure `pnpm-lock.yaml` is committed

### Database Connection Error
**Error:** `ECONNREFUSED` or `Connection refused`
- **Solution:** 
  1. Verify `DATABASE_URL` is correct
  2. Check database is running in Render
  3. Run `pnpm db:push` in shell

### Webhook Not Working
**Error:** `404 Not Found` on webhook calls
- **Solution:**
  1. Verify webhook URL is correct
  2. Check TradingView has correct URL
  3. Test with: `curl -X POST https://your-app.onrender.com/api/webhook/trade`

### App Crashes After Deploy
**Error:** App keeps restarting
- **Solution:**
  1. Check logs: Render Dashboard → Logs
  2. Verify all required environment variables are set
  3. Check database migrations ran: `pnpm db:push`

---

## Step 11: After Successful Deployment

1. ✅ Note your app URL: `https://your-app-name.onrender.com`
2. ✅ Update TradingView webhook URL
3. ✅ Configure Telegram bot webhook
4. ✅ Test all features
5. ✅ Monitor logs for errors
6. ✅ Set up custom domain (optional)

---

## Quick Reference - Copy This!

```
Build Command:
pnpm install && pnpm build

Start Command:
pnpm start

Environment Variables:
NODE_ENV=production
PORT=3000
VITE_APP_ID=your-value
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
JWT_SECRET=your-secret
OWNER_OPEN_ID=your-value
OWNER_NAME=Your Name
VITE_APP_TITLE=GrowthX Trading Signals
VITE_APP_LOGO=your-logo-url
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-key
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your-id
DATABASE_URL=postgresql://...
```

---

## Support

If you encounter issues:
1. Check Render logs: Dashboard → Logs
2. Verify all environment variables are set
3. Test locally: `pnpm dev`
4. Check GitHub repository is up to date

**Your GrowthX Trading Dashboard is ready to deploy! 🚀**

