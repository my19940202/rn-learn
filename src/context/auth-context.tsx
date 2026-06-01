import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  fetchCurrentUser,
  loginApi,
  registerApi,
  type AuthUser,
} from '@/services/chat-api';
import * as secureStorage from '@/utils/secure-storage';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (nextUser: AuthUser) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function persistSession(token: string, user: AuthUser) {
  await secureStorage.setItem(TOKEN_KEY, token);
  await secureStorage.setItem(USER_KEY, JSON.stringify(user));
}

async function clearSession() {
  await secureStorage.deleteItem(TOKEN_KEY);
  await secureStorage.deleteItem(USER_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        const storedToken = await secureStorage.getItem(TOKEN_KEY);
        const storedUser = await secureStorage.getItem(USER_KEY);

        if (!storedToken) return;

        if (storedUser) {
          if (mounted) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser) as AuthUser);
          }
          return;
        }

        const currentUser = await fetchCurrentUser(storedToken);
        if (mounted) {
          setToken(storedToken);
          setUser(currentUser);
          await secureStorage.setItem(USER_KEY, JSON.stringify(currentUser));
        }
      } catch {
        await clearSession();
        if (mounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    restoreSession();
    return () => {
      mounted = false;
    };
  }, []);

  const applySession = useCallback(async (nextToken: string, nextUser: AuthUser) => {
    await persistSession(nextToken, nextUser);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await loginApi(email, password);
      await applySession(result.token, result.user);
    },
    [applySession],
  );

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      const result = await registerApi(email, password, name);
      await applySession(result.token, result.user);
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    await clearSession();
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    const currentUser = await fetchCurrentUser(token);
    await secureStorage.setItem(USER_KEY, JSON.stringify(currentUser));
    setUser(currentUser);
  }, [token]);

  const updateUser = useCallback(async (nextUser: AuthUser) => {
    if (!token) return;
    await secureStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      refreshUser,
      updateUser,
    }),
    [user, token, isLoading, login, register, logout, refreshUser, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
