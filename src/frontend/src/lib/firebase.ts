import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDq6hUNQWSyUol7q3sMG6Nc2D2rE5Z_A_A",
  authDomain: "laptop-tracker-ed5f3.firebaseapp.com",
  databaseURL: "https://laptop-tracker-ed5f3-default-rtdb.firebaseio.com",
  projectId: "laptop-tracker-ed5f3",
  storageBucket: "laptop-tracker-ed5f3.firebasestorage.app",
  messagingSenderId: "845724264197",
  appId: "1:845724264197:web:6a7d61b88060482c6fb96c",
  measurementId: "G-HY609WSN4C",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const firebaseDb = getDatabase(firebaseApp);

if (typeof window !== "undefined") {
  void isSupported()
    .then((supported) => {
      if (supported) {
        getAnalytics(firebaseApp);
      }
    })
    .catch(() => {
      // analytics unavailable in this runtime
    });
}
