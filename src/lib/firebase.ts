import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase config from the console
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase only if API key is present (prevents build-time crashes)
const isConfigValid = !!firebaseConfig.apiKey;
const app = isConfigValid
    ? (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig))
    : null;

const auth = app ? getAuth(app) : null as unknown as ReturnType<typeof getAuth>;
const db = app ? getFirestore(app) : null as unknown as ReturnType<typeof getFirestore>;
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };
