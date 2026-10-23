import React, { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Button, Card, Chip, Field, Row, Screen, Segmented, Switch, Text } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { BackupStatus, useBackup } from '@/lib/backup';
import { uid } from '@/lib/defaults';
import { useStore } from '@/lib/store';
import { ThemePref, useTheme } from '@/lib/theme';
import { SECTIONS, SECTION_LABEL, Section, Unit } from '@/lib/types';

const STATUS_TEXT: Record<BackupStatus, string> = {
  off: 'Automatic backup is off',
  idle: 'Saves after every change',
  syncing: 'Backing up…',
  pending: 'Waiting for internet — will back up automatically',
  error: 'Last backup failed — will retry',
};

function when(ts: number | null) {
  if (!ts) return 'Not backed up yet';
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, '0');
  return `Last backup ${d.toLocaleDateString()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function Settings() {
  const { colors, pref, setPref } = useTheme();
  const { user, signOut } = useAuth();
  const store = useStore();
  const backup = useBackup();
  const { settings } = store.db;
  const [section, setSection] = useState<Section>('men_top');
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);

  const fields = settings.fields.filter((f) => f.section === section);

  const toggle = (id: string, enabled: boolean) =>
    store.setFields(settings.fields.map((f) => (f.id === id ? { ...f, enabled } : f)));

  const addField = () => {
    const name = newName.trim();
    if (!name) return;
    if (fields.some((f) => f.name.toLowerCase() === name.toLowerCase())) {
      Alert.alert('Already there', `${name} is already in ${SECTION_LABEL[section]}.`);
      return;
    }
    store.setFields([...settings.fields, { id: `${section}.custom_${uid()}`, name, section, enabled: true, custom: true }]);
    setNewName('');
  };

  const removeField = (id: string, name: string) =>
    Alert.alert('Remove field?', `${name} will no longer be offered. Saved records keep their values.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => store.setFields(settings.fields.filter((f) => f.id !== id)) },
    ]);

  const restore = () =>
    Alert.alert('Restore from Google Drive?', 'This replaces the measurements on this phone with your latest backup.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Restore',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          const r = await backup.restoreNow();
          setBusy(false);
          Alert.alert(
            r === 'restored' ? 'Restored' : r === 'none' ? 'No backup found' : 'Could not restore',
            r === 'restored' ? 'Your measurements were loaded from Google Drive.' : r === 'none' ? 'There is no backup in your Google Drive yet.' : 'Check your connection and try again.',
          );
        },
      },
    ]);

  const backupNow = async () => {
    setBusy(true);
    const ok = await backup.backupNow();
    setBusy(false);
    if (!ok) Alert.alert('Backup not completed', 'It will retry automatically when the connection is back.');
  };

  return (
    <Screen bottom={110}>
      <Text size={30} weight="extrabold">
        Settings
      </Text>

      <Card style={{ gap: 10 }}>
        <Text weight="bold">Appearance</Text>
        <Segmented<ThemePref>
          options={[
            { value: 'system', label: 'System' },
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
          value={pref}
          onChange={setPref}
        />
      </Card>

      <Card style={{ gap: 10 }}>
        <Text weight="bold">Unit of measurement</Text>
        <Segmented<Unit>
          options={[
            { value: 'in', label: 'Inches' },
            { value: 'cm', label: 'Centimetres' },
          ]}
          value={settings.unit}
          onChange={store.setUnit}
        />
        <Text size={12} muted style={{ lineHeight: 17 }}>
          Saved records are converted when displayed. The numbers you entered are never changed.
        </Text>
      </Card>

      <Card style={{ gap: 10 }}>
        <Text weight="bold">My measurement fields</Text>
        <Row style={{ flexWrap: 'wrap', gap: 6 }}>
          {SECTIONS.map((s) => (
            <Chip key={s} label={SECTION_LABEL[s]} active={s === section} onPress={() => setSection(s)} />
          ))}
        </Row>
        {fields.map((f) => (
          <Row key={f.id} style={{ justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 8 }}>
            <Row style={{ flex: 1 }}>
              <Text style={{ flexShrink: 1 }}>{f.name}</Text>
              {f.custom ? (
                <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${f.name}`} onPress={() => removeField(f.id, f.name)} hitSlop={10}>
                  <Icon name="trash" size={16} color={colors.muted} />
                </Pressable>
              ) : null}
            </Row>
            <Switch label={`Show ${f.name}`} value={f.enabled} onChange={(v) => toggle(f.id, v)} />
          </Row>
        ))}
        <Row style={{ alignItems: 'flex-end' }}>
          <View style={{ flex: 1 }}>
            <Field label="Add your own field" value={newName} onChangeText={setNewName} placeholder="e.g. Lapel width" onSubmitEditing={addField} returnKeyType="done" />
          </View>
          <Button title="Add" variant="soft" height={48} onPress={addField} />
        </Row>
      </Card>

      <Card style={{ gap: 12 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text weight="bold">Auto backup to Google Drive</Text>
            <Text size={12} muted style={{ lineHeight: 17 }}>
              {STATUS_TEXT[backup.status]}
            </Text>
            <Text size={12} muted>
              {when(backup.lastBackupAt)}
            </Text>
          </View>
          <Switch label="Automatic Google Drive backup" value={backup.enabled} onChange={backup.setEnabled} />
        </Row>
        <Row>
          <Button title="Back up now" height={44} style={{ flex: 1 }} disabled={busy} onPress={() => void backupNow()} />
          <Button title="Restore" variant="secondary" height={44} style={{ flex: 1 }} disabled={busy} onPress={restore} />
        </Row>
      </Card>

      <Card style={{ gap: 10 }}>
        <Text weight="bold">Account</Text>
        <Text muted size={13}>
          {user?.email}
        </Text>
        <Button title="Sign out" variant="danger" height={44} onPress={() => void signOut()} />
      </Card>
    </Screen>
  );
}
