import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type SemiBrandHeaderProps = {
  title: string;
  subtitle: string;
  centered?: boolean;
  logoVariant?: 'badge' | 'semi';
  showBrand?: boolean;
};

const semiLogoSource = require('../../assets/images/SemiLogo.svg');

export function SemiBrandHeader({
  title,
  subtitle,
  centered = false,
  logoVariant = 'badge',
  showBrand = true,
}: SemiBrandHeaderProps) {
  return (
    <View style={[styles.container, centered && styles.centered]}>
      {logoVariant === 'semi' ? (
        <Image
          accessibilityLabel="Semi logo"
          contentFit="contain"
          source={semiLogoSource}
          style={styles.semiLogo}
        />
      ) : (
        <View style={styles.logoBadge}>
          <MaterialIcons name="bug-report" size={34} color="#FFFFFF" />
        </View>
      )}
      {showBrand ? <Text style={styles.brand}>Semi</Text> : null}
      <Text style={[styles.title, centered && styles.centerText]}>{title}</Text>
      <Text style={[styles.subtitle, centered && styles.centerText]}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  centered: {
    alignItems: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#003535',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  semiLogo: {
    width: 84,
    height: 84,
    marginBottom: 8,
  },
  brand: {
    color: '#003535',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  title: {
    color: '#0D1C2F',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
  },
  subtitle: {
    color: '#404848',
    fontSize: 15,
    lineHeight: 22,
  },
});
