# 🚀 Deployment Guide - Wonderland E-Commerce Platform

## Prerequisites

- GitHub account (free)
- Render.com account (free)
- Git installed on your machine

## Step 1: Push to GitHub

### 1.1 Create a new repository on GitHub
1. Go to [github.com/new](https://github.com/new)
2. Create a repository named `wonderland` (or your preferred name)
3. **Do NOT initialize with README** (you already have one)
4. Click "Create repository"

### 1.2 Add GitHub remote and push code
```bash
# In your project directory:
git remote add origin https://github.com/YOUR_USERNAME/wonderland.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## Step 2: Deploy to Render

### 2.1 Connect GitHub to Render
1. Go to [render.com](https://render.com)
2. Sign up / Log in with GitHub
3. Click "New +" → "Web Service"
4. Select "Connect a repository" → choose your `wonderland` repo
5. Fill in the deployment settings:
   - **Name**: `wonderland` (or your preferred name)
   - **Environment**: Node
   - **Region**: Oregon (or closest to you)
   - **Branch**: main
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Instance Type**: Free

### 2.2 Environment Variables (if needed)
1. In Render dashboard, go to your service's "Environment"
2. Add any required environment variables
3. For this project, you typically don't need any initially

### 2.3 Deploy
1. Click "Create Web Service"
2. Render will automatically start building your app
3. Wait for deployment to complete (~5-10 minutes)
4. Your app will be live at: `https://wonderland.onrender.com` (or your custom URL)

## Step 3: Custom Domain (Optional)

To use your own domain:
1. In Render dashboard, go to "Custom Domains"
2. Add your domain
3. Follow DNS configuration instructions
4. Update domain nameservers (usually takes 24-48 hours to propagate)

## Step 4: Continuous Deployment

Once connected to GitHub:
- Every push to `main` branch triggers automatic deployment
- Check deployment status in Render dashboard
- Previous deployments are preserved (can rollback if needed)

## 🔒 Security Notes

### Protected Information
- **Sensitive data** (API keys, database URLs, secrets) should NEVER be committed to git
- Use `.env.local` for local development (not in git)
- Use Render's "Environment" dashboard for production secrets
- Never commit `.env` or `.env.local` files

### What's Safe to Commit
- Code files
- Configuration files (without secrets)
- `.env.example` (as template only)
- Public assets
- Dependencies (package.json)

## 📊 Monitoring & Logs

### View Logs in Render
1. Go to your service dashboard
2. Click "Logs" tab
3. See real-time application output
4. Helpful for debugging deployment issues

## 🆘 Troubleshooting

### Build fails
- Check Render logs for error messages
- Ensure `npm run build` works locally
- Verify all dependencies in `package.json`

### App crashes after deployment
- Check Render logs for runtime errors
- Verify `npm run start` works locally
- Ensure Node.js version is compatible (14+ required, 20 recommended)

### Slow performance
- Upgrade from Free plan to Paid plan
- Enable caching headers
- Optimize images
- Use CDN for static assets

## 📝 Next Steps

After deployment:
1. Test all features on production URL
2. Monitor logs for errors
3. Set up error tracking (Sentry, etc.)
4. Configure analytics (Google Analytics, etc.)
5. Set up email notifications in Render (optional)

## 🔄 Updating Your App

To update your deployed app:
1. Make changes locally
2. Commit: `git commit -m "Your message"`
3. Push: `git push origin main`
4. Render automatically redeploys
5. Watch progress in Render dashboard

---

**Happy Deploying!** 🎉
