import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, View } from 'react-native';

import { Button, Field, Screen, Text } from '@/components/ui';
import { useStore } from '@/lib/store';

export default function EditCustomer() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const store = useStore();
  const existing = id ? store.db.customers.find((c) => c.id === id) : undefined;
  const [name, setName] = useState(existing?.name ?? '');
  const [phone, setPhone] = useState(existing?.phone ?? '');
  const [address, setAddress] = useState(existing?.address ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [showError, setShowError] = useState(false);

  const save = () => {
    if (!name.trim()) {
      setShowError(true);
      return;
    }
    const savedId = store.saveCustomer({
      id: existing?.id,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      notes: notes.trim(),
    });
    if (existing) router.back();
    else router.replace({ pathname: '/customer/[id]', params: { id: savedId } });
  };

  const remove = () => {
    if (!existing) return;
    Alert.alert('Delete customer?', `${existing.name} and all their measurements will be deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          store.deleteCustomer(existing.id);
          router.dismissAll();
        },
      },
    ]);
  };

  return (
    <Screen>
      <Text size={26} weight="extrabold">
        {existing ? 'Edit customer' : 'New customer'}
      </Text>
      <Field label="Name *" value={name} onChangeText={setName} autoCapitalize="words" placeholder="Full name" />
      {showError && !name.trim() ? (
        <Text size={12} color="#C62F3E">
          Name is required.
        </Text>
      ) : null}
      <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="0803 000 0000" />
      <Field label="Address" value={address} onChangeText={setAddress} placeholder="Optional" />
      <Field
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        multiline
        placeholder="Fit preferences, posture, events…"
        style={{ minHeight: 90, textAlignVertical: 'top' }}
      />
      <View style={{ gap: 10, marginTop: 6 }}>
        <Button title="Save" onPress={save} />
        <Button title="Cancel" variant="secondary" onPress={() => router.back()} />
        {existing ? <Button title="Delete customer" variant="danger" onPress={remove} /> : null}
      </View>
    </Screen>
  );
}
