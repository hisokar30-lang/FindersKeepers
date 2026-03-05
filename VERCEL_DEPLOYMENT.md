# Vercel Deployment Guide for FindersKeepers

## 🚀 Quick Deploy to Vercel

### Step 1: Push to GitHub
```bash
git push origin master
```

### Step 2: Import to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository: `finders-keepers`
4. Click "Import"

### Step 3: Configure Environment Variables
**CRITICAL:** Before deploying, add these environment variables in Vercel:

1. In your Vercel project settings, go to **Settings** → **Environment Variables**
2. Add the following variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

3. Make sure to select **All Environments** (Production, Preview, Development)

### Step 4: Deploy
1. Click "Deploy"
2. Wait for the build to complete
3. Your app will be live at: `https://your-project.vercel.app`

### Step 5: Test Your Deployment
Visit: `https://your-project.vercel.app/admin/test-connection`

This will verify:
- ✅ Supabase connection works
- ✅ Environment variables are configured correctly
- ✅ Database tables exist

## 🔒 Security Notes

- ✅ `.env.local` is gitignored and will NEVER be committed
- ✅ Vercel environment variables are encrypted and secure
- ✅ Service role key is only accessible server-side
- ✅ Anon key is safe to expose in client-side code

## 📋 Pre-Deployment Checklist

Before deploying, make sure you have:

- [ ] Run `supabase_schema.sql` in your Supabase SQL Editor
- [ ] Created the `item-photos` storage bucket in Supabase
- [ ] Configured environment variables in Vercel
- [ ] Tested locally at `http://localhost:3000/admin/test-connection`

## 🔄 Continuous Deployment

Every time you push to GitHub, Vercel will automatically:
1. Build your app
2. Run tests (if configured)
3. Deploy to production (if on master/main branch)
4. Deploy to preview (if on other branches)

## 🆘 Troubleshooting

### Build Fails
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify TypeScript has no errors

### Database Connection Fails
- Verify environment variables are set in Vercel
- Check Supabase URL is correct
- Ensure database schema has been run

### 404 Errors
- Check your routes are correctly defined
- Ensure dynamic routes use `[id]` syntax
- Verify API routes are in `app/api/` directory

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Visit `/admin/test-connection` to diagnose
3. Review Supabase logs in the dashboard
