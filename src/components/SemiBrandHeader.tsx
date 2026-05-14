import { StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type SemiBrandHeaderProps = {
  title: string;
  subtitle: string;
  centered?: boolean;
};

export function SemiBrandHeader({ title, subtitle, centered = false }: SemiBrandHeaderProps) {
  return (
    <View style={[styles.container, centered && styles.centered]}>
      <View style={styles.logoBadge}>
        <MaterialIcons name="bug-report" size={34} color="#FFFFFF" />
      </View>
      <Text style={styles.brand}>Semi</Text>
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
