import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth, isConfigured } from './config';
import { UserProfile } from '../types';
import { createUserProfileDoc, getUserProfileDoc } from './firestoreService';

export function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'Este e-mail já está cadastrado. Tente fazer login ou redefinir a senha.';
    case 'auth/invalid-email':
      return 'O formato do e-mail inserido é inválido.';
    case 'auth/weak-password':
      return 'A senha é muito fraca. Utilize pelo menos 6 caracteres.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos. Verifique suas credenciais.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas com falha. Aguarde alguns instantes antes de tentar novamente.';
    case 'auth/network-request-failed':
      return 'Falha na conexão de rede. Verifique seu acesso à internet.';
    case 'auth/api-key-not-valid':
    case 'auth/invalid-api-key':
      return 'Chave de API do Firebase não configurada. Configure o arquivo .env ou use o modo Demonstração.';
    default:
      return `Erro na autenticação (${errorCode}). Verifique os dados informados.`;
  }
}

/**
 * Register new user with email and password
 */
export async function registerWithEmail(
  email: string,
  pass: string,
  displayName: string,
  initialData: Partial<UserProfile>
): Promise<User> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;

  if (displayName) {
    try {
      await updateProfile(user, { displayName });
    } catch (e) {
      console.warn('Could not update display name in Auth profile:', e);
    }
  }

  // Create profile document in Firestore
  const profile: UserProfile = {
    uid: user.uid,
    email: user.email || email,
    displayName: displayName || user.displayName || 'Atleta Aura',
    targetWeight: initialData.targetWeight || 70,
    dailyCalorieGoal: initialData.dailyCalorieGoal || 2200,
    currentWeight: initialData.currentWeight || 75,
    height: initialData.height || 175,
    activityLevel: initialData.activityLevel || 'moderate',
    themePreference: initialData.themePreference || 'dark',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await createUserProfileDoc(profile);
  return user;
}

/**
 * Sign in existing user with email and password
 */
export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  return userCredential.user;
}

/**
 * Sign out current user
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Send password reset email
 */
export async function resetUserPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Listen to auth state changes
 */
export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
