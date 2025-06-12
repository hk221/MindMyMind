import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore';
import { getAuth } from "firebase/auth";

// Web app's Firebase configuration
// Replace the following with your own Firebase project configuration
// You can find this in your Firebase console under Project Settings
const firebaseConfig = {
  apiKey: "AIzaSyDqW8Mcav0opCXNvQOptRL8zhV19pwdazw",
  authDomain: "quizdatabase-6eda3.firebaseapp.com",
  projectId: "quizdatabase-6eda3",
  storageBucket: "quizdatabase-6eda3.firebasestorage.app",
  messagingSenderId: "741614543682",
  appId: "1:741614543682:web:4cbb172200a8fccd3c5edb",
  databaseURL: "https://quizdatabase-6eda3-default-rtdb.firebaseio.com/" 
};

// Initialize Firebase 
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const auth = getAuth(app);
export default app; 