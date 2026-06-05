import { initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// @ts-ignore - getReactNativePersistence is exported from the RN bundle
import { getReactNativePersistence } from '@firebase/auth/dist/rn/index.js';

const firebaseConfig = {
  apiKey: 'AIzaSyB9-mON61M7vxRKOWLejoAof20-k64DgBo',
  authDomain: 'despensa-facil-daad8.firebaseapp.com',
  projectId: 'despensa-facil-daad8',
  storageBucket: 'despensa-facil-daad8.appspot.com',
  messagingSenderId: '139923069451',
  appId: '1:139923069451:web:f9b2b0c1fc74212cd4c50e',
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
