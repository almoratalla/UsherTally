import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// const firebaseAdminConfig = {
//     type: process.env.NEXT_FIREBASE_ADMIN_TYPE,
//     project_id: process.env.NEXT_FIREBASE_PROJECT_ID,
//     private_key_id: process.env.NEXT_FIREBASE_PRIVATE_KEY_ID,
//     private_key: process.env.NEXT_FIREBASE_PRIVATE_KEY,
//     client_email: process.env.NEXT_FIREBASE_CLIENT_EMAIL,
//     client_id: process.env.NEXT_FIREBASE_CLIENT_ID,
//     auth_uri: process.env.NEXT_FIREBASE_AUTH_URI,
//     token_uri: process.env.NEXT_FIREBASE_TOKEN_URI,
//     auth_provider_x509_cert_url:
//         process.env.NEXT_FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
//     client_x509_cert_url: process.env.NEXT_FIREBASE_CLIENT_X509_CERT_URL,
//     universe_domain: process.env.NEXT_FIREBASE_UNIVERSE_DOMAIN,
// };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
