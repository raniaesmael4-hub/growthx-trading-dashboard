# GrowthX Trading Dashboard - Render Deployment Guide

## Why Render?

✅ **Free Tier**: Start for free with generous limits
✅ **Easy Setup**: Connect GitHub, auto-deploy on push
✅ **Database Included**: PostgreSQL/MySQL built-in
✅ **Environment Variables**: Secure secrets management
✅ **SSL/HTTPS**: Automatic certificates
✅ **Scaling**: Auto-scale as you grow
✅ **No Credit Card**: Free tier doesn't require payment

---

## Step 1: Prepare Your Repository

### 1.1 Push to GitHub
```bash
cd /home/ubuntu/trading_dashboard
git remote add origin https://github.com/YOUR_USERNAME/trading-dashboard.git
git branch -M main
git push -u origin main
```

### 1.2 Create `.env.render` file
```
DATABASE_URL=postgresql://user:password@host/dbname
JWT_SECRET=your-secret-key-here
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
OWNER_OPEN_ID=your-owner-id
OWNER_NAME=Your Name
VITE_APP_TITLE=GrowthX Trading Signals
VITE_APP_LOGO=https://your-logo-url.com/logo.png
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your-website-id
NODE_ENV=production
```

---

## Step 2: Deploy on Render

### 2.1 Create New Web Service
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Select the `trading-dashboard` repository

### 2.2 Configure Build Settings
- **Name**: `growthx-trading-dashboard`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Build Command**: `pnpm install && pnpm build`
- **Start Command**: `pnpm start`
- **Plan**: Free (or Starter for production)

### 2.3 Add Environment Variables
Copy all variables from `.env.render` into Render's environment variables section.

### 2.4 Add Database
1. Click "Create Database"
2. Choose PostgreSQL
3. Copy the `DATABASE_URL` to your environment variables
4. Run migrations: `pnpm db:push`

### 2.5 Deploy
Click "Create Web Service" and wait for deployment (5-10 minutes)

---

## Step 3: Post-Deployment Setup

### 3.1 Run Database Migrations
```bash
# After deployment, run in Render shell:
pnpm db:push
```

### 3.2 Update TradingView Webhook URL
In your OPS Pine Script, update the webhook URL to:
```
https://your-render-app.onrender.com/api/webhook/trade
```

### 3.3 Update Telegram Bot Webhook
Configure your Telegram bot to use:
```
https://your-render-app.onrender.com/api/telegram/webhook
```

### 3.4 Test the Deployment
Visit: `https://your-render-app.onrender.com`

---

## Step 4: Production Optimization

### 4.1 Enable Auto-Scaling
- Go to Render Dashboard
- Settings → Auto-Scaling
- Enable with 2-4 instances

### 4.2 Set Up Monitoring
- Render provides built-in logs
- Monitor database connections
- Set up alerts for errors

### 4.3 Custom Domain
1. Go to Settings → Custom Domain
2. Add your domain (e.g., `trading.growthx.com`)
3. Update DNS records as instructed

---

## Deployment Checklist

- [ ] GitHub repository created and pushed
- [ ] `.env.render` file configured with all secrets
- [ ] Render account created
- [ ] Web Service connected to GitHub
- [ ] Build and start commands configured
- [ ] Environment variables added
- [ ] PostgreSQL database created
- [ ] Database migrations run (`pnpm db:push`)
- [ ] TradingView webhook URL updated
- [ ] Telegram bot webhook URL updated
- [ ] Deployment tested and working
- [ ] Custom domain configured (optional)
- [ ] SSL certificate verified
- [ ] Monitoring and logs checked

---

## Troubleshooting

### Build Fails
- Check Node version (requires 18+)
- Verify all dependencies in `package.json`
- Check build logs in Render dashboard

### Database Connection Error
- Verify `DATABASE_URL` is correct
- Check database is running
- Run migrations: `pnpm db:push`

### Environment Variables Not Loading
- Restart the service after updating env vars
- Check variable names match exactly
- Verify no extra spaces or quotes

### Webhook Not Receiving Signals
- Verify webhook URL is correct
- Check firewall/CORS settings
- Test with curl: `curl -X POST https://your-url/api/webhook/trade`

---

## Estimated Costs

### Free Tier
- Web Service: Free (with limitations)
- Database: Free tier (limited storage)
- **Total**: $0/month

### Starter Tier (Recommended for Production)
- Web Service: $7/month
- PostgreSQL: $15/month
- **Total**: ~$22/month

### Production Tier
- Web Service: $12/month (auto-scaling)
- PostgreSQL: $30/month (high availability)
- **Total**: ~$42+/month

---

## Next Steps

1. Push code to GitHub
2. Deploy on Render
3. Configure environment variables
4. Run database migrations
5. Update webhook URLs
6. Test all features
7. Monitor logs and performance
8. Scale as needed

**Your GrowthX Trading Dashboard is now live! 🚀**

