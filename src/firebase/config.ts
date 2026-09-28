import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";

// Provisioned Firebase project configuration
export const firebaseConfig = {
  projectId: "gen-lang-client-0826475364",
  appId: "1:485111902240:web:973b26b44080ffc5f14c45",
  apiKey: "AIzaSyCiudT8FDMjHV1TpfRoBQNbGDaWqrK3CEc",
  authDomain: "gen-lang-client-0826475364.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-brewbloomcaf-d5eac10b-6974-43c3-abbe-4c804342f217",
  storageBucket: "gen-lang-client-0826475364.firebasestorage.app",
  messagingSenderId: "485111902240",
};

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication & Google Auth Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// Request email and profile scopes
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Firestore with the provisioned database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Validate Connection to Firestore on startup
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore connection notice: Client is offline or initializing.");
    }
  }
}

if (typeof window !== "undefined") {
  testConnection().catch(() => {});
}
