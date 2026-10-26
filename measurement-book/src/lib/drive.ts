import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { isDb } from './defaults';
import type { Db } from './types';

/** Stored in the app's private appDataFolder, invisible in the user's normal Drive. */
export const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const FILE_NAME = 'measurement-book-backup.json';
const API = 'https://www.googleapis.com/drive/v3';
const UPLOAD = 'https://www.googleapis.com/upload/drive/v3';

export class DriveError extends Error {
  status: number;
  constructor(status: number, detail = '') {
    super(`Google Drive request failed (${status})${detail ? `: ${detail}` : ''}`);
    this.status = status;
  }
}

/** Google's JSON error body carries the useful reason, e.g. "Google Drive API has not been used in project…". */
async function errorDetail(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: { message?: string } };
    return body.error?.message ?? '';
  } catch {
    return '';
  }
}

async function authFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const call = async (token: string) =>
    fetch(url, { ...init, headers: { ...(init.headers as Record<string, string>), Authorization: `Bearer ${token}` } });

  let { accessToken } = await GoogleSignin.getTokens();
  let res = await call(accessToken);
  if (res.status === 401) {
    await GoogleSignin.clearCachedAccessToken(accessToken);
    ({ accessToken } = await GoogleSignin.getTokens());
    res = await call(accessToken);
  }
  if (!res.ok) throw new DriveError(res.status, await errorDetail(res));
  return res;
}

export function buildMultipart(boundary: string, metadata: object, json: string): string {
  return (
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${json}\r\n` +
    `--${boundary}--`
  );
}

export async function findBackupId(): Promise<string | null> {
  const q = encodeURIComponent(`name='${FILE_NAME}'`);
  const res = await authFetch(`${API}/files?spaces=appDataFolder&q=${q}&fields=files(id)&pageSize=1`);
  const body = (await res.json()) as { files?: { id: string }[] };
  return body.files?.[0]?.id ?? null;
}

export async function downloadBackup(id: string): Promise<Db> {
  const res = await authFetch(`${API}/files/${id}?alt=media`);
  const parsed: unknown = await res.json();
  if (!isDb(parsed)) throw new Error('Backup file is not a valid measurement book');
  return parsed;
}

/** Creates the backup file, or replaces its content when `id` is known. Returns the file id. */
export async function uploadBackup(db: Db, id: string | null): Promise<string> {
  const json = JSON.stringify(db);
  if (id) {
    await authFetch(`${UPLOAD}/files/${id}?uploadType=media`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: json,
    });
    return id;
  }
  const boundary = `mb${Date.now().toString(36)}`;
  const res = await authFetch(`${UPLOAD}/files?uploadType=multipart&fields=id`, {
    method: 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
    body: buildMultipart(boundary, { name: FILE_NAME, parents: ['appDataFolder'] }, json),
  });
  return ((await res.json()) as { id: string }).id;
}
