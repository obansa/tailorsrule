import { Tabs } from 'expo-router/js-tabs';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { Text } from '@/components/ui';
import { useTheme } from '@/lib/theme';

const TABS = [
  { name: 'index', label: 'Customers', icon: 'users' as const },
  { name: 'settings', label: 'Settings', icon: 'settings' as const },
];

function FloatingBar({ state, navigateToTab }: BottomTabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        position: 'absolute',
        left: 20,
        right: 20,
        bottom: Math.max(insets.bottom, 12),
        height: 64,
        borderRadius: 24,
        backgroundColor: colors.surface,
        borderColor: colors.line,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 8,
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
      }}
    >
      {TABS.map((t) => {
        const index = state.routes.findIndex((r) => r.name === t.name);
        const active = state.index === index;
        return (
          <Pressable
            key={t.name}
            accessibilityRole="tab"
            accessibilityLabel={t.label}
            accessibilityState={{ selected: active }}
            onPress={() => navigateToTab(state.routes[index].key)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              borderRadius: 16,
              paddingHorizontal: 18,
              paddingVertical: 10,
              backgroundColor: active ? colors.soft : 'transparent',
            }}
          >
            <Icon name={t.icon} size={22} color={active ? colors.primary : colors.muted} />
            {active ? (
              <Text size={14} weight="bold" color={colors.primary}>
                {t.label}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <FloatingBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
