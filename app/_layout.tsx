import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Alert, Platform } from 'react-native';

import { AppProvider } from '../src/state/AppProvider';

// Global Web compatibility shim for Alert.alert
if (Platform.OS === 'web') {
  Alert.alert = (title: string, message?: string, buttons?: any[]) => {
    if (buttons && buttons.length > 0) {
      if (buttons.length === 2 && (buttons[0].style === 'cancel' || buttons[1].style === 'cancel')) {
        const proceed = window.confirm(`${title}\n\n${message ?? ''}`);
        if (proceed) {
          const okBtn = buttons.find(b => b.style !== 'cancel') || buttons[0];
          if (okBtn.onPress) okBtn.onPress();
        } else {
          const cancelBtn = buttons.find(b => b.style === 'cancel');
          if (cancelBtn && cancelBtn.onPress) cancelBtn.onPress();
        }
      } else {
        const promptMsg = `${title}\n\n${message ?? ''}\n\nEnter the number of your choice:\n` +
          buttons.map((b, i) => `${i + 1}: ${b.text}`).join('\n');
        const choice = window.prompt(promptMsg);
        if (choice !== null) {
          const index = parseInt(choice, 10) - 1;
          if (index >= 0 && index < buttons.length) {
            const btn = buttons[index];
            if (btn.onPress) btn.onPress();
          }
        }
      }
    } else {
      window.alert(`${title}\n\n${message ?? ''}`);
    }
  };
}

export default function RootLayout() {
  return (
    <AppProvider>
      <ThemeProvider value={DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
    </AppProvider>
  );
}
