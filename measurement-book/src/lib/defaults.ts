import type { Db, FieldDef, Section, Settings } from './types';

const NAMES: Record<Section, string[]> = {
  men_top: ['Shoulder line', 'Sleeve', 'Arm', 'Neck', 'Chest', 'Nipple to nipple', 'Shape', 'Half cut', 'Top length'],
  men_down: ['Waist', 'Laps', 'Knees', 'Half length', 'Base', 'Down length'],
  ladies_top: ['Shoulder line', 'Sleeve', 'Arm', 'Neck', 'Breast point', 'Under bust', 'Shape', 'Half cut', 'Top length'],
  ladies_down: ['Gown length', 'Waist', 'Hips', 'Laps', 'Knees', 'Half length', 'Base', 'Down length'],
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_');

export function defaultFields(): FieldDef[] {
  return (Object.keys(NAMES) as Section[]).flatMap((section) =>
    NAMES[section].map((name) => ({ id: `${section}.${slug(name)}`, name, section, enabled: true })),
  );
}

export function defaultSettings(): Settings {
  return { unit: 'in', fields: defaultFields() };
}

export function emptyDb(): Db {
  return { version: 1, ownerId: null, updatedAt: 0, settings: defaultSettings(), customers: [], records: [] };
}

export function isDb(x: unknown): x is Db {
  const d = x as Db;
  return (
    !!d &&
    d.version === 1 &&
    Array.isArray(d.customers) &&
    Array.isArray(d.records) &&
    !!d.settings &&
    Array.isArray(d.settings.fields) &&
    (d.settings.unit === 'in' || d.settings.unit === 'cm')
  );
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
export const todayIso = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};
