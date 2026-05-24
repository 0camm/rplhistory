# RPL History Book

Static single-file site. No build step needed.

## Deploy to Vercel

1. Push this folder to GitHub (just `index.html` + `vercel.json`)
2. Import repo on vercel.com — it auto-detects as static
3. In **Settings → Environment Variables**, add:
   - **Name:** `RPLHRPASS`
   - **Value:** your password
4. Deploy

> Note: The admin login hits `/api/admin` which won't work on a pure static deploy.
> For the admin password check to work, you need the API route.
> Option A: Use the Next.js version (original zip).
> Option B: Set a hardcoded password in the HTML (less secure but simpler).

## Updating Data

Edit the `seasons`, `records`, and `hofReqs` arrays directly in `index.html`.
