 import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDFaGg33zGz90AT4QlW3-mnxq9XT2UBes",
  authDomain: "juninho7.firebaseapp.com",
  projectId: "juninho7",
  storageBucket: "juninho7.firebasestorage.app",
  messagingSenderId: "832183263606",
  appId: "1:832183263606:web:9759e81a032aeef44b1a57",
  measurementId: "G-RC7PWDM4X2",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export default app;