import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleProp,
  Switch as RNSwitch,
  Text as RNText,
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/lib/theme';
import { Icon, IconName } from './Icon';

type Weight = 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';
const FONT: Record<Weight, string> = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
};

interface TProps extends TextProps {
  size?: number;
  weight?: Weight;
  muted?: boolean;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export function Text({ size = 15, weight = 'regular', muted, color, style, ...rest }: TProps) {
  const { colors } = useTheme();
  return (
    <RNText
      {...rest}
      style={[{ fontFamily: FONT[weight], fontSize: size, color: color ?? (muted ? colors.muted : colors.ink) }, style]}
    />
  );
}

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  /** Extra space at the bottom (e.g. for a floating tab bar). */
  bottom?: number;
  style?: StyleProp<ViewStyle>;
}

export function Screen({ children, scroll = true, bottom = 24, style }: ScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const pad = { paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: bottom + insets.bottom };
  if (scroll) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[pad, { gap: 14 }, style]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    );
  }
  return <View style={[{ flex: 1, backgroundColor: colors.bg }, pad, style]}>{children}</View>;
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        { backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: 20, padding: 14 },
        style,
      ]}
    >
      {children}
    </View>
  );
}

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ink' | 'danger' | 'soft';
  icon?: IconName;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  height?: number;
}

export function Button({ title, onPress, variant = 'primary', icon, disabled, style, height = 52 }: ButtonProps) {
  const { colors } = useTheme();
  const v = {
    primary: { bg: colors.primary, fg: colors.onPrimary, border: colors.primary },
    ink: { bg: colors.ink, fg: colors.bg, border: colors.ink },
    soft: { bg: colors.soft, fg: colors.primary, border: colors.soft },
    secondary: { bg: colors.surface, fg: colors.ink, border: colors.line },
    danger: { bg: 'transparent', fg: colors.danger, border: colors.danger },
  }[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          height,
          borderRadius: 16,
          backgroundColor: v.bg,
          borderColor: v.border,
          borderWidth: 1.5,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
          paddingHorizontal: 16,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {icon ? <Icon name={icon} size={18} color={v.fg} /> : null}
      <Text weight="bold" color={v.fg}>
        {title}
      </Text>
    </Pressable>
  );
}

export function IconButton({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={{
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: colors.surface,
        borderColor: colors.line,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={icon} size={20} color={colors.ink} />
    </Pressable>
  );
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: active ? colors.primary : colors.surface,
        borderWidth: 1,
        borderColor: active ? colors.primary : colors.line,
      }}
    >
      <Text size={13} weight={active ? 'bold' : 'semibold'} color={active ? colors.onPrimary : colors.muted}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: colors.surface2, borderRadius: 16, padding: 4 }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: on ? colors.primary : 'transparent',
            }}
          >
            <Text size={14} weight={on ? 'bold' : 'semibold'} color={on ? colors.onPrimary : colors.muted}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Switch({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  const { colors } = useTheme();
  return (
    <RNSwitch
      accessibilityLabel={label}
      value={value}
      onValueChange={onChange}
      trackColor={{ false: colors.line, true: colors.primary }}
      thumbColor="#FFFFFF"
    />
  );
}

export function Field({ label, style, ...rest }: TextInputProps & { label: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text size={12} muted weight="semibold">
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        {...rest}
        style={[
          {
            fontFamily: FONT.medium,
            fontSize: 16,
            color: colors.ink,
            backgroundColor: colors.surface,
            borderColor: colors.line,
            borderWidth: 1,
            borderRadius: 14,
            paddingHorizontal: 14,
            paddingVertical: 12,
          },
          style,
        ]}
      />
    </View>
  );
}

export function Avatar({ name, size = 48, inverse }: { name: string; size?: number; inverse?: boolean }) {
  const { colors } = useTheme();
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.34,
        backgroundColor: inverse ? 'rgba(255,255,255,0.2)' : colors.soft,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text weight="extrabold" size={size * 0.34} color={inverse ? colors.onPrimary : colors.primary}>
        {initials || '?'}
      </Text>
    </View>
  );
}

export function Loading({ label }: { label?: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: 14 }}>
      <ActivityIndicator color={colors.primary} size="large" />
      {label ? <Text muted>{label}</Text> : null}
    </View>
  );
}

export function Row({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 10 }, style]}>{children}</View>;
}
