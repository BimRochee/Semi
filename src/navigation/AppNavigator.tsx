import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useAppState } from '@/src/hooks/useAppState';
import { useAutoLock } from '@/src/hooks/useAutoLock';
import { AddSalaryScreen } from '@/src/screens/AddSalaryScreen';
import { BudgetTemplateScreen } from '@/src/screens/BudgetTemplateScreen';
import { CreatePinScreen } from '@/src/screens/CreatePinScreen';
import { DashboardScreen } from '@/src/screens/DashboardScreen';
import { HistoryScreen } from '@/src/screens/HistoryScreen';
import { LockScreen } from '@/src/screens/LockScreen';
import { SalaryDetailScreen } from '@/src/screens/SalaryDetailScreen';
import { SecuritySettingsScreen } from '@/src/screens/SecuritySettingsScreen';
import { WalletsScreen } from '@/src/screens/WalletsScreen';

type ScreenKey =
  | 'createPin'
  | 'dashboard'
  | 'wallets'
  | 'history'
  | 'addSalary'
  | 'salaryDetail'
  | 'budgetTemplates'
  | 'security';

export function AppNavigator() {
  const { hydrated, hasPin, isLocked } = useAppState();
  const [activeScreen, setActiveScreen] = useState<ScreenKey>('dashboard');
  const [selectedSalaryEntryId, setSelectedSalaryEntryId] = useState<string | null>(null);

  useAutoLock();

  if (!hydrated) {
    return (
      <SafeAreaView style={styles.stateScreen}>
        <Text style={styles.stateText}>Loading local ledger...</Text>
      </SafeAreaView>
    );
  }

  if (hasPin && isLocked) {
    return <LockScreen />;
  }

  const renderScreen = () => {
    switch (activeScreen) {
      case 'createPin':
        return <CreatePinScreen />;
      case 'wallets':
        return <WalletsScreen />;
      case 'history':
        return <HistoryScreen />;
      case 'addSalary':
        return (
          <AddSalaryScreen
            onSaved={(salaryEntryId) => {
              setSelectedSalaryEntryId(salaryEntryId);
              setActiveScreen('salaryDetail');
            }}
          />
        );
      case 'salaryDetail':
        return selectedSalaryEntryId ? (
          <SalaryDetailScreen salaryEntryId={selectedSalaryEntryId} />
        ) : (
          <DashboardScreen
            onOpenWallets={() => setActiveScreen('wallets')}
            onOpenAddSalary={() => setActiveScreen('addSalary')}
            onOpenBudgetTemplates={() => setActiveScreen('budgetTemplates')}
            onOpenSecurity={() => setActiveScreen('security')}
            onOpenSalary={(salaryEntryId) => {
              setSelectedSalaryEntryId(salaryEntryId);
              setActiveScreen('salaryDetail');
            }}
          />
        );
      case 'budgetTemplates':
        return <BudgetTemplateScreen />;
      case 'security':
        return <SecuritySettingsScreen />;
      case 'dashboard':
      default:
        return (
          <DashboardScreen
            onOpenWallets={() => setActiveScreen('wallets')}
            onOpenAddSalary={() => setActiveScreen('addSalary')}
            onOpenBudgetTemplates={() => setActiveScreen('budgetTemplates')}
            onOpenSecurity={() => setActiveScreen('security')}
            onOpenSalary={(salaryEntryId) => {
              setSelectedSalaryEntryId(salaryEntryId);
              setActiveScreen('salaryDetail');
            }}
          />
        );
    }
  };

  const showMainChrome = activeScreen !== 'createPin';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.shell}>
        {showMainChrome ? (
          <View style={styles.topBar}>
            <View style={styles.topBarLeft}>
              <Pressable style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}>
                <MaterialIcons color="#003535" name="menu" size={24} />
              </Pressable>
              <Text style={styles.topBarTitle}>Semi</Text>
            </View>
            <Pressable
              onPress={() => setActiveScreen('security')}
              style={({ pressed }) => [styles.profileButton, pressed && styles.iconButtonPressed]}>
              <MaterialIcons color="#003535" name="person" size={20} />
            </Pressable>
          </View>
        ) : null}

        <View style={styles.content}>{renderScreen()}</View>

        {showMainChrome ? (
          <>
            <Pressable
              onPress={() => setActiveScreen('addSalary')}
              style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}>
              <MaterialIcons color="#FFFFFF" name="add" size={28} />
            </Pressable>
            <View style={styles.bottomNav}>
              <BottomNavItem
                active={activeScreen === 'dashboard'}
                icon="published-with-changes"
                label="Cycle"
                onPress={() => setActiveScreen('dashboard')}
              />
              <BottomNavItem
                active={activeScreen === 'budgetTemplates'}
                icon="account-balance-wallet"
                label="Budget"
                onPress={() => setActiveScreen('budgetTemplates')}
              />
              <BottomNavItem
                active={activeScreen === 'wallets'}
                icon="payments"
                label="Wallets"
                onPress={() => setActiveScreen('wallets')}
              />
              <BottomNavItem
                active={activeScreen === 'history'}
                icon="history"
                label="History"
                onPress={() => setActiveScreen('history')}
              />
            </View>
          </>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

function BottomNavItem({
  icon,
  label,
  onPress,
  active,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  onPress: () => void;
  active: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.bottomNavItem,
        active && styles.bottomNavItemActive,
        pressed && styles.iconButtonPressed,
      ]}>
      <MaterialIcons
        color={active ? '#4B6C4C' : '#404848'}
        name={icon}
        size={22}
      />
      <Text style={[styles.bottomNavLabel, active && styles.bottomNavLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7FF',
  },
  shell: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  stateScreen: {
    flex: 1,
    backgroundColor: '#F8F9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateText: {
    color: '#0D1C2F',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },
  topBar: {
    borderBottomWidth: 1,
    borderBottomColor: '#BFC8C8',
    backgroundColor: '#F8F9FF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topBarTitle: {
    color: '#003535',
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonPressed: {
    opacity: 0.8,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BFC8C8',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 92,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#003535',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0B2222',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  fabPressed: {
    opacity: 0.9,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: '#BFC8C8',
    backgroundColor: '#F8F9FF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  bottomNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 2,
  },
  bottomNavItemActive: {
    backgroundColor: '#C6EDC4',
  },
  bottomNavLabel: {
    color: '#404848',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  bottomNavLabelActive: {
    color: '#4B6C4C',
  },
  content: {
    flex: 1,
  },
});
