import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Alert, Share, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Button, Card, IconButton, Row, Screen, Text } from '@/components/ui';
import { recordRows, recordShareText } from '@/lib/records';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';
import { SECTION_LABEL } from '@/lib/types';
import { unitName } from '@/lib/units';

export default function RecordDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const store = useStore();
  const { settings } = store.db;
  const record = store.db.records.find((r) => r.id === id);
  const customer = record ? store.db.customers.find((c) => c.id === record.customerId) : undefined;

  if (!record || !customer) {
    return (
      <Screen>
        <IconButton icon="back" label="Back" onPress={() => router.back()} />
        <Text muted>This record no longer exists.</Text>
      </Screen>
    );
  }

  const rows = recordRows(record, settings, settings.unit);
  const converted = record.unit !== settings.unit;

  const remove = () =>
    Alert.alert('Delete this measurement?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          store.deleteRecord(record.id);
          router.back();
        },
      },
    ]);

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between' }}>
        <IconButton icon="back" label="Back" onPress={() => router.back()} />
        <IconButton icon="edit" label="Edit measurement" onPress={() => router.push({ pathname: '/measure', params: { recordId: record.id } })} />
      </Row>
      <View style={{ gap: 6 }}>
        <Text size={13} muted>
          {customer.name} · {record.date}
        </Text>
        <Text size={28} weight="extrabold">
          {SECTION_LABEL[record.section]}
        </Text>
        {record.style ? (
          <View style={{ alignSelf: 'flex-start', backgroundColor: colors.soft, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text size={12} weight="bold" color={colors.primary}>
              {record.style}
            </Text>
          </View>
        ) : null}
      </View>
      <Card style={{ paddingVertical: 6, paddingHorizontal: 18 }}>
        {rows.map((r, i) => (
          <Row key={r.id} style={{ justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: colors.line }}>
            <Text muted>{r.name}</Text>
            <Text weight="bold">{r.text}</Text>
          </Row>
        ))}
      </Card>
      {record.note ? (
        <Card>
          <Text size={13} muted>
            Notes
          </Text>
          <Text>{record.note}</Text>
        </Card>
      ) : null}
      {converted ? (
        <Row style={{ alignItems: 'flex-start', backgroundColor: colors.soft, borderRadius: 16, padding: 14 }}>
          <Icon name="info" size={18} color={colors.primary} />
          <Text size={13} style={{ flex: 1, lineHeight: 19 }}>
            <Text size={13} weight="bold">
              Recorded in {unitName(record.unit)}
            </Text>
            , shown in {unitName(settings.unit)} because that is your unit setting.
          </Text>
        </Row>
      ) : null}
      <View style={{ gap: 10, marginTop: 6 }}>
        <Button
          title="Share as text (WhatsApp, SMS…)"
          icon="share"
          onPress={() => void Share.share({ message: recordShareText(customer, record, settings, settings.unit) })}
        />
        <Row>
          <Button title="Duplicate" icon="copy" variant="secondary" style={{ flex: 1 }} onPress={() => router.push({ pathname: '/measure', params: { from: record.id } })} />
          <Button title="Delete" icon="trash" variant="danger" style={{ flex: 1 }} onPress={remove} />
        </Row>
      </View>
    </Screen>
  );
}
