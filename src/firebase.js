import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyACr_7AjqRAX-mVwcH3zIsqEK9k9o6c3Tg',
  authDomain: 'croacia-2026-8857e.firebaseapp.com',
  projectId: 'croacia-2026-8857e',
  storageBucket: 'croacia-2026-8857e.firebasestorage.app',
  messagingSenderId: '729368067855',
  appId: '1:729368067855:web:0a96ed220a8dd518fa887a',
  measurementId: 'G-V5Y2EFW00E',
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const ITEMS_COLLECTION = 'items'
