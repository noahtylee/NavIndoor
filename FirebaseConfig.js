// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDwLyi__kjyajDbwLcCWsUrgQ60il8q7SI",
  authDomain: "navindoorr.firebaseapp.com",
  databaseURL: "https://navindoorr-default-rtdb.firebaseio.com",
  projectId: "navindoorr",
  storageBucket: "navindoorr.appspot.com",
  messagingSenderId: "355223820299",
  appId: "1:355223820299:web:310acc8212d5cb293ecf0e",
  measurementId: "G-BJCSPKMLWL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export {app, database };