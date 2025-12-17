import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyA9j7J4KC38BMkXKD7yTLAOC1MtipzbZD0',
  authDomain: 'minhas-f-inan.firebaseapp.com',
  databaseURL:
    'https://minhas-f-inan-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'minhas-f-inan',
  storageBucket: 'minhas-f-inan.firebasestorage.app',
  messagingSenderId: '444849461178',
  appId: '1:444849461178:web:39849e21556f797b802f83',
  measurementId: 'G-NDQBLH21S0',
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
