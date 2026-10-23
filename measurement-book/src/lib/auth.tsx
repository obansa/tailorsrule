import { GoogleSignin, isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

import { DRIVE_SCOPE } from './drive';

export interface AuthUser {
  id: string;
  name: string | null;
  email: string;
  photo: string | null;
}

interface Ctx {
  user: AuthUser | null;
  /** True while the saved Google session is being checked at launch. */
  loading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthCtx = createContext<Ctx | null>(null);

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  scopes: [DRIVE_SCOPE],
});

const toUser = (u: { id: string; name: string | null; email: string; photo: string | null }): AuthUser => ({
  id: u.id,
  name: u.name,
  email: u.email,
  photo: u.photo,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (GoogleSignin.hasPreviousSignIn()) {
          const res = await GoogleSignin.signInSilently();
          if (res.type === 'success') setUser(toUser(res.data.user));
        }
      } catch {
        // No saved session: show the sign-in screen.
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = useCallback(async () => {
    setError(null);
    try {
      if (Platform.OS === 'android') await GoogleSignin.hasPlayServices();
      const res = await GoogleSignin.signIn();
      if (res.type === 'success') setUser(toUser(res.data.user));
    } catch (e) {
      if (isErrorWithCode(e) && e.code === statusCodes.SIGN_IN_CANCELLED) return;
      setError('Could not sign in with Google. Check your connection and try again.');
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await GoogleSignin.signOut();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(() => ({ user, loading, error, signIn, signOut }), [user, loading, error, signIn, signOut]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth(): Ctx {
  const v = useContext(AuthCtx);
  if (!v) throw new Error('useAuth outside AuthProvider');
  return v;
}
