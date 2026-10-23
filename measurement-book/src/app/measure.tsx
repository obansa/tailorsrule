import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Field, IconButton, Row, Segmented, Text } from '@/components/ui';
import { todayIso, uid } from '@/lib/defaults';
import { fieldsFor } from '@/lib/records';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';
import { Gender, MeasureRecord, SECTION_LABEL, Section, genderOf, partOf, sectionOf } from '@/lib/types';
import { convert, formatNumber, parseEntry, unitLabel, unitName } from '@/lib/units';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];
const validDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));

type Drafts = Record<string, Record<string, string>>;

export default function Measure() {
  const params = useLocalSearchParams<{ customerId?: string; gender?: Gender; recordId?: string; from?: string }>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const store = useStore();
  const { settings } = store.db;
  const unit = settings.unit;

  const source = store.db.records.find((r) => r.id === (params.recordId ?? params.from));
  const editing = params.recordId ? source : undefined;
  const customerId = source?.customerId ?? params.customerId ?? '';
  const customer = store.db.customers.find((c) => c.id === customerId);

  const sections: Section[] = source
    ? [source.section]
    : [sectionOf(params.gender === 'ladies' ? 'ladies' : 'men', 'top'), sectionOf(params.gender === 'ladies' ? 'ladies' : 'men', 'down')];

  const [section, setSection] = useState<Section>(sections[0]);
  const [date, setDate] = useState(editing?.date ?? todayIso());
  const [style, setStyle] = useState(source?.style ?? '');
  const [note, setNote] = useState(source?.note ?? '');
  const [metaFocus, setMetaFocus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Typed text per section/field. Values from an existing record are shown in the current unit.
  const [drafts, setDrafts] = useState<Drafts>(() => {
    const d: Drafts = {};
    if (source) {
      d[source.section] = Object.fromEntries(
        Object.entries(source.values).map(([id, v]) => [id, formatNumber(convert(v.value, source.unit, unit))]),
      );
    }
    return d;
  });
  const touched = useRef(new Set<string>());
  const fresh = useRef(true);

  const fields = useMemo(() => fieldsFor(section, settings, source?.section === section ? source : undefined), [section, settings, source]);
  const [active, setActive] = useState<string | null>(null);
  const activeId = active && fields.some((f) => f.id === active) ? active : (fields[0]?.id ?? null);
  const values = drafts[section] ?? {};

  const focus = (id: string) => {
    fresh.current = true;
    setActive(id);
  };

  const press = (k: string) => {
    if (!activeId) return;
    touched.current.add(`${section}|${activeId}`);
    setDrafts((d) => {
      const cur = fresh.current ? '' : (d[section]?.[activeId] ?? '');
      let next = cur;
      if (k === '⌫') next = fresh.current ? '' : cur.slice(0, -1);
      else if (k === '.') next = cur.includes('.') ? cur : (cur || '0') + '.';
      else if (cur.length < 6) next = cur === '0' ? k : cur + k;
      fresh.current = false;
      return { ...d, [section]: { ...d[section], [activeId]: next } };
    });
  };

  const move = (delta: number) => {
    const i = fields.findIndex((f) => f.id === activeId);
    const next = fields[i + delta];
    if (next) focus(next.id);
  };

  const save = () => {
    if (!customerId) return;
    if (!validDate(date)) {
      setError('Enter the date as yyyy-mm-dd, e.g. 2026-10-19.');
      return;
    }
    const now = Date.now();
    const out: MeasureRecord[] = [];
    for (const s of sections) {
      const defs = fieldsFor(s, settings, source?.section === s ? source : undefined);
      const vals: MeasureRecord['values'] = {};
      for (const f of defs) {
        const text = drafts[s]?.[f.id];
        const original = source?.section === s ? source.values[f.id] : undefined;
        if (text === undefined && !original) continue;
        if (!touched.current.has(`${s}|${f.id}`) && original) {
          // Untouched: keep the exact original, converted only if the unit setting changed.
          const v = source!.unit === unit ? original.value : Math.round(convert(original.value, source!.unit, unit) * 100) / 100;
          vals[f.id] = { name: f.name, value: v };
          continue;
        }
        const n = parseEntry(text ?? '');
        if (n !== null) vals[f.id] = { name: f.name, value: n };
      }
      if (Object.keys(vals).length === 0) continue;
      out.push({
        id: editing?.id ?? uid(),
        customerId,
        section: s,
        date,
        style: style.trim(),
        note: note.trim(),
        unit,
        values: vals,
        createdAt: editing?.createdAt ?? now,
        updatedAt: now,
      });
    }
    if (out.length === 0) {
      setError('Enter at least one measurement.');
      return;
    }
    store.saveRecords(out);
    router.back();
  };

  if (!customer) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, padding: 24, paddingTop: insets.top + 24 }}>
        <Text muted>Customer not found.</Text>
      </View>
    );
  }

  const isLast = fields.findIndex((f) => f.id === activeId) === fields.length - 1;
  const gender = genderOf(section);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 12 }}>
      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <IconButton icon="back" label="Back" onPress={() => router.back()} />
          <View style={{ alignItems: 'center' }}>
            <Text size={12} muted>
              {customer.name}
            </Text>
            <Text size={18} weight="extrabold">
              {sections.length > 1 ? `${gender === 'men' ? "Men's" : "Ladies'"} Measurements` : SECTION_LABEL[section]}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Save measurements"
            onPress={save}
            style={{ height: 44, paddingHorizontal: 16, borderRadius: 14, backgroundColor: colors.primary, justifyContent: 'center' }}
          >
            <Text weight="bold" color={colors.onPrimary}>
              Save
            </Text>
          </Pressable>
        </Row>
        {sections.length > 1 ? (
          <Segmented
            options={sections.map((s) => ({ value: s, label: partOf(s) === 'top' ? 'Top' : 'Down' }))}
            value={section}
            onChange={(s) => {
              setSection(s);
              setActive(null);
              fresh.current = true;
            }}
          />
        ) : null}
        <Row style={{ alignItems: 'stretch' }}>
          <View style={{ flex: 1 }}>
            <Field label="Date" value={date} onChangeText={setDate} onFocus={() => setMetaFocus(true)} onBlur={() => setMetaFocus(false)} placeholder="yyyy-mm-dd" keyboardType="numbers-and-punctuation" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Style" value={style} onChangeText={setStyle} onFocus={() => setMetaFocus(true)} onBlur={() => setMetaFocus(false)} placeholder="Agbada, Suit…" />
          </View>
          <View style={{ backgroundColor: colors.soft, borderRadius: 14, paddingHorizontal: 12, justifyContent: 'center' }}>
            <Text size={11} color={colors.primary}>
              Unit
            </Text>
            <Text size={14} weight="extrabold" color={colors.primary}>
              {unitLabel(unit)}
            </Text>
          </View>
        </Row>
        {error ? (
          <Text size={13} color={colors.danger}>
            {error}
          </Text>
        ) : null}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 12 }} keyboardShouldPersistTaps="handled">
        {fields.length === 0 ? (
          <Text muted>No fields are switched on for this section. Turn some on in Settings.</Text>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {fields.map((f) => {
              const on = f.id === activeId;
              const text = values[f.id];
              return (
                <Pressable
                  key={f.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${f.name}, ${text ? `${text} ${unitName(unit)}` : 'empty'}`}
                  onPress={() => focus(f.id)}
                  style={{
                    width: '48.8%',
                    height: 58,
                    borderRadius: 14,
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    backgroundColor: colors.surface,
                    borderWidth: on ? 2 : 1,
                    borderColor: on ? colors.primary : colors.line,
                  }}
                >
                  <Text size={12} muted numberOfLines={1}>
                    {f.name}
                  </Text>
                  <Text size={18} weight="extrabold">
                    {text || '—'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
        <Field label="Notes" value={note} onChangeText={setNote} onFocus={() => setMetaFocus(true)} onBlur={() => setMetaFocus(false)} multiline placeholder="Optional" style={{ minHeight: 64, textAlignVertical: 'top' }} />
      </ScrollView>

      {metaFocus ? null : (
        <View
          style={{
            backgroundColor: colors.surface,
            borderTopColor: colors.line,
            borderTopWidth: 1,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: Math.max(insets.bottom, 12) + 4,
            gap: 10,
          }}
        >
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {KEYS.map((k) => (
              <Pressable
                key={k}
                accessibilityRole="button"
                accessibilityLabel={k === '⌫' ? 'Delete' : k === '.' ? 'Decimal point' : k}
                onPress={() => press(k)}
                style={({ pressed }) => ({
                  width: '23.2%',
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: pressed ? colors.line : colors.surface2,
                  alignItems: 'center',
                  justifyContent: 'center',
                })}
              >
                <Text size={18} weight="bold">
                  {k}
                </Text>
              </Pressable>
            ))}
          </View>
          <Row>
            <Button title="Back" variant="secondary" height={48} style={{ flex: 1 }} onPress={() => move(-1)} />
            <Button title={isLast || fields.length === 0 ? 'Save' : 'Next field'} height={48} style={{ flex: 2 }} onPress={() => (isLast || fields.length === 0 ? save() : move(1))} />
          </Row>
        </View>
      )}
      {metaFocus ? (
        <View style={{ padding: 16, paddingBottom: Math.max(insets.bottom, 12) }}>
          <Button title="Save" onPress={save} />
        </View>
      ) : null}
    </View>
  );
}
