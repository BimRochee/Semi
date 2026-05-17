import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { useAppState } from '@/src/hooks/useAppState';
import { formatShortDate } from '@/src/utils/dateUtils';

type SecuritySettingsScreenProps = {
  onNavigateToCreatePin: () => void;
};

export function SecuritySettingsScreen({ onNavigateToCreatePin }: SecuritySettingsScreenProps) {
  const { biometricAvailable, biometricLabel, clearPin, hasPin, state, updateSettings, resetAllData, exportData, importData } =
    useAppState();
  const biometricTitle = `${biometricLabel} Unlock`;
  const biometricCopy = !hasPin
    ? 'Create a PIN first. Biometric unlock is only available as a faster way back into the locked app.'
    : biometricAvailable
      ? `Use ${biometricLabel} to unlock Semi before falling back to your 6-digit PIN.`
      : `No enrolled ${biometricLabel.toLowerCase()} profile is available on this device yet.`;

  const handleResetData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your wallets, salary entries, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear Everything', 
          style: 'destructive',
          onPress: async () => {
            await resetAllData();
            Alert.alert('Data Cleared', 'All app data has been reset to defaults.');
          }
        },
      ]
    );
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      updateSettings({ profilePictureUri: result.assets[0].uri });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.titleText}>Settings</Text>
        <Text style={styles.subtitleText}>
          Manage your profile, preferences, and protect your financial data.
        </Text>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Pressable onPress={handlePickImage} style={styles.profileImageContainer}>
          {state.settings.profilePictureUri ? (
            <Image 
              source={{ uri: state.settings.profilePictureUri }} 
              style={styles.profileImage} 
              contentFit="cover"
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <MaterialIcons name="person" size={40} color="#BFC8C8" />
            </View>
          )}
          <View style={styles.editBadge}>
            <MaterialIcons name="edit" size={14} color="#FFFFFF" />
          </View>
        </Pressable>
        <View style={styles.profileInfo}>
          <View style={styles.nameInputWrapper}>
            <TextInput
              style={styles.profileNameInput}
              value={state.settings.profileName || ''}
              placeholder="Semi User"
              placeholderTextColor="#707978"
              onChangeText={(text) => updateSettings({ profileName: text })}
              maxLength={30}
              returnKeyType="done"
            />
            <MaterialIcons name="edit" size={16} color="#BFC8C8" />
          </View>
          <Text style={styles.profileCopy}>Tap your name or avatar to edit</Text>
        </View>
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <MaterialIcons color="#003535" name="verified-user" size={20} />
        <Text style={styles.infoText}>
          Semi uses device-level encryption. Your PIN is stored securely in the hardware keychain.
        </Text>
      </View>

      <View style={styles.stack}>
        {/* PIN Status Card */}
        <View style={styles.bentoCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconBoxPrimary}>
              <MaterialIcons color="#FFFFFF" name="lock" size={20} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.labelCaps}>PIN STATUS</Text>
              <Text style={styles.cardTitle}>
                {hasPin && state.settings.pinCreatedAt
                  ? `Active since ${formatShortDate(state.settings.pinCreatedAt)}`
                  : 'No PIN set'}
              </Text>
            </View>
          </View>
          {hasPin ? (
            <Pressable
              onPress={clearPin}
              style={({ pressed }) => [styles.dangerButton, pressed && styles.dangerButtonPressed]}>
              <Text style={styles.dangerButtonText}>Reset Security PIN</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={onNavigateToCreatePin}
              style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}>
              <Text style={styles.actionButtonText}>Create Security PIN</Text>
            </Pressable>
          )}
        </View>

        {/* Lock on Background */}
        <View style={styles.bentoCard}>
          <View style={styles.row}>
            <View style={styles.rowLead}>
              <Text style={styles.labelCaps}>IMMEDIATE LOCK</Text>
              <Text style={styles.cardTitle}>Lock on Background</Text>
              <Text style={styles.cardCopy}>
                Require PIN immediately when app leaves foreground.
              </Text>
            </View>
            <Switch
              onValueChange={(value) => updateSettings({ lockOnBackground: value })}
              trackColor={{ false: '#BFC8C8', true: '#003535' }}
              value={state.settings.lockOnBackground}
            />
          </View>
        </View>

        {/* Biometric Unlock */}
        <View style={styles.bentoCard}>
          <View style={styles.row}>
            <View style={styles.rowLead}>
              <Text style={styles.labelCaps}>CONVENIENCE</Text>
              <Text style={styles.cardTitle}>{biometricTitle}</Text>
              <Text style={styles.cardCopy}>{biometricCopy}</Text>
            </View>
            <Switch
              disabled={!hasPin || !biometricAvailable}
              onValueChange={(value) => updateSettings({ biometricUnlockEnabled: value })}
              trackColor={{ false: '#BFC8C8', true: '#003535' }}
              value={state.settings.biometricUnlockEnabled && biometricAvailable}
            />
          </View>
        </View>

        {/* Auto-lock Delay */}
        <View style={styles.bentoCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconBoxSecondary}>
              <MaterialIcons color="#003535" name="timer" size={20} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.labelCaps}>TIMEOUT</Text>
              <Text style={styles.cardTitle}>Auto-lock Delay</Text>
            </View>
          </View>
          <Text style={styles.cardCopy}>How long to wait before locking the app automatically.</Text>
          <View style={styles.pillRow}>
            {[0, 1, 5].map((minutes) => (
              <Pressable
                key={minutes}
                onPress={() => updateSettings({ autoLockMinutes: minutes })}
                style={[
                  styles.pill,
                  state.settings.autoLockMinutes === minutes && styles.pillActive,
                ]}>
                <Text
                  style={[
                    styles.pillText,
                    state.settings.autoLockMinutes === minutes && styles.pillTextActive,
                  ]}>
                  {minutes === 0 ? 'Disabled' : `${minutes} min`}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Backup & Restore */}
        <View style={styles.bentoCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconBoxBackup}>
              <MaterialIcons color="#FFFFFF" name="cloud-upload" size={20} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.labelCaps}>DATA PORTABILITY</Text>
              <Text style={styles.cardTitle}>Backup & Restore</Text>
            </View>
          </View>
          <Text style={styles.cardCopy}>
            Export your data to a JSON file for safekeeping, or restore it from a previous backup.
          </Text>
          <View style={styles.backupActions}>
            <Pressable
              onPress={async () => {
                try {
                  await exportData();
                } catch (e) {
                  Alert.alert('Export Failed', 'Could not export your data.');
                }
              }}
              style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}>
              <MaterialIcons color="#003535" name="file-download" size={20} />
              <Text style={styles.actionButtonText}>Export JSON</Text>
            </Pressable>
            
            <Pressable
              onPress={() => {
                Alert.alert(
                  'Restore Data',
                  'Restoring will overwrite all current local data with the contents of the backup file. Continue?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Restore Now', 
                      style: 'destructive',
                      onPress: async () => {
                        try {
                          await importData();
                          Alert.alert('Success', 'Data restored successfully.');
                        } catch (e) {
                          Alert.alert('Import Failed', 'The selected file is not a valid Semi backup.');
                        }
                      }
                    },
                  ]
                );
              }}
              style={({ pressed }) => [styles.actionButtonOutlined, pressed && styles.actionButtonPressed]}>
              <MaterialIcons color="#003535" name="file-upload" size={20} />
              <Text style={styles.actionButtonTextOutlined}>Import JSON</Text>
            </Pressable>
          </View>
        </View>
        {/* Help & Guidance */}
        <View style={styles.bentoCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconBoxHelp}>
              <MaterialIcons color="#003535" name="help-outline" size={20} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.labelCaps}>RESOURCES</Text>
              <Text style={styles.cardTitle}>App Guidance</Text>
            </View>
          </View>
          <Text style={styles.cardCopy}>
            Want to see the feature tour again? This will re-launch the onboarding walkthrough.
          </Text>
          <Pressable
            onPress={() => updateSettings({ hasSeenFeatureTour: false })}
            style={({ pressed }) => [styles.actionButtonOutlined, pressed && styles.actionButtonPressed]}>
            <MaterialIcons color="#003535" name="auto-fix-high" size={20} />
            <Text style={styles.actionButtonTextOutlined}>Launch Feature Tour</Text>
          </Pressable>
        </View>

        {/* Danger Zone */}
        <View style={[styles.bentoCard, styles.dangerCard]}>
          <Text style={styles.dangerTitle}>DANGER ZONE</Text>
          <Text style={styles.cardCopy}>
            Permanently delete all your local data including wallets, history, and templates.
          </Text>
          <Pressable
            onPress={handleResetData}
            style={({ pressed }) => [styles.dangerButtonOutlined, pressed && styles.dangerButtonPressed]}>
            <MaterialIcons color="#BA1A1A" name="delete-forever" size={20} />
            <Text style={styles.dangerButtonTextOutlined}>Factory Reset App</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 160,
    backgroundColor: '#F8F9FF',
  },
  titleSection: {
    marginBottom: 32,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#003535',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 14,
    color: '#404848',
    lineHeight: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFC8C8',
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF4FF',
  },
  profileImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DCE6FF',
  },
  editBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#003535',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#EFF4FF',
    paddingBottom: 2,
  },
  profileNameInput: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0D1C2F',
    padding: 0,
    margin: 0,
    flex: 1,
  },
  profileCopy: {
    fontSize: 13,
    color: '#707978',
  },
  infoBanner: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#EFF4FF',
    borderWidth: 1,
    borderColor: '#BFC8C8',
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#003535',
    fontWeight: '500',
    lineHeight: 20,
  },
  stack: {
    gap: 16,
  },
  bentoCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BFC8C8',
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  dangerCard: {
    borderColor: '#FFDAD6',
    backgroundColor: '#FFF8F7',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBoxPrimary: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#003535',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxSecondary: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#B4EDEC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  labelCaps: {
    fontSize: 10,
    fontWeight: '700',
    color: '#707978',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  dangerTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#BA1A1A',
    letterSpacing: 1.5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0D1C2F',
  },
  cardCopy: {
    fontSize: 13,
    color: '#404848',
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  rowLead: {
    flex: 1,
    gap: 4,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8F9FF',
    borderWidth: 1,
    borderColor: '#BFC8C8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: '#003535',
    borderColor: '#003535',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#404848',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  dangerButton: {
    backgroundColor: '#FFDAD6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  dangerButtonOutlined: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BA1A1A',
  },
  dangerButtonPressed: {
    opacity: 0.8,
    backgroundColor: '#FFDAD6',
  },
  dangerButtonText: {
    color: '#BA1A1A',
    fontSize: 14,
    fontWeight: '700',
  },
  dangerButtonTextOutlined: {
    color: '#BA1A1A',
    fontSize: 15,
    fontWeight: '700',
  },
  iconBoxBackup: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#004B4B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backupActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#B4EDEC',
    paddingVertical: 14,
    borderRadius: 14,
  },
  actionButtonOutlined: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#B4EDEC',
    paddingVertical: 14,
    borderRadius: 14,
  },
  actionButtonPressed: {
    opacity: 0.7,
  },
  actionButtonText: {
    color: '#003535',
    fontSize: 14,
    fontWeight: '700',
  },
  actionButtonTextOutlined: {
    color: '#003535',
    fontSize: 14,
    fontWeight: '700',
  },
  iconBoxHelp: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EFF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
