// Firebase Configuration - Skincare by Polly
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyBlZP6K55T1Mos8NzvOJtffXUDOOz_xR8o",
  authDomain: "skincare-by-polly.firebaseapp.com",
  projectId: "skincare-by-polly",
  storageBucket: "skincare-by-polly.firebasestorage.app",
  messagingSenderId: "423592521435",
  appId: "1:423592521435:web:acacedddcb71e8ec5d66fe",
  measurementId: "G-RJP3WC88PF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// ══ AUTH FUNCTIONS ══
export async function cadastrar(nome, email, senha) {
  const cred = await createUserWithEmailAndPassword(auth, email, senha);
  await setDoc(doc(db, 'usuarios', cred.user.uid), {
    nome, email,
    plano: 'mensal',
    criadoEm: serverTimestamp(),
    atualizacoes: { mes: '', usado: 0, limite: 3 }
  });
  return cred.user;
}

export async function login(email, senha) {
  const cred = await signInWithEmailAndPassword(auth, email, senha);
  return cred.user;
}

export async function loginGoogle() {
  const cred = await signInWithPopup(auth, googleProvider);
  // Criar perfil se for primeiro login
  const userRef = doc(db, 'usuarios', cred.user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      nome: cred.user.displayName || '',
      email: cred.user.email,
      plano: 'mensal',
      criadoEm: serverTimestamp(),
      atualizacoes: { mes: '', usado: 0, limite: 3 }
    });
  }
  return cred.user;
}

export async function logout() {
  await signOut(auth);
}

// ══ DATA FUNCTIONS ══
export async function salvarProtocolo(uid, protocolo, perfil) {
  await setDoc(doc(db, 'protocolos', uid), {
    protocolo,
    perfil,
    atualizadoEm: serverTimestamp()
  });
}

export async function buscarProtocolo(uid) {
  const snap = await getDoc(doc(db, 'protocolos', uid));
  return snap.exists() ? snap.data() : null;
}

export async function salvarEvolucao(uid, historico) {
  await setDoc(doc(db, 'evolucao', uid), {
    historico,
    atualizadoEm: serverTimestamp()
  });
}

export async function buscarEvolucao(uid) {
  const snap = await getDoc(doc(db, 'evolucao', uid));
  return snap.exists() ? snap.data().historico : [];
}

export async function buscarUsuario(uid) {
  const snap = await getDoc(doc(db, 'usuarios', uid));
  return snap.exists() ? snap.data() : null;
}

export async function verificarAtualizacao(uid) {
  const userData = await buscarUsuario(uid);
  if (!userData) return { pode: false, restantes: 0 };
  
  const mesAtual = new Date().toISOString().substring(0,7);
  const atu = userData.atualizacoes || { mes: '', usado: 0, limite: 3 };
  
  if (atu.mes !== mesAtual) {
    // Novo mês - resetar
    await updateDoc(doc(db, 'usuarios', uid), {
      'atualizacoes.mes': mesAtual,
      'atualizacoes.usado': 0
    });
    return { pode: true, restantes: atu.limite };
  }
  
  const restantes = atu.limite - atu.usado;
  return { pode: restantes > 0, restantes };
}

export async function incrementarAtualizacao(uid) {
  const userData = await buscarUsuario(uid);
  if (!userData) return;
  const atu = userData.atualizacoes || { usado: 0 };
  await updateDoc(doc(db, 'usuarios', uid), {
    'atualizacoes.usado': (atu.usado || 0) + 1
  });
}

export { onAuthStateChanged };
