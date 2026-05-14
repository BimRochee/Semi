import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { useAppState } from '@/src/hooks/useAppState';
import { formatShortDate } from '@/src/utils/dateUtils';

export function SecuritySettingsScreen() {
  const { clearPin, state, updateSettings } = useAppState();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>PIN status</Text>
        <Text style={styles.copy}>
          {state.settings.pinCreatedAt
            ? `PIN created ${formatShortDate(state.settings.pinCreatedAt)}`
            : 'No PIN creation timestamp stored yet.'}
        </Text>
        <Pressable onPress={clearPin} style={({ pressed }) => [styles.dangerButton, pressed && styles.buttonPressed]}>
          <Text style={styles.dangerButtonLabel}>Clear PIN</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowCopy}>
            <Text style={styles.title}>Lock on background</Text>
            <Text style={styles.copy}>Immediately require the PIN when the app leaves the foreground.</Text>
          </View>
          <Switch
            onValueChange={(value) => updateSettings({ lockOnBackground: value })}
            value={state.settings.lockOnBackground}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Auto-lock delay</Text>
        <Text style={styles.copy}>Use 0 minutes when you want only background locking.</Text>
        <View style={styles.optionRow}>
          {[0, 1, 5].map((minutes) => (
            <Pressable
              key={minutes}
              onPress={() => updateSettings({ autoLockMinutes: minutes })}
              style={({ pressed }) => [
                styles.optionButton,
                state.settings.autoLockMinutes === minutes && styles.optionButtonSelected,
                pressed && styles.buttonPressed,
              ]}>
              <Text
                style={[
                  styles.optionButtonLabel,
                  state.settings.autoLockMinutes === minutes && styles.optionButtonLabelSelected,
                ]}>
                {minutes === 0 ? 'Off' : `${minutes} min`}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DCE6FF',
    gap: 12,
  },
  title: {
    color: '#0D1C2F',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  copy: {
    color: '#5B6464',
    fontSize: 14,
    lineHeight: 22,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowCopy: {
    flex: 1,
    gap: 6,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#EAF3FF',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: '#0D4D4D',
  },
  optionButtonLabel: {
    color: '#003535',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  optionButtonLabelSelected: {
    color: '#FFFFFF',
  },
  dangerButton: {
    backgroundColor: '#FFE4E1',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dangerButtonLabel: {
    color: '#BA1A1A',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.88,
  },
});
