
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy,
  enableIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyApLdR_HYTvEdIeI-NDMCJAqh7-dGtZt-o",
  authDomain: "mediscan-ai-69992.firebaseapp.com",
  projectId: "mediscan-ai-69992",
  storageBucket: "mediscan-ai-69992.firebasestorage.app",
  messagingSenderId: "794294973898",
  appId: "1:794294973898:web:87c337a35671bb17a78b33",
  measurementId: "G-Z37GY2Z39Q"
};

// تهيئة التطبيق
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ضبط استمرارية الجلسة لتجنب أخطاء الوعود المعلقة
setPersistence(auth, browserLocalPersistence).catch(console.error);

// محاولة تفعيل التخزين المحلي لـ Firestore ليعمل التطبيق حتى لو كانت الـ API معطلة مؤقتاً
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
        console.warn('The current browser does not support all of the features required to enable persistence');
    }
});

const googleProvider = new GoogleAuthProvider();

export { 
  auth,
  db,
  googleProvider,
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
