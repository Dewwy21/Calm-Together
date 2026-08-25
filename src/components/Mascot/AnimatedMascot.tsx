import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import { Mascot } from './Mascot';
import { MascotMotion } from './types';
import { useTheme } from '../../theme';
import { IconProps, TeacupIcon, LanternIcon, BackpackIcon, BookIcon } from '../icons';
import { usePreferencesContext } from '../../features/preferences/PreferencesProvider';
import { MascotAccessory } from '../../features/preferences/types';

interface AnimatedMascotProps {
  size?: number;
  motion?: MascotMotion;
  propIcon?: React.ComponentType<IconProps>;
}

// A caregiver-chosen "signature item" (Settings > Customize Look & Feel)
// shown on the mascot's everyday appearances when nothing more specific is
// requested — see the propIcon fallback below.
const ACCESSORY_ICONS: Record<MascotAccessory, React.ComponentType<IconProps> | undefined> = {
  none: undefined,
  tea: TeacupIcon,
  lantern: LanternIcon,
  backpack: BackpackIcon,
  book: BookIcon,
};

// Wraps the single real mascot photo with Animated transforms so it reads
// as alive and contextual without needing per-pose artwork (there's no
// image-generation tool available, and the photo is the mascot's
// established visual identity — see mascotPoses.ts for how named poses map
// onto these motions). Looping motions (idle/float/sway/bounce) run until
// the motion prop changes or the component unmounts; one-shot motions
// (wave/celebrate/encourage) play once and settle back to rest.
export function AnimatedMascot({ size = 120, motion = 'idle', propIcon }: AnimatedMascotProps) {
  const { color, radii, shadows } = useTheme();
  const { preferences } = usePreferencesContext();
  const PropIcon = propIcon ?? ACCESSORY_ICONS[preferences.mascotAccessory];
  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    scale.setValue(1);
    translateY.setValue(0);
    rotate.setValue(0);

    let anim: Animated.CompositeAnimation | null = null;

    switch (motion) {
      case 'idle':
        anim = Animated.loop(
          Animated.sequence([
            Animated.timing(scale, { toValue: 1.035, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(scale, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          ])
        );
        break;
      case 'float':
        anim = Animated.loop(
          Animated.sequence([
            Animated.timing(translateY, { toValue: -7, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          ])
        );
        break;
      case 'sway':
        anim = Animated.loop(
          Animated.sequence([
            Animated.timing(rotate, { toValue: -1, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(rotate, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(rotate, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          ])
        );
        break;
      case 'bounce':
        anim = Animated.loop(
          Animated.sequence([
            Animated.timing(translateY, { toValue: -5, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 500, easing: Easing.bounce, useNativeDriver: true }),
            Animated.delay(600),
          ])
        );
        break;
      case 'wave':
        anim = Animated.sequence([
          Animated.timing(rotate, { toValue: -1, duration: 160, useNativeDriver: true }),
          Animated.timing(rotate, { toValue: 1, duration: 220, useNativeDriver: true }),
          Animated.timing(rotate, { toValue: -1, duration: 220, useNativeDriver: true }),
          Animated.timing(rotate, { toValue: 0.6, duration: 200, useNativeDriver: true }),
          Animated.timing(rotate, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]);
        break;
      case 'celebrate':
        anim = Animated.sequence([
          Animated.parallel([
            Animated.timing(scale, { toValue: 1.18, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            Animated.timing(translateY, { toValue: -12, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
            Animated.spring(translateY, { toValue: 0, friction: 4, useNativeDriver: true }),
          ]),
        ]);
        break;
      case 'encourage':
        anim = Animated.sequence([
          Animated.timing(translateY, { toValue: -5, duration: 380, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 0, duration: 380, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]);
        break;
    }

    anim?.start();
    return () => anim?.stop();
  }, [motion, scale, translateY, rotate]);

  const rotateDeg = rotate.interpolate({ inputRange: [-1, 1], outputRange: ['-8deg', '8deg'] });

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={{ transform: [{ scale }, { translateY }, { rotate: rotateDeg }] }}>
        <Mascot size={size} />
      </Animated.View>
      {PropIcon && (
        <View
          style={[
            {
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: size * 0.34,
              height: size * 0.34,
              borderRadius: radii.pill,
              backgroundColor: color.surface,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: color.background,
            },
            shadows.card,
          ]}
        >
          <PropIcon size={size * 0.18} color={color.textPrimary} />
        </View>
      )}
    </View>
  );
}
