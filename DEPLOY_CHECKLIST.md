# 🚀 Quick Deploy Checklist

Use this checklist to deploy FindersKeepers to production in under 10 minutes.

## ☑️ Pre-Deployment Checklist

### 1. Supabase Setup
- [ ] Create Supabase project
- [ ] Run `supabase_schema.sql` in SQL Editor
- [ ] Copy Project URL and anon key
- [ ] (Optional) Create `item-images` storage bucket

### 2. GitHub Repository
- [ ] Create new GitHub repository
- [ ] Push code to GitHub:
  ```bash
  git remote add origin https://github.com/YOUR_USERNAME/finders-keepers.git
  git branch -M main
  git push -u origin main
  ```

### 3. Vercel Deployment
- [ ] Import GitHub repo to Vercel
- [ ] Add environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Click Deploy
- [ ] Wait for build to complete

### 4. Verification
- [ ] Visit deployed URL
- [ ] Test login/signup
- [ ] Create a test item
- [ ] Verify database updates in Supabase

## 🔑 Environment Variables

Copy these to Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📝 Git Commands

```bash
# Initial setup (if not done)
git init
git add .
git commit -m "Initial commit"

# Connect to GitHub
git remote add origin https://github.com/YOUR_USERNAME/finders-keepers.git
git branch -M main
git push -u origin main

# Future updates
git add .
git commit -m "Your commit message"
git push
```

## 🎯 Common Issues

| Issue | Solution |
|-------|----------|
| Build fails | Check environment variables are set |
| Database errors | Verify Supabase project is active (not paused) |
| Images not loading | Check storage bucket permissions |
| 404 errors | Clear Vercel cache and redeploy |

## ✅ Post-Deployment

- [ ] Test all features on production URL
- [ ] Set up custom domain (optional)
- [ ] Enable Vercel Analytics
- [ ] Monitor Supabase usage

---

**Estimated Time**: 5-10 minutes  
**Cost**: $0 (using free tiers)
