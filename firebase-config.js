import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore, doc, onSnapshot, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBwQQxghm8vERDtEHOyQUx361RctyIaR4A",
    authDomain: "pyexpo-timer.firebaseapp.com",
    projectId: "pyexpo-timer",
    storageBucket: "pyexpo-timer.firebasestorage.app",
    messagingSenderId: "143908802659",
    appId: "1:143908802659:web:22b594da192284b57fa856"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Use a shared default document for this timer event
const TIMER_DOC_ID = "main-event";

export { db, doc, onSnapshot, setDoc, updateDoc, TIMER_DOC_ID };
