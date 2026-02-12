import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDfwLDAkt5E_cBWvYBHiJCI811tNobdIq0",
    authDomain: "holavoca-app-12345.firebaseapp.com",
    projectId: "holavoca-app-12345",
    storageBucket: "holavoca-app-12345.firebasestorage.app",
    messagingSenderId: "634220929894",
    appId: "1:634220929894:web:2f495a296d88ea8f7e5ea7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
    try {
        console.log("Attempting to connect to Firestore...");
        const snapshot = await getDocs(collection(db, "users"));
        console.log("✅ Success! Firestore connection verified.");
        console.log(`Found ${snapshot.size} documents.`);
        process.exit(0);
    } catch (e) {
        console.error("❌ Error connecting to Firestore:");
        console.error(e.code, e.message);
        process.exit(1);
    }
}

check();
