import { display, unitLabel } from './units';
import type { Customer, FieldDef, MeasureRecord, Section, Settings, Unit } from './types';
import { SECTION_LABEL } from './types';

/** Fields to show for a section: the enabled ones, plus any disabled/removed ones the record already holds values for. */
export function fieldsFor(section: Section, settings: Settings, record?: MeasureRecord): { id: string; name: string }[] {
  const enabled = settings.fields.filter((f) => f.section === section && f.enabled).map((f) => ({ id: f.id, name: f.name }));
  if (!record) return enabled;
  const seen = new Set(enabled.map((f) => f.id));
  const extra = Object.entries(record.values)
    .filter(([id]) => !seen.has(id))
    .map(([id, v]) => ({ id, name: v.name }));
  return [...enabled, ...extra];
}

/** Ordered rows of a record as display text in the user's current unit. */
export function recordRows(record: MeasureRecord, settings: Settings, unit: Unit) {
  return fieldsFor(record.section, settings, record)
    .filter((f) => record.values[f.id])
    .map((f) => ({
      id: f.id,
      name: f.name,
      text: `${display(record.values[f.id].value, record.unit, unit)} ${unitLabel(unit)}`,
    }));
}

export function recordSummary(record: MeasureRecord, settings: Settings, unit: Unit, max = 4): string {
  const rows = recordRows(record, settings, unit);
  const head = rows.slice(0, max).map((r) => `${r.name} ${r.text.replace(` ${unitLabel(unit)}`, '')}`);
  const more = rows.length > max ? ` +${rows.length - max} more` : '';
  return head.join(' · ') + more;
}

export function recordShareText(customer: Customer, record: MeasureRecord, settings: Settings, unit: Unit): string {
  const lines = recordRows(record, settings, unit).map((r) => `${r.name}: ${r.text}`);
  const title = `${SECTION_LABEL[record.section]}${record.style ? ` — ${record.style}` : ''}`;
  return [`${customer.name}`, `${title} (${record.date})`, '', ...lines, record.note ? `\n${record.note}` : ''].join('\n').trim();
}

export const fieldOrder = (fields: FieldDef[], section: Section) => fields.filter((f) => f.section === section);
