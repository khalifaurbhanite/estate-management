# Deploy Directly to Cloudflare Pages (No GitHub)

## STEP 1: Install Wrangler CLI

Open PowerShell and run:
```powershell
npm install -g wrangler
```

Verify it installed:
```powershell
wrangler --version
```

## STEP 2: Authenticate with Cloudflare

```powershell
cd c:\Users\fidoh_ba\estate-management-system
wrangler login
```

This opens your browser to authenticate. Click "Allow" and return to terminal.

## STEP 3: Deploy Frontend to Cloudflare Pages

```powershell
wrangler pages deploy frontend/
```

This uploads your entire `frontend/` folder to Cloudflare Pages.

**Output will show:**
```
✨ Deployment complete!
🌍 https://estate-management.YOUR_ACCOUNT.pages.dev
```

**COPY THIS URL - That's your live website!**

## STEP 4: Setup Backend (Supabase)

Since Cloudflare Pages is frontend-only, you need a backend:

### A) Create Supabase Account
1. Go to: https://supabase.com
2. Sign up with GitHub
3. Create new project
4. Copy your **Project URL** and **Anon Key**

### B) Load Database Schema
1. In Supabase dashboard → **SQL Editor**
2. Open file: `c:\Users\fidoh_ba\estate-management-system\database\schema.sql`
3. Copy ALL the SQL and paste into Supabase SQL Editor
4. Click **Run**

### C) Update Your Frontend

Edit `frontend/js/api.js` and change:

```javascript
const APP_CONFIG = {
  apiBase: 'https://YOUR_SUPABASE_URL.supabase.co/rest/v1'
};
```

Replace `YOUR_SUPABASE_URL` with your actual Supabase project URL.

### D) Redeploy with Updated Config

```powershell
wrangler pages deploy frontend/
```

## STEP 5: Get Your Live Credentials

After redeployment, you now have:

✅ **Frontend (Live on Cloudflare):**
```
https://estate-management.YOUR_ACCOUNT.pages.dev
```

✅ **Backend Database (Supabase):**
```
https://YOUR_SUPABASE_URL.supabase.co
```

## Test Your Live Site

1. Open: https://estate-management.YOUR_ACCOUNT.pages.dev/login.html
2. You should see the login page
3. Once you create users in Supabase, they can login

## Future Updates

Every time you update code:

```powershell
wrangler pages deploy frontend/
```

That's it! One command deploys everything.

## Troubleshooting

**"wrangler: command not found"?**
- Restart PowerShell after npm install -g wrangler
- Or use full path: `npm wrangler pages deploy frontend/`

**Cloudflare dashboard shows error?**
- Login to https://dash.cloudflare.com/
- Check **Pages** section
- View deployment logs

**Frontend loads but API fails?**
- Check Supabase URL in api.js is correct
- Verify Supabase project is active
- Check CORS in Supabase settings

---

**You're live!** 🚀

Your site is now running on Cloudflare Pages and connected to Supabase database!
