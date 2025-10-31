# Quick Deploy to Render - 5 Minutes

## The Easiest Way to Deploy

### Option 1: Deploy with GitHub (Recommended - 5 minutes)

**Step 1: Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/growthx-trading.git
git push -u origin main
```

**Step 2: Go to Render.com**
1. Sign up at https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Render will auto-detect Node.js project

**Step 3: Configure (2 minutes)**
- Build Command: `pnpm install && pnpm build`
- Start Command: `pnpm start`
- Add environment variables (see below)

**Step 4: Deploy**
- Click "Create Web Service"
- Wait 5-10 minutes
- Your app is live! 🚀

---

### Option 2: Deploy with Docker (Alternative)

**Create `Dockerfile`:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install -g pnpm
RUN pnpm install
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

Then deploy on Render as Docker service.

---

## Environment Variables Needed

Copy these into Render dashboard:

```
DATABASE_URL=postgresql://user:password@host/dbname
JWT_SECRET=generate-random-string-here
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
OWNER_OPEN_ID=your-owner-id
OWNER_NAME=Your Name
VITE_APP_TITLE=GrowthX Trading Signals
VITE_APP_LOGO=https://your-logo-url/logo.png
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your-website-id
NODE_ENV=production
```

---

## After Deployment

1. **Update TradingView Webhook URL**
   - In your Pine Script, change webhook to:
   ```
   https://your-app-name.onrender.com/api/webhook/trade
   ```

2. **Update Telegram Bot Webhook**
   - Configure bot to use:
   ```
   https://your-app-name.onrender.com/api/telegram/webhook
   ```

3. **Run Database Migrations**
   - In Render shell:
   ```bash
   pnpm db:push
   ```

4. **Test**
   - Visit: `https://your-app-name.onrender.com`
   - Should see GrowthX Trading Signals home page

---

## Cost Comparison

| Service | Free | Starter | Pro |
|---------|------|---------|-----|
| **Render** | $0 | $7/mo | $12/mo |
| **Database** | Free | $15/mo | $30/mo |
| **Total** | $0 | $22/mo | $42/mo |

---

## Why Render is Best for This Project

✅ **Simple**: Connect GitHub, auto-deploy  
✅ **Free Tier**: No credit card needed  
✅ **Database**: PostgreSQL included  
✅ **Scaling**: Auto-scales with traffic  
✅ **SSL**: HTTPS automatic  
✅ **Monitoring**: Built-in logs and alerts  
✅ **Environment**: Node.js optimized  

---

## Troubleshooting

**Build fails?**
- Check Node version (need 18+)
- Verify `pnpm` is installed
- Check all dependencies in `package.json`

**Database error?**
- Verify `DATABASE_URL` is correct
- Run `pnpm db:push` in Render shell
- Check database is running

**Webhook not working?**
- Verify URL is correct
- Check firewall isn't blocking
- Test with: `curl -X POST https://your-url/api/webhook/trade`

---

## That's It! 🎉

Your GrowthX Trading Dashboard is now live and ready to receive real-time trading signals from TradingView!

**Next**: Configure your Telegram bot and start accepting subscribers.

