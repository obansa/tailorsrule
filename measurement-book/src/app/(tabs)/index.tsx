import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { Avatar, Card, Chip, Row, Screen, Text } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';

type Sort = 'az' | 'recent';

export default function Customers() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { db } = useStore();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<Sort>('az');

  const rows = useMemo(() => {
    const last = new Map<string, string>();
    for (const r of db.records) {
      const prev = last.get(r.customerId);
      if (!prev || r.date > prev) last.set(r.customerId, r.date);
    }
    const needle = q.trim().toLowerCase();
    const list = db.customers
      .filter((c) => !needle || c.name.toLowerCase().includes(needle) || c.phone.replace(/\s/g, '').includes(needle.replace(/\s/g, '')))
      .map((c) => ({ c, last: last.get(c.id) ?? null }));
    list.sort((a, b) =>
      sort === 'az'
        ? a.c.name.localeCompare(b.c.name)
        : (b.last ?? '').localeCompare(a.last ?? '') || b.c.createdAt - a.c.createdAt,
    );
    return list;
  }, [db.customers, db.records, q, sort]);

  const first = user?.name?.split(' ')[0];
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Screen bottom={170}>
        <Row style={{ justifyContent: 'space-between' }}>
          <View>
            <Text muted size={14}>
              {first ? `Hello, ${first}` : 'Hello'}
            </Text>
            <Text size={30} weight="extrabold">
              Customers
            </Text>
          </View>
          <Avatar name={user?.name ?? user?.email ?? ''} size={46} />
        </Row>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            backgroundColor: colors.surface,
            borderColor: colors.line,
            borderWidth: 1,
            borderRadius: 16,
            paddingHorizontal: 16,
            height: 50,
          }}
        >
          <Icon name="search" size={20} color={colors.muted} />
          <TextInput
            accessibilityLabel="Search customers"
            value={q}
            onChangeText={setQ}
            placeholder="Search name or phone"
            placeholderTextColor={colors.muted}
            style={{ flex: 1, color: colors.ink, fontFamily: 'PlusJakartaSans_500Medium', fontSize: 15 }}
          />
        </View>
        <Row>
          <Chip label={`A–Z · ${db.customers.length}`} active={sort === 'az'} onPress={() => setSort('az')} />
          <Chip label="Recent" active={sort === 'recent'} onPress={() => setSort('recent')} />
        </Row>
        {rows.length === 0 ? (
          <Card>
            <Text weight="bold">{db.customers.length ? 'No match' : 'No customers yet'}</Text>
            <Text muted size={13} style={{ marginTop: 4 }}>
              {db.customers.length ? 'Try another name or number.' : 'Tap “New customer” to add your first one.'}
            </Text>
          </Card>
        ) : (
          rows.map(({ c, last }) => (
            <Pressable key={c.id} accessibilityRole="button" onPress={() => router.push({ pathname: '/customer/[id]', params: { id: c.id } })}>
              <Card>
                <Row style={{ gap: 14 }}>
                  <Avatar name={c.name} />
                  <View style={{ flex: 1 }}>
                    <Text weight="bold" size={16}>
                      {c.name}
                    </Text>
                    <Text muted size={13}>
                      {c.phone || 'No phone'}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text muted size={11}>
                      Last fitting
                    </Text>
                    <Text weight="bold" size={13}>
                      {last ?? '—'}
                    </Text>
                  </View>
                </Row>
              </Card>
            </Pressable>
          ))
        )}
      </Screen>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="New customer"
        onPress={() => router.push('/customer/edit')}
        style={{
          position: 'absolute',
          right: 20,
          bottom: Math.max(insets.bottom, 12) + 64 + 16,
          height: 56,
          borderRadius: 20,
          paddingHorizontal: 22,
          backgroundColor: colors.primary,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          elevation: 6,
        }}
      >
        <Icon name="plus" size={20} color={colors.onPrimary} />
        <Text weight="bold" color={colors.onPrimary}>
          New customer
        </Text>
      </Pressable>
    </View>
  );
}
