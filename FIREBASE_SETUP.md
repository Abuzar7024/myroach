# Firebase Setup — MY ROACH

Step-by-step guide to enable Firestore, **phone-only authentication**, and seed data for the MY ROACH Next.js app.

> **Without Firebase:** The app runs in demo mode with mock data. No console errors after the first dev-only warning.

---

## What you must provide / configure (OTP checklist)

Copy this checklist and fill in values from **Firebase Console → Project settings → Your apps → Web app**.

### 1. Environment variables (`.env.local`)

| Variable | Required | Where to find |
|----------|----------|---------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | Project settings → Web app config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | e.g. `your-project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Project settings |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Yes | e.g. `your-project.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes | Project settings |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Yes | Project settings |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Optional | Analytics only |

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=myroach-6cc80
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

Restart the dev server after changing env vars.

### 2. Firebase Console — Authentication

| Step | Action |
|------|--------|
| Enable Phone provider | **Authentication → Sign-in method → Phone → Enable** |
| Authorized domains | **Authentication → Settings → Authorized domains** — add `localhost`, your production domain (e.g. `myroach.in`), and Vercel preview domain if used |
| Test numbers (dev) | **Phone → Phone numbers for testing** — e.g. `+91 9876543210` / OTP `123456` (no SMS sent) |
| Production SMS | **Upgrade to Blaze plan** — real numbers need pay-as-you-go for SMS delivery |
| reCAPTCHA | Automatic — invisible reCAPTCHA works when Phone auth is enabled and domain is authorized. No extra site key in the app. |

### 3. Firebase Console — Firestore

| Step | Action |
|------|--------|
| Enable Firestore API | [Google Cloud Console](https://console.developers.google.com/apis/api/firestore.googleapis.com/overview) → Enable |
| Create database | **Build → Firestore Database → Create** (production mode, region e.g. `asia-south1`) |
| Deploy rules | `firebase deploy --only firestore:rules,storage` from project root |

### 4. Send us (or verify yourself)

When handing off the project, confirm you have:

- [ ] All six required `NEXT_PUBLIC_FIREBASE_*` values in `.env.local`
- [ ] Phone auth **enabled** in Firebase Console
- [ ] `localhost` + production domain in **Authorized domains**
- [ ] At least one **test phone number** configured (for dev without SMS), **or** Blaze plan for live SMS
- [ ] Firestore database created and rules deployed
- [ ] `.env.local` is **never** committed to git (already in `.gitignore`)

---

## 1. Enable the Cloud Firestore API

The Firestore API must be enabled in Google Cloud before the client SDK can connect.

1. Open the Google Cloud Console for your project:
   - **Direct link (myroach-6cc80):**  
     https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=myroach-6cc80
   - Or replace `myroach-6cc80` with your `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
2. Click **Enable**
3. Wait 1–2 minutes for the API to propagate

---

## 2. Create the Firestore database

1. Go to [Firebase Console](https://console.firebase.google.com) → your project
2. **Build** → **Firestore Database**
3. Click **Create database**
4. Choose **Production mode** (security rules will be deployed separately)
5. Pick a region close to your users (e.g. `asia-south1` for India)
6. Click **Enable**

---

## 3. Deploy security rules

From the project root (requires [Firebase CLI](https://firebase.google.com/docs/cli)):

```bash
# Log in (first time only)
npx firebase-tools login

# Use your project (already set in .firebaserc for myroach-6cc80)
npx firebase-tools use myroach-6cc80

# Deploy Firestore + Storage rules
firebase deploy --only firestore:rules,storage
```

Rules live in `firebase/firestore.rules` and `firebase/storage.rules`.

---

## 4. Phone OTP setup (required)

MY ROACH uses **phone-only sign-in**. Email/password and Google are not used in the UI.

### Step 1 — Enable Phone provider

1. **Authentication → Sign-in method → Phone**
2. Click **Enable** and save

### Step 2 — Authorized domains

**Authentication → Settings → Authorized domains**

| Domain | When |
|--------|------|
| `localhost` | Local dev (added by default) |
| `127.0.0.1` | Local dev via IP — add manually if OTP fails on localhost |
| Your production domain | e.g. `myroach.in` |
| Vercel preview domain | e.g. `your-app.vercel.app` if deploying to Vercel |

Firebase uses invisible reCAPTCHA on web — the domain must be authorized or OTP send will fail.

> **Localhost note:** Firebase Phone Auth has known limitations on `localhost`. For local dev, use **test phone numbers** (recommended) or deploy to Vercel and add that domain to authorized domains. Still add both `localhost` and `127.0.0.1` in the console.

### Step 2b — SMS region policy (India +91)

1. **Authentication → Settings → SMS region policy**
2. Choose **Allow** (or **Deny** with exceptions)
3. Add **India (+91)** to the allowed list

Without this, real SMS to Indian numbers may be blocked even when Phone auth is enabled.

### Step 3 — Test phone numbers (no SMS required)

For local/dev testing without sending real SMS:

1. **Authentication → Sign-in method → Phone**
2. Scroll to **Phone numbers for testing**
3. Add a test number and fixed OTP code:

| Phone number | Verification code |
|--------------|-------------------|
| `+91 9876543210` | `123456` |

In the app, enter `9876543210` and use code `123456`. No SMS is sent for test numbers.

### Step 4 — Production SMS (Blaze plan)

Real phone numbers receive SMS OTP via Firebase. **Production SMS requires the Firebase Blaze (pay-as-you-go) plan.** Spark (free) works with test numbers only.

Upgrade: **Firebase Console → Upgrade** if you need live OTP delivery.

### Step 5 — reCAPTCHA (automatic)

The app uses Firebase **invisible reCAPTCHA** via `RecaptchaVerifier` with `size: "invisible"`, attached to the **Send OTP** button (no shared `#recaptcha-container` div). No extra site key is needed — Firebase handles it when Phone auth is enabled and domains are authorized.

**Dev testing:** Use Firebase test phone `+91 9876543210` with OTP `123456` (configure under Authentication → Phone → Phone numbers for testing). No SMS is sent for test numbers.

### Step 6 — App Check (optional, production)

For production hardening against abuse:

1. **Build → App Check** in Firebase Console
2. Register your web app with reCAPTCHA Enterprise or reCAPTCHA v3
3. Enforce App Check on Authentication when ready

Not required for initial development.

---

## 5. Seed Firestore with catalog data

After Firestore is enabled and rules are deployed:

```bash
npm run seed
```

This writes products, categories, banners, reviews, and coupons from `src/data/mock-data.ts`.

> **Note:** Default rules only allow admin writes. For initial seeding you can either:
> - Temporarily relax write rules, seed, then redeploy production rules, or
> - Use Firebase Admin SDK with a service account (recommended for CI/production)

---

## 6. Set an admin user

1. Register via the app (phone OTP → name → address)
2. In **Firebase Console → Firestore → users → {uid}**
3. Edit the document and set:
   ```json
   { "role": "admin" }
   ```
4. Admin routes (`/admin/*`) and write operations will work for that user

---

## 7. Verify everything works

```bash
npm run dev
```

- Homepage and `/shop` load without login (browse freely)
- **Add to Cart / Checkout** redirect to `/login` when signed out
- Phone login: enter `9876543210` → OTP `123456` (if test number configured)
- Register: phone → OTP → name → address → account saved in `users/{uid}`
- After login, add to cart → checkout → payment → order saved to Firestore
- Profile → Addresses updates the user document

```bash
npm run build
```

Build should complete without Firestore-related failures.

---

## Testing phone OTP locally

1. Complete [Phone OTP setup](#4-phone-otp-setup-required) above
2. Ensure `.env.local` has all required `NEXT_PUBLIC_FIREBASE_*` vars
3. Restart dev server: `npm run dev`
4. Open `/shop` — browse without signing in
5. Click **Add to Cart** on any product → redirected to `/login?redirect=...`
6. Enter test phone `9876543210` → **Send OTP** → enter `123456`
7. After login, you return to the product page and can add to cart
8. Register flow: `/register` → OTP → name → address → redirect to shop

| Issue | Fix |
|-------|-----|
| `auth/operation-not-allowed` | Enable Phone provider |
| reCAPTCHA / domain error | Add `localhost` and `127.0.0.1` to authorized domains; use test numbers locally |
| SMS blocked for +91 | Enable India in SMS region policy |
| Invalid OTP | Use exact test code from Firebase Console |
| SMS not received (real number) | Upgrade to Blaze plan |
| "Firebase not configured" | Fill all required env vars and restart dev server |

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `PERMISSION_DENIED: Cloud Firestore API has not been used` | Enable Firestore API (step 1) |
| `Could not reach Cloud Firestore backend` | Create database (step 2), wait a few minutes |
| Seed script permission denied | Deploy rules or use Admin SDK |
| Phone OTP fails | Enable Phone provider, authorized domains, test numbers |
| Orders not syncing | Deploy rules; ensure user is logged in |

---

## Firebase Console checklist (you must do manually)

Complete these in [Firebase Console](https://console.firebase.google.com/project/myroach-6cc80/authentication/providers) for project **myroach-6cc80**:

1. **Enable Phone sign-in** — Authentication → Sign-in method → Phone → Enable
2. **SMS region policy — allow India** — Authentication → Settings → SMS region policy → allow **India (+91)**
3. **Authorized domains** — Authentication → Settings → Authorized domains → add `localhost`, `127.0.0.1`, and your production domain (e.g. Vercel URL or custom domain)
4. **Add test phone number** — Authentication → Sign-in method → Phone → Phone numbers for testing → `+91 9876543210` / code `123456`
5. **Enable Firestore API** — [Google Cloud Console](https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=myroach-6cc80) → Enable (if not already)
6. **Blaze plan for production real SMS** — Firebase Console → Upgrade (Spark/free plan works with test numbers only)

---

## File reference

| File | Purpose |
|------|---------|
| `firebase/firestore.rules` | Firestore security rules |
| `firebase/storage.rules` | Storage security rules |
| `firebase.json` | Firebase CLI config |
| `.firebaserc` | Default project ID |
| `scripts/seed-firestore.ts` | Seed script |
| `src/lib/firebase/` | Client SDK + graceful mock fallback |
| `src/components/auth/PhoneAuthFlow.tsx` | Phone OTP login & registration UI |
| `src/contexts/auth-context.tsx` | Phone auth state & Firestore user sync |
