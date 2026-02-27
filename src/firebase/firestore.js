import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import * as configModule from "./firebaseConfig";

// Firebase app and Firestore database instance
// It works with both default export and named export from firebaseConfig.js

const firebaseConfig = configModule.default || configModule.firebaseConfig;

if (!firebaseConfig) {
  throw new Error("firebaseConfig is missing in src/firebase/firebaseConfig.js");
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

const db = getFirestore(app);

export { app, db };