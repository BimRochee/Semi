import { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { FeatureTourOverlay } from '@/src/screens/FeatureTourOverlay';

import { TransferScreen } from '@/src/screens/TransferScreen';
import { PayablesScreen } from '@/src/screens/PayablesScreen';
import { PayableDetailScreen } from '@/src/screens/PayableDetailScreen';
import { PayInstallmentScreen } from '@/src/screens/PayInstallmentScreen';
import { CreatePayableScreen } from '@/src/screens/CreatePayableScreen';
import { AddExtraIncomeScreen } from '@/src/screens/AddExtraIncomeScreen';
import { BalanceReconciliationScreen } from '@/src/screens/BalanceReconciliationScreen';
import { Modal } from 'react-native';

type ScreenKey =
  | 'createPin'
  | 'dashboard'
  | 'wallets'
  | 'history'
  | 'addSalary'
  | 'addExtraIncome'
  | 'salaryDetail'
  | 'budgetTemplates'
  | 'security'
  | 'transfer'
  | 'payables'
  | 'payableDetail'
  | 'payInstallment'
  | 'createPayable'
  | 'balanceReconciliation';

type NavTabKey = 'home' | 'budget' | 'wallets' | 'transfer';

export function AppNavigator() {
  const { hydrated, hasPin, isLocked, state } = useAppState();
  const [activeScreen, setActiveScreen] = useState<ScreenKey>('dashboard');
  const [selectedSalaryEntryId, setSelectedSalaryEntryId] = useState<string | null>(null);
  const [selectedPayableId, setSelectedPayableId] = useState<string | null>(null);
  const [selectedInstallmentId, setSelectedInstallmentId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAddChoiceVisible, setIsAddChoiceVisible] = useState(false);
  const [isAboutVisible, setIsAboutVisible] = useState(false);

  const [showSplash, setShowSplash] = useState(true);
  const [splashProgress, setSplashProgress] = useState(0);

  useAutoLock();

  useEffect(() => {
    let start = Date.now();
    let currentProgress = 0;

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const targetProgress = Math.min((elapsed / 3000) * 100, 100);
      
      if (!hydrated && targetProgress > 95) {
        setSplashProgress(95);
      } else {
        setSplashProgress(targetProgress);
      }

      if (targetProgress >= 100 && hydrated) {
        clearInterval(interval);
        setTimeout(() => setShowSplash(false), 200);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [hydrated]);

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <View style={styles.splashCircleTopRight} />
        <View style={styles.splashCircleBottomLeft} />
        
        <Image 
          source={require('../../assets/images/SemiLogo.svg')}
          style={styles.splashImage}
          contentFit="contain"
        />
        <Text style={styles.splashTitle}>Semi</Text>
        <Text style={styles.splashSubtitle}>Breaking the one-day millionaire cycle.</Text>

        <View style={styles.splashProgressContainer}>
          <View style={[styles.splashProgressBar, { width: `${splashProgress}%` }]} />
        </View>
      </View>
    );
  }

  if (hasPin && isLocked) {
    return <LockScreen />;
  }

  const navigateTo = (screen: ScreenKey) => {
    setMenuOpen(false);
    setIsAddChoiceVisible(false);
    setActiveScreen(screen);
    if (screen !== 'salaryDetail') setSelectedSalaryEntryId(null);
    if (screen !== 'payableDetail' && screen !== 'payInstallment') setSelectedPayableId(null);
    if (screen !== 'payInstallment') setSelectedInstallmentId(null);
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'createPin':
        return <CreatePinScreen />;
      case 'wallets':
        return <WalletsScreen />;
      case 'history':
        return <HistoryScreen />;
      case 'transfer':
        return <TransferScreen onSaved={() => navigateTo('history')} />;
      case 'payables':
        return (
          <PayablesScreen
            onAddPayable={() => navigateTo('createPayable')}
            onOpenPayable={(id) => {
              setSelectedPayableId(id);
              navigateTo('payableDetail');
            }}
          />
        );
      case 'payableDetail':
        return selectedPayableId ? (
          <PayableDetailScreen
            payableId={selectedPayableId}
            onPayInstallment={(id) => {
              setSelectedInstallmentId(id);
              navigateTo('payInstallment');
            }}
            onBack={() => navigateTo('payables')}
          />
        ) : (
          navigateTo('payables') as any
        );
      case 'payInstallment':
        return selectedInstallmentId ? (
          <PayInstallmentScreen
            installmentId={selectedInstallmentId}
            onSaved={() => navigateTo('history')}
            onBack={() => navigateTo('payableDetail')}
          />
        ) : (
          navigateTo('payables') as any
        );
      case 'createPayable':
        return (
          <CreatePayableScreen
            onSaved={() => navigateTo('payables')}
            onBack={() => navigateTo('payables')}
          />
        );
      case 'addSalary':
        return (
          <AddSalaryScreen
            onSaved={(salaryEntryId) => {
              setSelectedSalaryEntryId(salaryEntryId);
              navigateTo('salaryDetail');
            }}
            onBack={() => navigateTo('dashboard')}
          />
        );
      case 'addExtraIncome':
        return (
          <AddExtraIncomeScreen
            onSaved={() => navigateTo('dashboard')}
            onBack={() => navigateTo('dashboard')}
          />
        );
      case 'balanceReconciliation':
        return (
          <BalanceReconciliationScreen
            onBack={() => navigateTo('dashboard')}
            onSaved={() => navigateTo('dashboard')}
          />
        );
      case 'salaryDetail':
        return selectedSalaryEntryId ? (
          <SalaryDetailScreen salaryEntryId={selectedSalaryEntryId} />
        ) : (
          <DashboardScreen
            onOpenWallets={() => navigateTo('wallets')}
            onOpenBalanceReconciliation={() => navigateTo('balanceReconciliation')}
            onOpenAddSalary={() => navigateTo('addSalary')}
            onOpenBudgetTemplates={() => navigateTo('budgetTemplates')}
            onOpenSecurity={() => navigateTo('security')}
            onOpenTransfer={() => navigateTo('transfer')}
            onOpenSalary={(salaryEntryId) => {
              setSelectedSalaryEntryId(salaryEntryId);
              navigateTo('salaryDetail');
            }}
          />
        );
      case 'budgetTemplates':
        return <BudgetTemplateScreen />;
      case 'security':
        return <SecuritySettingsScreen onNavigateToCreatePin={() => navigateTo('createPin')} />;
      case 'dashboard':
      default:
        return (
          <DashboardScreen
            onOpenWallets={() => navigateTo('wallets')}
            onOpenBalanceReconciliation={() => navigateTo('balanceReconciliation')}
            onOpenAddSalary={() => navigateTo('addSalary')}
            onOpenBudgetTemplates={() => navigateTo('budgetTemplates')}
            onOpenSecurity={() => navigateTo('security')}
            onOpenTransfer={() => navigateTo('transfer')}
            onOpenSalary={(salaryEntryId) => {
              setSelectedSalaryEntryId(salaryEntryId);
              navigateTo('salaryDetail');
            }}
          />
        );
    }
  };

  const showMainChrome = activeScreen !== 'createPin';
  const showTopBar = showMainChrome && activeScreen !== 'balanceReconciliation';
  const activeTab = getActiveTab(activeScreen);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.shell}>
        <View style={[styles.content, showTopBar && styles.contentWithFloatingNav]}>{renderScreen()}</View>

        {showMainChrome ? (
          <>
            {showTopBar && (
              <View style={styles.topBar}>
              <View style={styles.topBarLeft}>
                <Pressable
                  onPress={() => setMenuOpen((current) => !current)}
                  style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}>
                  <MaterialIcons color="#003535" name="menu" size={24} />
                </Pressable>
                <Text style={styles.topBarTitle}>Semi</Text>
              </View>
              <Pressable
                onPress={() => navigateTo('security')}
                style={({ pressed }) => [styles.profileButton, pressed && styles.iconButtonPressed]}>
                {state.settings.profilePictureUri ? (
                  <Image
                    source={{ uri: state.settings.profilePictureUri }}
                    style={{ width: '100%', height: '100%', borderRadius: 18 }}
                    contentFit="cover"
                  />
                ) : (
                  <MaterialIcons color="#003535" name="person" size={20} />
                )}
              </Pressable>
            </View>
            )}

            {/* About Modal */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={isAboutVisible}
              onRequestClose={() => setIsAboutVisible(false)}
            >
              <View style={styles.aboutOverlay}>
                <View style={styles.aboutContent}>
                  <View style={styles.aboutHeader}>
                    <Text style={styles.aboutTitle}>Semi</Text>
                    <Pressable onPress={() => setIsAboutVisible(false)} hitSlop={10}>
                      <MaterialIcons name="close" size={24} color="#003535" />
                    </Pressable>
                  </View>
                  
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.aboutTaglineBox}>
                      <Text style={styles.aboutTagline}>Breaking the one-day millionaire cycle.</Text>
                      <Text style={styles.aboutTestingBadge}>TESTING PHASE</Text>
                    </View>

                    <Text style={styles.aboutSectionTitle}>Why "Semi"?</Text>
                    
                    <View style={styles.aboutMeaningBox}>
                      <View style={styles.aboutMeaningItem}>
                        <Text style={styles.aboutMeaningNum}>1.</Text>
                        <View style={{flex: 1}}>
                          <Text style={styles.aboutMeaningTitle}>Filipino Payday</Text>
                          <Text style={styles.aboutMeaningText}>"Semi" = semi-monthly salary / tuwing semi / payday every 15th and 30th.</Text>
                        </View>
                      </View>

                      <View style={styles.aboutMeaningItem}>
                        <Text style={styles.aboutMeaningNum}>2.</Text>
                        <View style={{flex: 1}}>
                          <Text style={styles.aboutMeaningTitle}>Japanese Cicada</Text>
                          <Text style={styles.aboutMeaningText}>"Semi" (セミ) = cicada. A metaphor for the one-day millionaire cycle: quiet for 15 days, alive on payday, spends fast, then broke again.</Text>
                        </View>
                      </View>
                    </View>

                    <Text style={styles.aboutSectionTitle}>Our Purpose</Text>
                    <Text style={styles.aboutBodyText}>
                      Semi helps Filipino employees plan their 15th and 30th salary before spending it. The goal is to help you:
                    </Text>
                    
                    <View style={styles.aboutList}>
                      <View style={styles.aboutListItem}><MaterialIcons name="check-circle" size={16} color="#006A14" /><Text style={styles.aboutListText}>Know how much salary was received</Text></View>
                      <View style={styles.aboutListItem}><MaterialIcons name="check-circle" size={16} color="#006A14" /><Text style={styles.aboutListText}>Know where the money should go</Text></View>
                      <View style={styles.aboutListItem}><MaterialIcons name="check-circle" size={16} color="#006A14" /><Text style={styles.aboutListText}>Know which wallet holds the money</Text></View>
                      <View style={styles.aboutListItem}><MaterialIcons name="check-circle" size={16} color="#006A14" /><Text style={styles.aboutListText}>Avoid spending everything on payday</Text></View>
                      <View style={styles.aboutListItem}><MaterialIcons name="star" size={16} color="#003535" /><Text style={styles.aboutListText}>Break the one-day millionaire cycle</Text></View>
                    </View>
                    
                    <View style={{height: 40}} />
                  </ScrollView>
                </View>
              </View>
            </Modal>

            {/* Add Choice Modal */}
            <Modal
              animationType="fade"
              transparent={true}
              visible={isAddChoiceVisible}
              onRequestClose={() => setIsAddChoiceVisible(false)}
            >
              <Pressable 
                style={styles.modalOverlay} 
                onPress={() => setIsAddChoiceVisible(false)}
              >
                <View style={styles.choiceMenu}>
                  <Text style={styles.choiceTitle}>What are we adding?</Text>
                  
                  <Pressable 
                    onPress={() => navigateTo('addSalary')}
                    style={({ pressed }) => [styles.choiceItem, pressed && styles.choicePressed]}
                  >
                    <View style={[styles.choiceIcon, { backgroundColor: '#C6EDC4' }]}>
                      <MaterialIcons name="payments" size={24} color="#003535" />
                    </View>
                    <View>
                      <Text style={styles.choiceLabel}>New Salary</Text>
                      <Text style={styles.choiceSub}>Log 15th/30th payout with budget.</Text>
                    </View>
                  </Pressable>

                  <Pressable 
                    onPress={() => navigateTo('addExtraIncome')}
                    style={({ pressed }) => [styles.choiceItem, pressed && styles.choicePressed]}
                  >
                    <View style={[styles.choiceIcon, { backgroundColor: '#E6EEFF' }]}>
                      <MaterialIcons name="add-card" size={24} color="#003535" />
                    </View>
                    <View>
                      <Text style={styles.choiceLabel}>Extra Money</Text>
                      <Text style={styles.choiceSub}>Gifts, bonuses, or found money.</Text>
                    </View>
                  </Pressable>
                </View>
              </Pressable>
            </Modal>

            {menuOpen ? (
              <View pointerEvents="box-none" style={styles.menuLayer}>
                <Pressable onPress={() => setMenuOpen(false)} style={styles.menuBackdrop} />
                <View style={styles.menuPanel}>
                  <Pressable
                    onPress={() => navigateTo('history')}
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
                    onPress={() => navigateTo('payables')}
                    style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                  >
                    <View style={styles.menuItemLead}>
                      <View style={styles.menuItemIcon}>
                        <MaterialIcons color="#404848" name="receipt-long" size={20} />
                      </View>
                      <View>
                        <Text style={styles.menuItemTitle}>Payables / Debt</Text>
                        <Text style={styles.menuItemCopy}>Track loans and installment schedules.</Text>
                      </View>
                    </View>
                    <MaterialIcons color="#707978" name="chevron-right" size={18} />
                  </Pressable>

                  <Pressable
                    onPress={() => navigateTo('security')}
                    style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}>
                    <View style={styles.menuItemLead}>
                      <View style={styles.menuItemIcon}>
                        <MaterialIcons color="#404848" name="settings" size={20} />
                      </View>
                      <View>
                        <Text style={styles.menuItemTitle}>Settings</Text>
                        <Text style={styles.menuItemCopy}>Manage your PIN, biometrics, and lock rules.</Text>
                      </View>
                    </View>
                    <MaterialIcons color="#707978" name="chevron-right" size={18} />
                  </Pressable>

                  <Pressable
                    onPress={() => { setMenuOpen(false); setIsAboutVisible(true); }}
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
            ) : null}

            {showMainChrome && (
              <View pointerEvents="box-none" style={styles.floatingNavFrame}>
                <View style={styles.floatingNavContainer}>
                  <View style={styles.floatingNav}>
                    <BottomNavItem
                      active={activeTab === 'home'}
                      icon="home"
                      onPress={() => navigateTo('dashboard')}
                    />
                    <BottomNavItem
                      active={activeTab === 'budget'}
                      icon="account-balance-wallet"
                      onPress={() => navigateTo('budgetTemplates')}
                    />
                    <BottomNavItem
                      active={activeTab === 'wallets'}
                      icon="payments"
                      onPress={() => navigateTo('wallets')}
                    />
                    <BottomNavItem
                      active={activeTab === 'transfer'}
                      icon="swap-horiz"
                      onPress={() => navigateTo('transfer')}
                    />
                  </View>

                  <Pressable
                    onPress={() => setIsAddChoiceVisible(true)}
                    style={({ pressed }) => [
                      styles.fab,
                      (activeScreen === 'addSalary' || activeScreen === 'addExtraIncome') && styles.fabActive,
                      pressed && styles.fabPressed,
                    ]}>
                    <MaterialIcons
                      color={activeScreen === 'addSalary' ? '#003535' : '#FFFFFF'}
                      name="add"
                      size={32}
                    />
                  </Pressable>
                </View>
              </View>
            )}
          </>
        ) : null}

        {hydrated && !state.settings.hasSeenFeatureTour && (
          <FeatureTourOverlay navigateTo={navigateTo} />
        )}
      </View>
    </SafeAreaView>
  );
}

function getActiveTab(activeScreen: ScreenKey): NavTabKey | null {
  switch (activeScreen) {
    case 'budgetTemplates':
      return 'budget';
    case 'wallets':
      return 'wallets';
    case 'dashboard':
      return 'home';
    case 'transfer':
      return 'transfer';
    case 'addSalary':
    case 'salaryDetail':
    case 'history':
    case 'security':
    default:
      return null;
  }
}

function BottomNavItem({
  icon,
  onPress,
  active,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  onPress: () => void;
  active: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.bottomNavItem,
        pressed && styles.iconButtonPressed,
      ]}>
      {active ? (
        <View style={styles.bottomNavItemActive}>
          <MaterialIcons color="#003535" name={icon} size={24} />
        </View>
      ) : (
        <MaterialIcons color="#BFC8C8" name={icon} size={24} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  choiceMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    width: '100%',
    maxWidth: 340,
    padding: 24,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  choiceTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#003535',
    marginBottom: 8,
    textAlign: 'center',
  },
  choiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#F8F9FF',
    gap: 16,
    borderWidth: 1,
    borderColor: '#EFF4FF',
  },
  choicePressed: {
    backgroundColor: '#E6EEFF',
    transform: [{ scale: 0.98 }],
  },
  choiceIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#003535',
  },
  choiceSub: {
    fontSize: 12,
    color: '#707978',
    marginTop: 2,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#FAFCFB',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  splashCircleTopRight: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#D1E8D5',
    opacity: 0.5,
  },
  splashCircleBottomLeft: {
    position: 'absolute',
    bottom: -150,
    left: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: '#D1E8D5',
    opacity: 0.5,
  },
  splashImage: {
    width: 180,
    height: 180,
    marginBottom: 24,
  },
  splashTitle: {
    fontSize: 56,
    fontWeight: '800',
    color: '#265C4F',
    marginBottom: 8,
    letterSpacing: -1,
  },
  splashSubtitle: {
    fontSize: 16,
    color: '#4A6054',
    fontWeight: '500',
    marginBottom: 48,
  },
  splashProgressContainer: {
    width: 200,
    height: 6,
    backgroundColor: '#E4EFE7',
    borderRadius: 3,
    overflow: 'hidden',
  },
  splashProgressBar: {
    height: '100%',
    backgroundColor: '#265C4F',
    borderRadius: 3,
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
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
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#003535',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  fabActive: {
    backgroundColor: '#C6EDC4',
  },
  fabPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  floatingNavFrame: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 34,
    alignItems: 'center',
    zIndex: 10,
  },
  floatingNavContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  floatingNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 999,
    backgroundColor: '#003535',
    paddingHorizontal: 8,
    height: 64,
    minWidth: 280,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  menuLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3,
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13,28,47,0.12)',
  },
  menuPanel: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 288,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#BFC8C8',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    shadowColor: '#0D1C2F',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
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
  bottomNavItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  bottomNavItemActive: {
    backgroundColor: '#C6EDC4',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentWithFloatingNav: {
    paddingTop: 58,
  },
  aboutOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  aboutContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '90%',
  },
  aboutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  aboutTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#003535',
  },
  aboutTaglineBox: {
    backgroundColor: '#E6EEFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'flex-start',
    gap: 12,
  },
  aboutTagline: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0D1C2F',
    lineHeight: 24,
  },
  aboutTestingBadge: {
    backgroundColor: '#003535',
    color: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  aboutSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#003535',
    marginBottom: 12,
  },
  aboutMeaningBox: {
    gap: 16,
    marginBottom: 24,
  },
  aboutMeaningItem: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#F8F9FF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFF4FF',
  },
  aboutMeaningNum: {
    fontSize: 20,
    fontWeight: '800',
    color: '#BFC8C8',
  },
  aboutMeaningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0D1C2F',
    marginBottom: 4,
  },
  aboutMeaningText: {
    fontSize: 14,
    color: '#404848',
    lineHeight: 20,
  },
  aboutBodyText: {
    fontSize: 14,
    color: '#404848',
    lineHeight: 22,
    marginBottom: 16,
  },
  aboutList: {
    gap: 10,
  },
  aboutListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aboutListText: {
    fontSize: 14,
    color: '#0D1C2F',
    fontWeight: '500',
  },
});
