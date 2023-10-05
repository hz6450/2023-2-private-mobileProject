import { initializeApp } from "firebase/app";
import { getAuth , createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDVdIf3cw-ApoOeM1vFSWmztwuAU1JZ3X0",
  authDomain: "mp-42119.firebaseapp.com",
  projectId: "mp-42119",
  storageBucket: "mp-42119.appspot.com",
  messagingSenderId: "364334395555",
  appId: "1:364334395555:web:ed5c8ae17e46fbb80b4f16"
};

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);

  export default { firebaseApp, firebaseAuth , createUserWithEmailAndPassword, signInWithEmailAndPassword };