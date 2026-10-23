export type Unit = 'in' | 'cm';
export type Gender = 'men' | 'ladies';
export type Part = 'top' | 'down';
export type Section = 'men_top' | 'men_down' | 'ladies_top' | 'ladies_down';

export interface FieldDef {
  id: string;
  name: string;
  section: Section;
  enabled: boolean;
  custom?: boolean;
}

export interface Settings {
  unit: Unit;
  fields: FieldDef[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

/** A value keeps the field name it was recorded under, so renaming or removing a field never loses data. */
export interface RecordValue {
  name: string;
  value: number;
}

export interface MeasureRecord {
  id: string;
  customerId: string;
  section: Section;
  /** yyyy-mm-dd */
  date: string;
  style: string;
  note: string;
  /** Unit the numbers in `values` were entered in. Display converts to the current setting. */
  unit: Unit;
  values: Record<string, RecordValue>;
  createdAt: number;
  updatedAt: number;
}

export interface Db {
  version: 1;
  /** Google account id this data belongs to. */
  ownerId: string | null;
  updatedAt: number;
  settings: Settings;
  customers: Customer[];
  records: MeasureRecord[];
}

export const SECTIONS: Section[] = ['men_top', 'men_down', 'ladies_top', 'ladies_down'];

export const SECTION_LABEL: Record<Section, string> = {
  men_top: "Men's Top",
  men_down: "Men's Down",
  ladies_top: "Ladies' Top",
  ladies_down: "Ladies' Down",
};

export const sectionOf = (gender: Gender, part: Part): Section => `${gender}_${part}` as Section;
export const genderOf = (s: Section): Gender => (s.startsWith('men') ? 'men' : 'ladies');
export const partOf = (s: Section): Part => (s.endsWith('top') ? 'top' : 'down');
