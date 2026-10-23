import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Linking, Pressable, Share, View } from 'react-native';

import { Icon, IconName } from '@/components/Icon';
import { Avatar, Button, Card, IconButton, Row, Screen, Text } from '@/components/ui';
import { recordSummary } from '@/lib/records';
import { useStore } from '@/lib/store';
import { SECTION_LABEL } from '@/lib/types';
import { useTheme } from '@/lib/theme';

export default function CustomerDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { db } = useStore();
  const customer = db.customers.find((c) => c.id === id);

  if (!customer) {
    return (
      <Screen>
        <IconButton icon="back" label="Back" onPress={() => router.back()} />
        <Text muted>This customer no longer exists.</Text>
      </Screen>
    );
  }

  const records = db.records
    .filter((r) => r.customerId === customer.id)
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
  const digits = customer.phone.replace(/[^\d+]/g, '');

  const actions: { label: string; icon: IconName; onPress: () => void }[] = [
    { label: 'Call', icon: 'phone', onPress: () => digits && void Linking.openURL(`tel:${digits}`) },
    { label: 'WhatsApp', icon: 'chat', onPress: () => digits && void Linking.openURL(`https://wa.me/${digits.replace('+', '')}`) },
    {
      label: 'Share',
      icon: 'share',
      onPress: () => void Share.share({ message: `${customer.name}${customer.phone ? ` · ${customer.phone}` : ''}` }),
    },
  ];

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between' }}>
        <IconButton icon="back" label="Back" onPress={() => router.back()} />
        <IconButton icon="edit" label="Edit customer" onPress={() => router.push({ pathname: '/customer/edit', params: { id: customer.id } })} />
      </Row>
      <View style={{ backgroundColor: colors.primary, borderRadius: 28, padding: 20, gap: 18 }}>
        <Row style={{ gap: 14 }}>
          <Avatar name={customer.name} size={60} inverse />
          <View style={{ flex: 1 }}>
            <Text size={22} weight="extrabold" color={colors.onPrimary}>
              {customer.name}
            </Text>
            <Text size={14} color={colors.onPrimary} style={{ opacity: 0.9 }}>
              {[customer.phone, customer.address].filter(Boolean).join(' · ') || 'No contact details'}
            </Text>
          </View>
        </Row>
        <Row>
          {actions.map((a) => (
            <Pressable
              key={a.label}
              accessibilityRole="button"
              accessibilityLabel={a.label}
              onPress={a.onPress}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 14,
                backgroundColor: 'rgba(255,255,255,0.18)',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 6,
              }}
            >
              <Icon name={a.icon} size={16} color={colors.onPrimary} />
              <Text size={13} weight="bold" color={colors.onPrimary}>
                {a.label}
              </Text>
            </Pressable>
          ))}
        </Row>
      </View>

      <Row style={{ justifyContent: 'space-between' }}>
        <Text size={18} weight="extrabold">
          Measurements
        </Text>
        <Text muted size={13}>
          {records.length} record{records.length === 1 ? '' : 's'}
        </Text>
      </Row>
      <Row>
        <Button title="+ Men" variant="ink" style={{ flex: 1 }} onPress={() => router.push({ pathname: '/measure', params: { customerId: customer.id, gender: 'men' } })} />
        <Button title="+ Ladies" variant="secondary" style={{ flex: 1 }} onPress={() => router.push({ pathname: '/measure', params: { customerId: customer.id, gender: 'ladies' } })} />
      </Row>

      {records.length === 0 ? (
        <Card>
          <Text muted>No measurements yet. Tap “+ Men” or “+ Ladies”.</Text>
        </Card>
      ) : (
        records.map((r) => (
          <Pressable key={r.id} accessibilityRole="button" onPress={() => router.push({ pathname: '/record/[id]', params: { id: r.id } })}>
            <Card style={{ gap: 6 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Text weight="bold" size={16}>
                  {SECTION_LABEL[r.section]}
                </Text>
                {r.style ? (
                  <View style={{ backgroundColor: colors.soft, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text size={12} weight="semibold" color={colors.primary}>
                      {r.style}
                    </Text>
                  </View>
                ) : null}
              </Row>
              <Text muted size={13}>
                {r.date}
              </Text>
              <Text size={13}>{recordSummary(r, db.settings, db.settings.unit)}</Text>
            </Card>
          </Pressable>
        ))
      )}

      {customer.notes ? (
        <View style={{ backgroundColor: colors.soft, borderRadius: 16, padding: 14 }}>
          <Text size={13} style={{ lineHeight: 19 }}>
            <Text size={13} weight="bold">
              Notes:{' '}
            </Text>
            {customer.notes}
          </Text>
        </View>
      ) : null}
    </Screen>
  );
}
