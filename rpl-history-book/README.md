# RPL History Book

Official RPL Season Records, Awards & Hall of Fame site.

## Stack
- Next.js 14 (App Router)
- Pure CSS (no UI library)

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. In **Settings → Environment Variables**, add:
   - **Key:** `RPLHRPASS`
   - **Value:** `$&` *(your actual password — the env var name on Vercel is `RPLHRPASS`, the `$&` suffix is only in the reference above)*
4. Deploy

> ⚠️ The admin password env var must be named exactly `RPLHRPASS` in Vercel's dashboard.

## Local Dev

```bash
npm install
# create .env.local
echo "RPLHRPASS=yourpassword" > .env.local
npm run dev
```

## Admin Panel

Click **Admin** in the nav → enter password → unlock the **+ Add Season** button to add new seasons to the page.

## Updating Data

Edit `src/data/seasons.js` to update season data, records, and HOF requirements permanently.
