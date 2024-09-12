// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAqeEoFbbrWgSKMQdmUaekj7AebwiMnvsw",
  authDomain: "axoria-blog.firebaseapp.com",
  projectId: "axoria-blog",
  storageBucket: "axoria-blog.appspot.com",
  messagingSenderId: "305972934115",
  appId: "1:305972934115:web:cb86225f459524f322dcd6",
  measurementId: "G-JZLG823WYZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Exporter Firebase Storage
export const storage = getStorage(app);

// const analytics = getAnalytics(app);