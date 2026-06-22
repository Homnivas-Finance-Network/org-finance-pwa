# org-finance-pwa

Homnivas Finance Network — partner-facing PWA. Static HTML/JS, no build
step. Firebase Auth (phone OTP for partners, Google for staff) + Firestore
for data; backend API runs separately on Cloud Run
(`org-finance-backend`).

Hosted on **Cloudflare Pages**.

## Before deploying

1. Fill in `firebase-config.js` with your Firebase project's web SDK config
   (Firebase Console → Project Settings → General → Your apps).
2. Confirm `BACKEND_API_URL` at the top of `app.js` points at your live
   Cloud Run backend.

## Deploy — dashboard

1. [Cloudflare dashboard](https://dash.cloudflare.com) → **Workers & Pages**
   → **Create** → **Pages** → **Connect to Git** → select this repo.
2. Build settings: **Framework preset = None**, **Build command = (empty)**,
   **Build output directory = /** — this is a plain static site, nothing to
   build.
3. Deploy. Cloudflare gives you a `*.pages.dev` URL immediately; add a
   custom domain afterwards under the project's **Custom domains** tab if
   you want one (e.g. `partner.homnivas.space`).

## Deploy — CLI

```bash
npx wrangler pages deploy . --project-name=homnivas-partner-pwa
```

Run from inside this folder. Re-run the same command for every redeploy.

## After every new domain (first deploy, or adding a custom domain)

Two things outside this repo need that domain added, or auth will break:

1. **Firebase Console → Authentication → Settings → Authorized domains** →
   add your `*.pages.dev` URL and/or custom domain. Without this, both
   phone OTP and Google sign-in fail with `auth/unauthorized-domain`.
2. **Cloud Run → your backend service → Edit & deploy new revision →
   Variables** → update `CORS_ALLOWED_ORIGINS` to include the new domain.

See `SETUP.md` (in the backend repo's delivery bundle) for the full
checklist.
