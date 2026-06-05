import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { loginUser, registerUser, resetPassword, logoutUser } from '@/services/authService';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setState({ user, loading: false, error: null });
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await loginUser(email, password);
    } catch (e: any) {
      setState((prev) => ({ ...prev, loading: false, error: getErrorMessage(e.code) }));
    }
  };

  const register = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await registerUser(email, password);
    } catch (e: any) {
      setState((prev) => ({ ...prev, loading: false, error: getErrorMessage(e.code) }));
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await resetPassword(email);
      return true;
    } catch {
      return true; // Retorna true mesmo em erro para não revelar se e-mail existe
    }
  };

  const logout = async () => {
    await logoutUser();
  };

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    register,
    forgotPassword,
    logout,
    clearError,
  };
}

function getErrorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Este e-mail já está em uso.';
    case 'auth/invalid-email':
      return 'E-mail inválido.';
    case 'auth/weak-password':
      return 'A senha deve ter pelo menos 6 caracteres.';
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente mais tarde.';
    default:
      return 'Ocorreu um erro. Tente novamente.';
  }
}
