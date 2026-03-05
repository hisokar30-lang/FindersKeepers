# 🚀 Deployment Guide - FindersKeepers

This guide walks you through deploying FindersKeepers to Vercel with Supabase backend.

## 📋 Prerequisites

- GitHub account
- Vercel account (free tier works)
- Supabase account (free tier works)

## 🔧 Step 1: Setup Supabase

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose organization and set project name
   - Set a strong database password
   - Choose a region close to your users

2. **Initialize Database Schema**
   - Navigate to SQL Editor in your Supabase dashboard
   - Copy the entire contents of `supabase_schema.sql` from this repo
   - Paste and click "Run"
   - This creates:
     - `profiles` table (user data)
     - `items` table (lost/found items)
     - Row Level Security (RLS) policies
     - Automatic profile creation trigger

3. **Get API Credentials**
   - Go to Project Settings → API
   - Copy:
     - `Project URL` (NEXT_PUBLIC_SUPABASE_URL)
     - `anon/public` key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - Keep these safe - you'll need them for Vercel

4. **Configure Storage (Optional)**
   - Go to Storage in Supabase dashboard
   - Create a bucket named `item-images`
   - Set it to public if you want direct image access
   - Configure RLS policies for upload permissions

## 📦 Step 2: Push to GitHub

1. **Initialize Git (if not already done)**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - FindersKeepers app"
   ```

2. **Create GitHub Repository**
   - Go to [github.com](https://github.com)
   - Click "New Repository"
   - Name it `finders-keepers` (or your preferred name)
   - **Do NOT** initialize with README (we already have one)
   - Click "Create repository"

3. **Push Your Code**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/finders-keepers.git
   git branch -M main
   git push -u origin main
   ```

## 🌐 Step 3: Deploy to Vercel

1. **Import Project**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

2. **Configure Environment Variables**
   - Before deploying, click "Environment Variables"
   - Add these variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key-here
     ```
   - Make sure to add them for all environments (Production, Preview, Development)

3. **Deploy**
   - Click "Deploy"
   - Wait 1-2 minutes for build to complete
   - Your app will be live at `https://your-project.vercel.app`

## 🔄 Step 4: Continuous Deployment

Every time you push to GitHub:
- Vercel automatically builds and deploys
- Preview deployments for pull requests
- Production deployment for `main` branch

```bash
# Make changes
git add .
git commit -m "Add new feature"
git push

# Vercel automatically deploys!
```

## 🔐 Security Checklist

- ✅ `.env.local` is in `.gitignore` (never commit secrets)
- ✅ Supabase RLS policies are enabled
- ✅ Vercel security headers configured in `vercel.json`
- ✅ Use environment variables for all sensitive data

## 🐛 Troubleshooting

### Build Fails on Vercel
- Check build logs for specific errors
- Ensure all dependencies are in `package.json`
- Verify environment variables are set correctly

### Database Connection Issues
- Verify Supabase URL and anon key are correct
- Check Supabase project is not paused (free tier auto-pauses after inactivity)
- Ensure RLS policies allow the operations you're attempting

### Images Not Loading
- Check Supabase Storage bucket is public
- Verify CORS settings in Supabase
- Ensure image URLs are correct

## 📊 Monitoring

- **Vercel Analytics**: Built-in performance monitoring
- **Supabase Dashboard**: Database usage, API requests
- **Error Tracking**: Check Vercel deployment logs

## 💰 Costs

- **Vercel Free Tier**: 
  - 100GB bandwidth/month
  - Unlimited deployments
  - Perfect for personal projects

- **Supabase Free Tier**:
  - 500MB database
  - 1GB file storage
  - 50,000 monthly active users
  - Auto-pauses after 1 week inactivity

## 🎉 Success!

Your FindersKeepers app is now live! Share the URL with users and start reuniting people with their lost items.

---

**Need Help?** Check the [main README](./README.md) or open an issue on GitHub.
