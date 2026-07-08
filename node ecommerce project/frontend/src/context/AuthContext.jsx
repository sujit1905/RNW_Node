import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { apiRequest, getAuthHeaders } from '../lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  const setSession = (authUser, token) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(authUser));
    setUser(authUser);
  };

  const register = useCallback(async ({ name, email, password, phone }) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone }),
    });
    setSession(data.user, data.token);
    return data.user;
  }, []);

  const login = useCallback(async (payload) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setSession(data.user, data.token);
    return data.user;
  }, []);

  /**
   * Firebase Google Sign-In:
   * 1. Opens Google popup via Firebase
   * 2. Extracts the Google ID token from the Firebase credential
   * 3. Sends it to the backend /api/auth/google (no backend changes needed)
   * 4. Backend verifies the Google token and returns our app JWT
   */
  const loginWithGoogle = useCallback(async () => {
    // Open Google sign-in popup via Firebase
    const result = await signInWithPopup(auth, googleProvider);

    // Extract the Google OAuth credential (contains the Google ID token)
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.idToken) {
      throw new Error('Failed to get Google ID token. Please try again.');
    }

    // Send the Google ID token to our existing backend endpoint — no backend changes needed
    const data = await apiRequest('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential: credential.idToken }),
    });

    setSession(data.user, data.token);
    return data.user;
  }, []);

  const logout = async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('cart_items');
    setUser(null);
    // Sign out from Firebase so the popup works cleanly next time
    try { await firebaseSignOut(auth); } catch (_) {}
    window.location.href = '/';
  };

  const updateProfile = useCallback(async (payload) => {
    const data = await apiRequest('/auth/profile', {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    setUser(data.user);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    return data.user;
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token      = localStorage.getItem('auth_token');
        const cachedUser = localStorage.getItem('auth_user');
        if (!token || !cachedUser) { setLoading(false); return; }

        setUser(JSON.parse(cachedUser));
        const data = await apiRequest('/auth/me', { headers: getAuthHeaders() });
        setUser(data.user);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
      } catch (err) {
        console.warn('Auth bootstrap background check failed', err);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isLoggedIn: Boolean(user),
      register,
      login,
      loginWithGoogle,
      logout,
      updateProfile,
    }),
    [user, loading, register, login, loginWithGoogle, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
