// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDjFhmKerTQYP5JamR3IHXz2ZjAyMYcsgo",
    authDomain: "gullycinema-9463c.firebaseapp.com",
    projectId: "gullycinema-9463c",
    storageBucket: "gullycinema-9463c.firebasestorage.app",
    messagingSenderId: "586333346683",
    appId: "1:586333346683:web:af9823ac2b6b90f92bbbde"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Set language for SMS templates
auth.languageCode = 'en';

// ⚠️ PRODUCTION CONFIGURATION
// Set this to TRUE when you have test phone numbers configured in Firebase Console
// Set to FALSE to use real OTP with reCAPTCHA
const USE_FIREBASE_TEST_PHONES = false; // ← Production mode for real OTP

// Only enable test mode if explicitly configured
if (USE_FIREBASE_TEST_PHONES && (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost')) {
    // Enable test phone numbers (configure these in Firebase Console)
    // Go to: Firebase Console > Authentication > Settings > Phone > Phone numbers for testing
    // Add: +918106458788 with any 6-digit code like 123456
    auth.settings.appVerificationDisabledForTesting = true;
    console.log('🔧 Firebase Test Mode: ENABLED');
    console.log('📱 Make sure you have test phone numbers configured in Firebase Console!');
} else {
    auth.settings.appVerificationDisabledForTesting = false;
    console.log('🔧 Firebase Test Mode: DISABLED - Will use reCAPTCHA');
}

export { app, auth };
