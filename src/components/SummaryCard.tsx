import { StyleSheet, Text, View } from 'react-native';

type SummaryCardProps = {
  title: string;
  value: string;
  subtitle: string;
};

export function SummaryCard({ title, value, subtitle }: SummaryCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    gap: 8,
    borderWidth: 1,
    borderColor: '#DCE6FF',
  },
  title: {
    color: '#456646',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  value: {
    color: '#0D1C2F',
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
  },
  subtitle: {
    color: '#5B6464',
    fontSize: 14,
    lineHeight: 20,
  },
});
