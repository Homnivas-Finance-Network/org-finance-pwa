import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
  type User,
} from "firebase/auth";

// All NEXT_PUBLIC_* values come from Firebase Console → Project Settings →
// General → Your apps → SDK setup and configuration. These are safe to
// expose client-side (they identify the project, they don't authenticate
// anything by themselves) — set them as build-time env vars in Cloudflare
// Pages, not secrets.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);

let recaptchaVerifier: RecaptchaVerifier | null = null;

/** Firebase phone auth requires an invisible reCAPTCHA bound to a real DOM
 * node before you can send an OTP. Call this once the container element
 * exists (see app/page.tsx), it's idempotent. */
export function getRecaptchaVerifier(containerId: string): RecaptchaVerifier {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
    });
  }
  return recaptchaVerifier;
}

export async function sendOtp(
  phoneNumberE164: string,
  containerId: string
): Promise<ConfirmationResult> {
  const verifier = getRecaptchaVerifier(containerId);
  return signInWithPhoneNumber(auth, phoneNumberE164, verifier);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/** Every authenticated call to the backend needs this — it's the token
 * app/auth.py on the backend verifies with Firebase Admin. Force-refresh
 * is off by default; Firebase SDK already refreshes automatically before
 * expiry, so this stays cheap. */
export async function getIdToken(forceRefresh = false): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken(forceRefresh);
}
