import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export function MenuScreen({
  onNavigateToHistory,
  onNavigateToSettings,
  onNavigateToAbout,
}: {
  onNavigateToHistory: () => void;
  onNavigateToSettings: () => void;
  onNavigateToAbout: () => void;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Menu</Text>
      
      <View style={styles.menuPanel}>
        <Pressable
          onPress={onNavigateToHistory}
          style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}>
          <View style={styles.menuItemLead}>
            <View style={styles.menuItemIcon}>
              <MaterialIcons color="#404848" name="history" size={20} />
            </View>
            <View>
              <Text style={styles.menuItemTitle}>History</Text>
              <Text style={styles.menuItemCopy}>Review your past ledger activity.</Text>
            </View>
          </View>
          <MaterialIcons color="#707978" name="chevron-right" size={18} />
        </Pressable>

        <Pressable
          onPress={onNavigateToSettings}
          style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}>
          <View style={styles.menuItemLead}>
            <View style={styles.menuItemIcon}>
              <MaterialIcons color="#404848" name="settings" size={20} />
            </View>
            <View>
              <Text style={styles.menuItemTitle}>Settings & Security</Text>
              <Text style={styles.menuItemCopy}>Manage your PIN, biometrics, and profile.</Text>
            </View>
          </View>
          <MaterialIcons color="#707978" name="chevron-right" size={18} />
        </Pressable>

        <Pressable
          onPress={onNavigateToAbout}
          style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}>
          <View style={styles.menuItemLead}>
            <View style={styles.menuItemIcon}>
              <MaterialIcons color="#404848" name="info" size={20} />
            </View>
            <View>
              <Text style={styles.menuItemTitle}>About Semi</Text>
              <Text style={styles.menuItemCopy}>What does the name mean?</Text>
            </View>
          </View>
          <MaterialIcons color="#707978" name="chevron-right" size={18} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
    padding: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#003535',
    marginBottom: 24,
  },
  menuPanel: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#BFC8C8',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  menuItemPressed: {
    backgroundColor: '#EFF4FF',
  },
  menuItemLead: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemTitle: {
    color: '#0D1C2F',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  menuItemCopy: {
    color: '#404848',
    fontSize: 13,
    lineHeight: 18,
  },
});
