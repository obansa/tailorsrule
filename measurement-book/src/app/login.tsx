import React from 'react';
import { View } from 'react-native';
import Svg, { G, Path, Rect } from 'react-native-svg';

import { Icon } from '@/components/Icon';
import { Button, Screen, Text } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';

export default function Login() {
  const { colors } = useTheme();
  const { signIn, error } = useAuth();
  return (
    <Screen scroll={false} style={{ justifyContent: 'space-between' }} bottom={36}>
      <View style={{ flex: 1, justifyContent: 'center', gap: 28 }}>
        <View style={{ height: 190, borderRadius: 32, backgroundColor: colors.soft, overflow: 'hidden', justifyContent: 'center' }}>
          <Svg width="100%" height="190" viewBox="0 0 342 190">
            <G rotation={-12} origin="171, 95">
              <Rect x="-20" y="75" width="400" height="44" rx="8" fill={colors.primary} />
              <Path
                d="M20 75v16M50 75v10M80 75v16M110 75v10M140 75v16M170 75v10M200 75v16M230 75v10M260 75v16M290 75v10M320 75v16"
                stroke={colors.onPrimary}
                strokeWidth={3}
                strokeLinecap="round"
              />
            </G>
          </Svg>
        </View>
        <View style={{ gap: 12 }}>
          <Text size={34} weight="extrabold" style={{ lineHeight: 38 }}>
            Every fitting,{'\n'}perfectly kept.
          </Text>
          <Text size={16} muted style={{ lineHeight: 24 }}>
            Record customer measurements in seconds. Sign in once and your book follows you to any phone.
          </Text>
        </View>
      </View>
      <View style={{ gap: 14 }}>
        {error ? (
          <Text color={colors.danger} size={13}>
            {error}
          </Text>
        ) : null}
        <Button title="Continue with Google" variant="secondary" height={58} onPress={() => void signIn()} />
        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 4 }}>
          <Icon name="cloud" size={18} color={colors.primary} />
          <Text size={13} muted style={{ flex: 1, lineHeight: 19 }}>
            Backed up to your own Google Drive. Next time you sign in, your records load back automatically.
          </Text>
        </View>
      </View>
    </Screen>
  );
}
