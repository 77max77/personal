import { initializeApp } from 'firebase/app';
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBvjV_ceHIqH8kvL_AGafdT4tOQGnDkhto",
    authDomain: "newhealth-de81a.firebaseapp.com",
    projectId: "newhealth-de81a",
    storageBucket: "newhealth-de81a.appspot.com",
    messagingSenderId: "738488916755",
    appId: "1:738488916755:web:abe8d00c37409dca9b18e6"
  };
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const fireStoreJob = getFirestore(app);

export { auth };
export { fireStoreJob, getFirestore };