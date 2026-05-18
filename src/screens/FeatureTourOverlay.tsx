import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SpringIn, ZoomIn } from 'react-native-reanimated';

import { useAppState } from '@/src/hooks/useAppState';

const { width, height } = Dimensions.get('window');

type TourStep = {
  id: string;
  title: string;
  description: string;
  targetScreen: string;
  // Position of the bubble
  bottom?: number;
  top?: number;
  left?: number;
  right?: number;
  // Position of the pointer (relative to screen width)
  pointerLeft?: number;
  pointerRight?: number;
  pointerTop?: boolean; // If true, pointer shows on top of bubble
};

const STEPS: TourStep[] = [
  {
    id: 'dashboard',
    title: 'Financial Command Center',
    description: 'Welcome to your dashboard! Here you can see your total balance across all wallets, track your upcoming salary progress, and monitor your active debts at a glance.',
    targetScreen: 'dashboard',
    bottom: 350,
  },
  {
    id: 'fab',
    title: 'Start Here',
    description: 'Tap this plus button to log your new salary payout, or create a budget plan. This is where your financial planning begins.',
    targetScreen: 'dashboard',
    bottom: 110,
    pointerLeft: (width / 2) + 84, // Points perfectly to the FAB
  },
  {
    id: 'budget',
    title: 'Allocation Plan',
    description: 'Create your master plan. Set where your first-half and second-half salary payouts should go before you even receive them.',
    targetScreen: 'budgetTemplates',
    bottom: 110,
    pointerLeft: (width / 2) + 84, // Points perfectly to the FAB
  },
  {
    id: 'executePlan',
    title: 'Execute with One Tap',
    description: "When your salary arrives, tap on its cycle card here. Inside, you'll find the 'Execute Entire Budget Plan' button to automatically move your money into its target wallets instantly!",
    targetScreen: 'dashboard',
    bottom: 290,
    pointerRight: 40,
  },
  {
    id: 'updateBalance',
    title: 'Keep It Real',
    description: "Don't sweat the small expenses. Once a week, tap 'Update Balance' on your dashboard to tell the app exactly how much money you actually have left. It will automatically detect missing funds and deduct them from your envelopes to keep your budget balanced!",
    targetScreen: 'dashboard',
    top: 500,
    pointerRight: 80,
    pointerTop: true,
  },
  {
    id: 'wallets',
    title: 'Your Wallets',
    description: 'Add your Bank, GCash, Maya, or Physical cash here. See your total balance across all accounts.',
    targetScreen: 'wallets',
    bottom: 110,
    pointerLeft: (width / 2) - 70, // Points perfectly to center Wallets tab
  },
  {
    id: 'transfer',
    title: 'Move Money',
    description: 'Use this when you move money between accounts—like withdrawing from your bank to your wallet.',
    targetScreen: 'transfer',
    bottom: 110,
    pointerLeft: (width / 2) - 70, // Points perfectly to center Wallets tab
  },
  {
    id: 'menu',
    title: 'Menu & Settings',
    description: 'Tap the profile icon to access your full transaction History, manage your Payables, and enter the Security Vault to manage your PIN.',
    targetScreen: 'dashboard',
    top: 65,
    left: 40,
    right: 10,
    pointerRight: 20,
    pointerTop: true,
  },
];

export function FeatureTourOverlay({ navigateTo }: { navigateTo: (screen: any) => void }) {
  const { updateSettings } = useAppState();
  const [stepIndex, setStepIndex] = useState(0);

  const handleNext = () => {
    if (stepIndex < STEPS.length - 1) {
      const nextStep = STEPS[stepIndex + 1];
      navigateTo(nextStep.targetScreen);
      setStepIndex(stepIndex + 1);
    } else {
      navigateTo('dashboard');
      updateSettings({ hasSeenFeatureTour: true });
    }
  };

  const handleEndTour = () => {
    navigateTo('dashboard');
    updateSettings({ hasSeenFeatureTour: true });
  };

  const currentStep = STEPS[stepIndex];

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 999 }]} pointerEvents="box-none">
      {/* Dimmed Backdrop */}
      <Animated.View 
        entering={FadeIn} 
        exiting={FadeOut}
        style={styles.backdrop} 
      />

      {/* Focus Area (Transparent hole - simplified as just a layout marker for now) */}
      
      {/* Speech Bubble */}
      <Animated.View 
        key={currentStep.id}
        entering={ZoomIn.duration(300)}
        style={[
          styles.bubble, 
          currentStep.bottom !== undefined && { bottom: currentStep.bottom },
          currentStep.top !== undefined && { top: currentStep.top },
          { left: currentStep.left ?? 20, right: currentStep.right ?? 20 }
        ]}
      >
        <Text style={styles.title}>{currentStep.title}</Text>
        <Text style={styles.description}>{currentStep.description}</Text>
        
        <View style={styles.footer}>
          <Text style={styles.stepCount}>{stepIndex + 1} of {STEPS.length}</Text>
          <Pressable 
            onPress={handleNext}
            style={({ pressed }) => [styles.nextButton, pressed && styles.nextButtonPressed]}
          >
            <Text style={styles.nextText}>
              {stepIndex === STEPS.length - 1 ? 'Got it!' : 'Next'}
            </Text>
            <MaterialIcons name="chevron-right" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Pointer Triangle */}
        {(currentStep.pointerLeft !== undefined || currentStep.pointerRight !== undefined) && (
          <View 
            style={[
              styles.pointer, 
              currentStep.pointerTop ? styles.pointerTop : styles.pointerBottom,
              currentStep.pointerLeft !== undefined && { left: currentStep.pointerLeft },
              currentStep.pointerRight !== undefined && { right: currentStep.pointerRight },
            ]} 
          />
        )}
      </Animated.View>

      {/* Top Close Button */}
      <Pressable 
        onPress={handleEndTour}
        style={styles.skipContainer}
      >
        <Text style={styles.skipText}>End Tour</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 53, 53, 0.7)',
  },
  bubble: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 20,
  },
  pointer: {
    position: 'absolute',
    width: 24,
    height: 24,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },
  pointerBottom: {
    bottom: -8,
  },
  pointerTop: {
    top: -8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#003535',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#404848',
    lineHeight: 22,
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#707978',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#003535',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 4,
  },
  nextButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  nextText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  skipContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    padding: 10,
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
  },
});
