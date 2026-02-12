import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase config from the console
const firebaseConfig = {
    apiKey: "AIzaSyDfwLDAkt5E_cBWvYBHiJCI811tNobdIq0",
    authDomain: "holavoca-app-12345.firebaseapp.com",
    projectId: "holavoca-app-12345",
    storageBucket: "holavoca-app-12345.firebasestorage.app",
    messagingSenderId: "634220929894",
    appId: "1:634220929894:web:2f495a296d88ea8f7e5ea7"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };
