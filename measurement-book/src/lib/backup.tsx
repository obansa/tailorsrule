import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { useAuth } from './auth';
import { emptyDb } from './defaults';
import { downloadBackup, findBackupId, uploadBackup } from './drive';
import { useStore } from './store';

const META_KEY = 'mb.backup.meta';

export type BackupStatus = 'off' | 'idle' | 'syncing' | 'pending' | 'error';
/** running: first sync after sign-in; failed: it could not finish; done: ready to use. */
export type InitialSync = 'waiting' | 'running' | 'failed' | 'done';

interface Meta {
  enabled: boolean;
  lastBackupAt: number | null;
  /** `db.updatedAt` of the newest data known to be in Drive. */
  uploadedUpdatedAt: number;
  fileId: string | null;
}

const DEFAULT_META: Meta = { enabled: true, lastBackupAt: null, uploadedUpdatedAt: -1, fileId: null };

interface Ctx {
  status: BackupStatus;
  enabled: boolean;
  lastBackupAt: number | null;
  initial: InitialSync;
  /** Initial sync failed and local data belongs to a different account, so continuing could overwrite the backup. */
  blocked: boolean;
  setEnabled: (v: boolean) => void;
  backupNow: () => Promise<boolean>;
  restoreNow: () => Promise<'restored' | 'none' | 'failed'>;
  retryInitial: () => void;
}

const BackupCtx = createContext<Ctx | null>(null);

export function BackupProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const store = useStore();
  const storeRef = useRef(store);
  storeRef.current = store;

  const [metaLoaded, setMetaLoaded] = useState(false);
  const [meta, setMeta] = useState<Meta>(DEFAULT_META);
  const metaRef = useRef(meta);
  metaRef.current = meta;

  const [status, setStatus] = useState<BackupStatus>('idle');
  // Tagged with the account it ran for, so a previous account's result is never reused after switching users.
  const [sync, setSync] = useState<{ uid: string; state: 'running' | 'failed' | 'done'; blocked: boolean } | null>(null);
  const initial: InitialSync = user && sync?.uid === user.id ? sync.state : 'waiting';
  const blocked = user && sync?.uid === user.id ? sync.blocked : false;
  const [attempt, setAttempt] = useState(0);
  const inFlight = useRef(false);

  const patchMeta = useCallback((p: Partial<Meta>) => {
    const next = { ...metaRef.current, ...p };
    metaRef.current = next;
    setMeta(next);
    AsyncStorage.setItem(META_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(META_KEY)
      .then((raw) => {
        if (raw) {
          const m = { ...DEFAULT_META, ...(JSON.parse(raw) as Partial<Meta>) };
          metaRef.current = m;
          setMeta(m);
        }
      })
      .catch(() => {})
      .finally(() => setMetaLoaded(true));
  }, []);

  // First sync after sign-in: load the Drive backup, or push local data if it is newer.
  useEffect(() => {
    if (!user || !store.ready || !metaLoaded) return;
    let cancelled = false;
    (async () => {
      setSync({ uid: user.id, state: 'running', blocked: false });
      let local = storeRef.current.db;
      const otherAccount = local.ownerId !== null && local.ownerId !== user.id;
      try {
        if (otherAccount) {
          storeRef.current.resetFor(user.id);
          local = { ...emptyDb(), ownerId: user.id };
          patchMeta({ fileId: null, uploadedUpdatedAt: -1, lastBackupAt: null });
        }
        const id = await findBackupId();
        if (cancelled) return;
        patchMeta({ fileId: id });
        if (id) {
          const remote = await downloadBackup(id);
          if (cancelled) return;
          if (remote.updatedAt >= local.updatedAt) {
            storeRef.current.replaceDb({ ...remote, ownerId: user.id });
            patchMeta({ uploadedUpdatedAt: remote.updatedAt });
          } else {
            storeRef.current.claim(user.id);
          }
        } else {
          storeRef.current.claim(user.id);
        }
        setSync({ uid: user.id, state: 'done', blocked: false });
      } catch {
        if (cancelled) return;
        const mustWait = local.ownerId !== user.id || otherAccount;
        setSync({ uid: user.id, state: mustWait ? 'failed' : 'done', blocked: mustWait });
        if (!mustWait) setStatus('pending');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, store.ready, metaLoaded, attempt, patchMeta]);

  const flush = useCallback(async (): Promise<boolean> => {
    if (!user || !metaRef.current.enabled || inFlight.current) return false;
    const net = await NetInfo.fetch();
    if (!net.isConnected || net.isInternetReachable === false) {
      setStatus('pending');
      return false;
    }
    inFlight.current = true;
    setStatus('syncing');
    try {
      for (;;) {
        const snapshot = storeRef.current.db;
        const fileId = await uploadBackup(snapshot, metaRef.current.fileId);
        patchMeta({ fileId, uploadedUpdatedAt: snapshot.updatedAt, lastBackupAt: Date.now() });
        // Edits made during the upload need another pass.
        if (storeRef.current.db.updatedAt === snapshot.updatedAt) break;
      }
      setStatus('idle');
      return true;
    } catch {
      setStatus('error');
      return false;
    } finally {
      inFlight.current = false;
    }
  }, [user, patchMeta]);

  // Auto backup: shortly after every change.
  useEffect(() => {
    if (!user || initial !== 'done' || !meta.enabled) return;
    if (store.db.updatedAt === meta.uploadedUpdatedAt) return;
    const t = setTimeout(() => void flush(), 1500);
    return () => clearTimeout(t);
  }, [user, initial, meta.enabled, meta.uploadedUpdatedAt, store.db.updatedAt, flush]);

  // Retry when the internet returns or the app comes back to the foreground.
  useEffect(() => {
    if (!user || initial !== 'done') return;
    const retry = () => {
      const m = metaRef.current;
      if (m.enabled && storeRef.current.db.updatedAt !== m.uploadedUpdatedAt) void flush();
    };
    const unsubNet = NetInfo.addEventListener((s) => {
      if (s.isConnected) retry();
    });
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') retry();
    });
    return () => {
      unsubNet();
      sub.remove();
    };
  }, [user, initial, flush]);

  const setEnabled = useCallback(
    (v: boolean) => {
      patchMeta({ enabled: v });
      setStatus(v ? 'idle' : 'off');
      if (v) void flush();
    },
    [patchMeta, flush],
  );

  const backupNow = useCallback(async () => {
    patchMeta({ uploadedUpdatedAt: -1 });
    return flush();
  }, [patchMeta, flush]);

  const restoreNow = useCallback(async () => {
    if (!user) return 'failed' as const;
    try {
      const id = await findBackupId();
      if (!id) return 'none' as const;
      const remote = await downloadBackup(id);
      storeRef.current.replaceDb({ ...remote, ownerId: user.id });
      patchMeta({ fileId: id, uploadedUpdatedAt: remote.updatedAt });
      return 'restored' as const;
    } catch {
      return 'failed' as const;
    }
  }, [user, patchMeta]);

  const value = useMemo<Ctx>(
    () => ({
      status: meta.enabled ? status : 'off',
      enabled: meta.enabled,
      lastBackupAt: meta.lastBackupAt,
      initial,
      blocked,
      setEnabled,
      backupNow,
      restoreNow,
      retryInitial: () => setAttempt((n) => n + 1),
    }),
    [meta.enabled, meta.lastBackupAt, status, initial, blocked, setEnabled, backupNow, restoreNow],
  );

  return <BackupCtx.Provider value={value}>{children}</BackupCtx.Provider>;
}

export function useBackup(): Ctx {
  const v = useContext(BackupCtx);
  if (!v) throw new Error('useBackup outside BackupProvider');
  return v;
}
