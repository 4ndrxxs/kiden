import React from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radius, spacing } from '../../theme/spacing';

interface QuickActionCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  gradient?: readonly [string, string, ...string[]];
  onPress: () => void;
}

export function QuickActionCard({
  icon,
  title,
  subtitle,
  gradient = colors.primary.gradient,
  onPress,
}: QuickActionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wrapper, { opacity: pressed ? 0.85 : 1 }]}
    >
      <LinearGradient
        colors={[...gradient] as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.iconCircle}>
          <Ionicons name={icon} size={22} color={colors.white} />
        </View>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    borderRadius: radius.xl,
    overflow: 'hidden',
    minHeight: 120,
  },
  gradient: {
    flex: 1,
    padding: spacing.base,
    justifyContent: 'space-between',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.body2Bold,
    color: colors.white,
    marginTop: spacing.md,
  },
  subtitle: {
    ...typography.label,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
