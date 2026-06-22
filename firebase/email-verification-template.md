# MY ROACH — Email verification (Firebase Console)

## 1. Authorized domains

**Firebase Console → Authentication → Settings → Authorized domains**

Add every domain that serves the storefront:

- `localhost`
- `myroach.vercel.app`
- `myroach-admin.vercel.app`
- Any Vercel preview host you use for testing (e.g. `myroach-*.vercel.app`)

Remove or stop using dead domains like `myroach-34ws.vercel.app`.

---

## 2. Custom action URL

**Authentication → Templates → Email address verification → Customize action URL**

Set to:

```
https://myroach.vercel.app/auth/action
```

Must match `NEXT_PUBLIC_SITE_URL` on Vercel (no trailing slash on the env var).

---

## 3. Email template

**Sender name:** `MY ROACH`  
**Subject:** `Verify your MY ROACH account`

**HTML body:**

```html
<p>Hi,</p>
<p>Thanks for joining <strong>MY ROACH</strong>.</p>
<p>Tap the button below to verify your email and continue shopping:</p>
<p><a href="%LINK%" style="display:inline-block;padding:12px 24px;background:#39ff14;color:#000;text-decoration:none;font-weight:bold;">Verify my email</a></p>
<p>Or copy this link into your browser:</p>
<p>%LINK%</p>
<p>If you did not create an account, you can ignore this email.</p>
<p>— MY ROACH Team</p>
```

---

## 4. Required Vercel env (storefront)

```env
NEXT_PUBLIC_SITE_URL=https://myroach.vercel.app
NEXT_PUBLIC_FIREBASE_APP_CHECK_RECAPTCHA_SITE_KEY=<from Firebase App Check>
```

Optional for local dev:

```env
NEXT_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN=<debug token from Firebase Console>
```

If App Check is **enforced** on Authentication but the reCAPTCHA site key is missing on Vercel, `sendEmailVerification` will fail and no email is sent.

---

## 5. How the flow works

1. Sign-up calls `sendEmailVerification` with continue URL `https://myroach.vercel.app/auth/action`
2. User clicks the link → `/auth/action?mode=verifyEmail&oobCode=…`
3. App calls `applyActionCode`, reloads the user, then returns them to the page they were on

If the initial send fails, the waiting room at `/account/verify` automatically retries once and shows the real Firebase error message.

---

## 6. Troubleshooting

| Symptom | Fix |
|--------|-----|
| No email at all | Check spam; confirm Email/Password is enabled in Sign-in method; check App Check + reCAPTCHA key on Vercel |
| Link opens 404 | Update Firebase **Customize action URL** to `myroach.vercel.app` (not old preview URLs) |
| "Invalid link" on site | Link expired or already used — use **Resend verification link** |
| "Unauthorized continue URI" | Add `myroach.vercel.app` to **Authorized domains** |
