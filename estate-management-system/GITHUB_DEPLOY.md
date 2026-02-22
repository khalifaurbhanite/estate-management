# Deploy Estate Management System via GitHub to Cloudflare Pages

## STEP 1: Push Code to GitHub

```bash
# Navigate to your project folder
cd c:\Users\fidoh_ba\estate-management-system

# Initialize git (if not already done)
git init
git add .
git commit -m "Initial estate management system"

# Add remote (replace YOUR_GITHUB_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## STEP 2: Get Cloudflare Credentials

1. Go to: https://dash.cloudflare.com/
2. Navigate to **Accounts** → **API Tokens**
3. Click **Create Token**
4. Use template: **Edit Cloudflare Pages**
5. Copy the token (you'll need it)
6. Also get your **Account ID**:
   - Go back to dashboard
   - Bottom left shows: `Account ID: xxxxxxxxxxxxxxx`

## STEP 3: Add GitHub Secrets

1. Go to your GitHub repo: https://github.com/YOUR_GITHUB_USERNAME/REPO_NAME
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:

| Name | Value |
|------|-------|
| `CLOUDFLARE_API_TOKEN` | Your Cloudflare API token from Step 2 |
| `CLOUDFLARE_ACCOUNT_ID` | Your Account ID from Step 2 |

## STEP 4: Verify Deployment

1. Commit any change to trigger workflow:
```bash
echo "# Deployed" >> README.md
git add .
git commit -m "Trigger deployment"
git push
```

2. Go to your repo → **Actions** tab
3. Watch the deployment workflow run
4. Once complete, your site will be live at:

```
https://estate-management.YOUR_ACCOUNT.pages.dev
```

## STEP 5: Setup Backend (Supabase)

Since Cloudflare Pages is frontend-only, deploy your Node.js backend to **Supabase**:

1. Go to: https://supabase.com
2. Sign up / Login
3. Create new project
4. Get your:
   - **Project URL**
   - **API Key (anon)**
5. Update `.env`:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
```

6. Update `frontend/js/api.js`:
```javascript
const APP_CONFIG = {
  apiBase: 'https://your-supabase-url/rest/v1'  // Replace with your Supabase URL
};
```

## STEP 6: Connect Database

Login to Supabase → SQL Editor → Run:

```sql
-- Copy entire contents of database/schema.sql here
-- Paste and run all the SQL from: c:\Users\fidoh_ba\estate-management-system\database\schema.sql
```

## STEP 7: Your Live Website

Once deployed:

- **Frontend**: https://estate-management.YOUR_ACCOUNT.pages.dev
- **Backend API**: Your Supabase project URL
- **Database**: Supabase PostgreSQL

## WHAT HAPPENS AUTOMATICALLY

Every time you push to GitHub:
1. GitHub Actions automatically builds your code
2. Deploys frontend to **Cloudflare Pages**
3. Your site goes live in ~2 minutes
4. No manual deployment needed!

## CUSTOM DOMAIN (Optional)

1. Go to Cloudflare Pages project settings
2. Add your domain (example: yourestate.com)
3. Update DNS records as instructed

## TROUBLESHOOTING

**Deployment fails?**
- Check GitHub Actions → View logs
- Verify API token has correct permissions
- Check Account ID is correct

**Backend not connecting?**
- Verify Supabase URL in api.js
- Check API key is valid
- Check CORS settings in Supabase

**Frontend shows "Coming Soon"?**
- Run `npm run build` locally first
- Check dist/ folder has all HTML files

---

**That's it! You're live!** 🎉

For updates: Just push to GitHub and Cloudflare deploys automatically!
