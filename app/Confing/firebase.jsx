import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDJjPKRjnGXKwEDMDiU-NZhBiBV-nwYji8",
  authDomain: "rider-app-d5e99.firebaseapp.com",
  projectId: "rider-app-d5e99",
  storageBucket: "rider-app-d5e99.appspot.com",
  messagingSenderId: "543132861594",
  appId: "1:543132861594:web:a2c39c7d79f45f78bf8b23",
  measurementId: "G-V90EM8SHHZ"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };