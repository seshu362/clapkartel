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

export { app, auth };
