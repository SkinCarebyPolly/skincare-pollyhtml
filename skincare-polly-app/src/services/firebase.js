import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBlZP6K55T1Mos8NzvOJtffXUDOOz_xR8o",
  authDomain: "skincare-by-polly.firebaseapp.com",
  projectId: "skincare-by-polly",
  storageBucket: "skincare-by-polly.firebasestorage.app",
  messagingSenderId: "423592521435",
  appId: "1:423592521435:web:acacedddcb71e8ec5d66fe",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
let auth = null;

function getAuth() {
  if (auth) return auth;
  const { initializeAuth, getReactNativePersistence } = require('firebase/auth');
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  return auth;
}

export const FirebaseService = {
  async cadastrar(nome, email, senha) {
    const { createUserWithEmailAndPassword } = require('firebase/auth');
    const cred = await createUserWithEmailAndPassword(getAuth(), email, senha);
    await setDoc(doc(db, 'usuarios', cred.user.uid), {
      nome, email, plano: 'mensal',
      criadoEm: serverTimestamp(),
      atualizacoes: { mes: '', usado: 0, limite: 3 }
    });
    return cred.user;
  },

  async login(email, senha) {
    const { signInWithEmailAndPassword } = require('firebase/auth');
    const cred = await signInWithEmailAndPassword(getAuth(), email, senha);
    return cred.user;
  },

  async logout() {
    const { signOut } = require('firebase/auth');
    await signOut(getAuth());
  },

  async salvarProtocolo(uid, protocolo, perfil) {
    await setDoc(doc(db, 'protocolos', uid), {
      protocolo, perfil,
      atualizadoEm: serverTimestamp()
    });
  },

  async buscarProtocolo(uid) {
    const snap = await getDoc(doc(db, 'protocolos', uid));
    return snap.exists() ? snap.data() : null;
  },

  onAuthStateChanged(callback) {
    const { onAuthStateChanged } = require('firebase/auth');
    return onAuthStateChanged(getAuth(), callback);
  },
};