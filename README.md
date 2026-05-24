# RPL History Book

Official RPL Season Records, Awards & Hall of Fame site.

## Stack

- Next.js 14 (App Router)
- Pure CSS (no UI library)

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the repo at [vercel.com](https://vercel.com)
3. In **Settings → Environment Variables**, add:
   - **Key:** `RPLHRPASS`
   - **Value:** your chosen admin password (e.g. `hunter2`)
4. Deploy

> ⚠️ The env var must be named exactly `RPLHRPASS`. Do **not** add it to `vercel.json` — set it only in the Vercel dashboard so it stays out of your repo.

## Local Development

```bash
npm install

# Create a local env file with your password
echo "RPLHRPASS=yourpassword" > .env.local

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Admin Panel

Click **Admin** in the nav → enter your password → the **+ Add Season** button unlocks.

> Note: seasons added via the admin panel are in-memory only. To persist them permanently, edit `src/data/seasons.js` directly and push to GitHub.

## Updating Data

Edit `src/data/seasons.js` to update season records, awards, and HOF requirements. Push to GitHub and Vercel will redeploy automatically.
