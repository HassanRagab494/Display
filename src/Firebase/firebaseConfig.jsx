// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBiqnAZUl8cpJ9BMsNDjZY7rWPauWsbsxw",
  authDomain: "data-form-82dcc.firebaseapp.com",
  projectId: "data-form-82dcc",
  storageBucket: "data-form-82dcc.appspot.com",
  messagingSenderId: "401719629231",
  appId: "1:401719629231:web:89a737a45b6d45da47cb5a",
  measurementId: "G-5CXY735CCW"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };