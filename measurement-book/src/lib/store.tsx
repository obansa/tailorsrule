import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';

import { emptyDb, isDb, uid } from './defaults';
import type { Customer, Db, FieldDef, MeasureRecord, Unit } from './types';

const KEY = 'mb.db.v1';

type Action =
  | { type: 'load'; db: Db }
  | { type: 'replace'; db: Db }
  | { type: 'reset'; ownerId: string | null }
  | { type: 'claim'; ownerId: string }
  | { type: 'saveCustomer'; customer: Customer }
  | { type: 'deleteCustomer'; id: string }
  | { type: 'saveRecords'; records: MeasureRecord[] }
  | { type: 'deleteRecord'; id: string }
  | { type: 'setUnit'; unit: Unit }
  | { type: 'setFields'; fields: FieldDef[] };

const touch = (db: Db): Db => ({ ...db, updatedAt: Date.now() });

function reducer(db: Db, a: Action): Db {
  switch (a.type) {
    case 'load':
    case 'replace':
      return a.db;
    case 'reset':
      return { ...emptyDb(), ownerId: a.ownerId };
    case 'claim':
      // Claiming does not change content, so it must not look like a newer edit.
      return { ...db, ownerId: a.ownerId };
    case 'saveCustomer': {
      const exists = db.customers.some((c) => c.id === a.customer.id);
      const customers = exists
        ? db.customers.map((c) => (c.id === a.customer.id ? a.customer : c))
        : [...db.customers, a.customer];
      return touch({ ...db, customers });
    }
    case 'deleteCustomer':
      return touch({
        ...db,
        customers: db.customers.filter((c) => c.id !== a.id),
        records: db.records.filter((r) => r.customerId !== a.id),
      });
    case 'saveRecords': {
      const ids = new Set(a.records.map((r) => r.id));
      return touch({ ...db, records: [...db.records.filter((r) => !ids.has(r.id)), ...a.records] });
    }
    case 'deleteRecord':
      return touch({ ...db, records: db.records.filter((r) => r.id !== a.id) });
    case 'setUnit':
      return touch({ ...db, settings: { ...db.settings, unit: a.unit } });
    case 'setFields':
      return touch({ ...db, settings: { ...db.settings, fields: a.fields } });
  }
}

interface Ctx {
  db: Db;
  ready: boolean;
  saveCustomer: (c: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => string;
  deleteCustomer: (id: string) => void;
  saveRecords: (records: MeasureRecord[]) => void;
  deleteRecord: (id: string) => void;
  setUnit: (u: Unit) => void;
  setFields: (f: FieldDef[]) => void;
  replaceDb: (db: Db) => void;
  resetFor: (ownerId: string | null) => void;
  claim: (ownerId: string) => void;
}

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [db, dispatch] = useReducer(reducer, undefined, emptyDb);
  const [ready, setReady] = React.useState(false);
  const dbRef = useRef(db);
  useEffect(() => {
    dbRef.current = db;
  }, [db]);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!raw) return;
        const parsed: unknown = JSON.parse(raw);
        if (isDb(parsed)) dispatch({ type: 'load', db: parsed });
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => {
      AsyncStorage.setItem(KEY, JSON.stringify(db)).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [db, ready]);

  const saveCustomer = useCallback<Ctx['saveCustomer']>((c) => {
    const now = Date.now();
    const existing = c.id ? dbRef.current.customers.find((x) => x.id === c.id) : undefined;
    const customer: Customer = {
      id: existing?.id ?? uid(),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      name: c.name,
      phone: c.phone,
      address: c.address,
      notes: c.notes,
    };
    dispatch({ type: 'saveCustomer', customer });
    return customer.id;
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      db,
      ready,
      saveCustomer,
      deleteCustomer: (id) => dispatch({ type: 'deleteCustomer', id }),
      saveRecords: (records) => dispatch({ type: 'saveRecords', records }),
      deleteRecord: (id) => dispatch({ type: 'deleteRecord', id }),
      setUnit: (unit) => dispatch({ type: 'setUnit', unit }),
      setFields: (fields) => dispatch({ type: 'setFields', fields }),
      replaceDb: (next) => dispatch({ type: 'replace', db: next }),
      resetFor: (ownerId) => dispatch({ type: 'reset', ownerId }),
      claim: (ownerId) => dispatch({ type: 'claim', ownerId }),
    }),
    [db, ready, saveCustomer],
  );

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore(): Ctx {
  const v = useContext(StoreCtx);
  if (!v) throw new Error('useStore outside StoreProvider');
  return v;
}
