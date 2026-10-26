import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Button, Loading, Text } from '@/components/ui';
import { AuthProvider, useAuth } from '@/lib/auth';
import { BackupProvider, useBackup } from '@/lib/backup';
import { StoreProvider, useStore } from '@/lib/store';
import { ThemeProvider, useTheme } from '@/lib/theme';

function Gate() {
  const { colors, isDark } = useTheme();
  const { user, loading, signOut } = useAuth();
  const { ready } = useStore();
  const backup = useBackup();

  let blocker: React.ReactNode = null;
  if (loading || !ready) blocker = <Loading />;
  else if (user && backup.initial !== 'done') {
    blocker =
      backup.initial === 'failed' ? (
        <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: 28, gap: 14 }}>
          <Text size={24} weight="extrabold">
            Could not load your backup
          </Text>
          <Text muted>Check your internet connection and try again. Your measurements are safe in Google Drive.</Text>
          {backup.initialError ? (
            <Text size={12} color={colors.danger}>
              {backup.initialError}
            </Text>
          ) : null}
          <Button title="Try again" onPress={backup.retryInitial} />
          <Button title="Sign out" variant="secondary" onPress={() => void signOut()} />
        </View>
      ) : (
        <Loading label="Loading your backup…" />
      );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {blocker ?? (
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
          <Stack.Protected guard={!user}>
            <Stack.Screen name="login" />
          </Stack.Protected>
          <Stack.Protected guard={!!user}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="customer/[id]" />
            <Stack.Screen name="customer/edit" options={{ presentation: 'modal' }} />
            <Stack.Screen name="measure" />
            <Stack.Screen name="record/[id]" />
          </Stack.Protected>
        </Stack>
      )}
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <StoreProvider>
            <BackupProvider>{fontsLoaded ? <Gate /> : null}</BackupProvider>
          </StoreProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
