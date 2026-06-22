// ---------------------------------------------------------------------------
// Firebase Web SDK configuration.
//
// Get these values from: Firebase Console -> Project Settings (gear icon) ->
// General tab -> "Your apps" -> Web app -> SDK setup and configuration ->
// "Config" radio button.
//
// This file is loaded as a plain script (not a module) so it's the one and
// only place you need to paste your project's config — app.js reads it from
// window.HOMNIVAS_FIREBASE_CONFIG.
//
// Also required before this works:
//   1. Firebase Console -> Authentication -> Sign-in method -> enable
//      "Email/Password".
//   2. Firebase Console -> Firestore Database -> create database (if not
//      already created) and deploy the firestore.rules from the backend repo.
// ---------------------------------------------------------------------------

window.HOMNIVAS_FIREBASE_CONFIG = {
  apiKey: "AIzaSyA9-Say6gHQGTDtZQooIcLx3XEs82Dvihs",
  authDomain: "homnivas-pwa.firebaseapp.com",
  projectId: "homnivas-pwa",
  storageBucket: "homnivas-pwa.firebasestorage.app",
  messagingSenderId: "1059108924249",
  appId: "1:1059108924249:web:d5e763ba0442c7b8cd7a48"
};