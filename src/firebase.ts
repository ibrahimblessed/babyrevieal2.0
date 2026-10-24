import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// The web config is safe to ship in client code. Access is protected by Firebase Auth
// and the Firestore rules in firestore.rules, not by hiding these values.
const firebaseConfig = {
  apiKey: 'AIzaSyBYr_bzFfFiAsSe_fCMuF33dtt_6a2m0ww',
  authDomain: 'ibrahim-cv-df6ad.firebaseapp.com',
  projectId: 'ibrahim-cv-df6ad',
  storageBucket: 'ibrahim-cv-df6ad.firebasestorage.app',
  messagingSenderId: '923121145826',
  appId: '1:923121145826:web:3024fb587d04ec7b008bbb',
  measurementId: 'G-X1SP6SEPQM',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics only works in some browsers and contexts, so start it only when supported.
isSupported()
  .then((ok) => {
    if (ok) getAnalytics(app);
  })
  .catch(() => undefined);
