import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAJr279LGZaK3nYg1dNOHY6J6P2ymp5SPU",
  authDomain: "focus-flow-cf3cb.firebaseapp.com",
  projectId: "focus-flow-cf3cb",
  storageBucket: "focus-flow-cf3cb.firebasestorage.app",
  messagingSenderId: "968020545612",
  appId: "1:968020545612:web:79e113ac9c672269e464e9",
  measurementId: "G-5KJT1YL8L4"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics }; 