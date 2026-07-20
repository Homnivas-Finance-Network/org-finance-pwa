# Homnivas Arth — Frontend PWA

Next.js 14 (App Router, static export) — the full 11-step flow: phone OTP  →
quiz → personality reveal → locked preview → ₹345 checkout → profile →
document upload → AI analysis → Pro dashboard → 1-EMI / Loan-Against-FD
offers. Talks to the `homnivas-finance-pro` backend for everything real
(auth verification, payment, analysis, leads) — this app holds no secrets
and does no server-side logic of its own.

```
src/
  app/            One folder per screen (page.tsx), App Router
  components/     ScoreRing, ArchetypeCard, OfferCards, AskArth, etc.
  context/        AuthProvider (Firebase), JourneyProvider (quiz/analysis state)
  lib/            firebase.ts, api.ts (backend client), archetype.ts (quiz scoring)
public/
  manifest.json, sw.js, icons/   PWA install support
```

Verified: `npm run build` produces a clean static export in `/out` — 13
routes, no errors. Ran it myself before handing this over.

---

## 1. Firebase — enable Phone Auth

This reuses the **same Firebase project** as the backend (`homnivas-pwa`) —
don't create a second one.

1. Firebase Console → your project → **Build → Authentication → Sign-in method → Phone → Enable**.
2. **Authentication → Settings → Authorized domains** → add your actual frontend domain(s) once you have them (e.g. `app.homnivas.space`, `org-finance-pwa.pages.dev`). Phone sign-in silently fails with an `unauthorized-domain` error if this is skipped — easy to miss, breaks Step 1 entirely.
3. Phone Auth needs the **Blaze (pay-as-you-go)** plan — the free Spark plan doesn't cover real SMS delivery beyond a handful of test numbers. If your other Homnivas apps already send real OTPs, you're already on Blaze; if not, upgrade before testing with a real phone number.
4. Get your **client-side** config (different from the backend's service account key): Project Settings → General → Your apps → add a Web app if you haven't already → copy the `firebaseConfig` values into the env vars below. These are safe to expose publicly — they identify the project, they don't grant access to anything by themselves.

## 2. Razorpay — public key only

The frontend only ever needs the **Key ID** (starts `rzp_live_` or
`rzp_test_`), never the secret — that stays backend-only. Same key you
already set as `RAZORPAY_KEY_ID` on the backend.

## 3. Cloudflare Pages — deploy

Same pattern as your other projects:

1. Push this repo to GitHub.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** → select the repo.
3. Build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Root directory**: leave blank unless this repo is nested
4. **Settings → Environment variables** → add all of these (Production, and Preview if you want preview deploys to work too):
   ```
   NEXT_PUBLIC_API_BASE_URL=https://org-finance-backend-1059108924249.us-central1.run.app
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...
   ```
   These are all `NEXT_PUBLIC_*` — Next.js bakes them into the static build at build time, so they must be set as **build-time** env vars here, not runtime ones. If you change one later, you need to trigger a new build for it to take effect, not just a redeploy of the same build output.
5. Deploy. Cloudflare rebuilds automatically on every push to the connected branch, same as your backend's Cloud Build trigger.

## 4. After first deploy — close the loop

- Go back to the backend's `ALLOWED_ORIGINS` env var in Cloud Run and make sure it matches your actual Cloudflare Pages URL exactly (including `https://`, no trailing slash). It's currently set to `https://app.homnivas.space, https://org-finance-pwa.pages.dev` — update if your real domain differs.
- Add the same domain to Firebase's Authorized domains (step 1.2 above) if you haven't yet.
- Test the full flow once end-to-end with a real phone number before treating this as launch-ready: OTP → quiz → pay a real ₹1 test transaction if Razorpay is still in test mode → upload a real CIBIL PDF and bank statement → confirm the dashboard actually renders real numbers, not just that the build compiles.

## Known placeholders — replace before launch

- **`public/icons/icon-192.png` and `icon-512.png`** are generated placeholders (a plain "A" mark in your color palette) — not real branding. Replace with actual app icons before this goes live as an installable PWA; the manifest already points at the right filenames, so dropping in replacements of the same size is enough.
- **PAN validation** in `profile-setup` checks the format (`ABCDE1234F`) but not that it's a real, verified PAN — that's a product decision (KYC verification service) I didn't make for you.

## Design system

Dark, precision-ledger fintech palette — same CSS variable naming
convention as your flow-diagram HTML (`--bg-success`, `--text-accent`,
etc.), defined in `src/app/globals.css`. Typefaces: Space Grotesk (display),
IBM Plex Sans (body), IBM Plex Mono (money figures and the Arth Score —
tabular numerals so digits align in EMI tables). Fonts are self-hosted
(`next/font/local`), not fetched from Google Fonts at build time — faster
builds, no external dependency during CI.

## Backend changes bundled with this frontend

Two endpoints didn't exist yet and were added to `homnivas-finance-pro` to
make this frontend actually work end-to-end — get the updated backend zip
too, not just this one:

- `POST /api/profile/setup` + `GET /api/profile/me` — Step 6 profile form had nowhere to save to before this.
- `POST /api/analytics/ask` — the "Ask Arth" advisor on the dashboard, grounded in the user's actual latest analysis via OpenRouter.
