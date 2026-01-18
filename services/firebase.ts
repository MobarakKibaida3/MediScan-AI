
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyApLdR_HYTvEdIeI-NDMCJAqh7-dGtZt-o",
  authDomain: "mediscan-ai-69992.firebaseapp.com",
  projectId: "mediscan-ai-69992",
  storageBucket: "mediscan-ai-69992.firebasestorage.app",
  messagingSenderId: "794294973898",
  appId: "1:794294973898:web:87c337a35671bb17a78b33",
  measurementId: "G-Z37GY2Z39Q"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy
};
