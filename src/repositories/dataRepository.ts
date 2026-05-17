import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { SemiAppState } from '../domain/types';

/**
 * Exports the current app state to a JSON file and opens the share sheet.
 */
export async function exportAppState(state: SemiAppState) {
  try {
    const fileName = `semi_backup_${new Date().toISOString().split('T')[0]}.json`;
    const jsonContent = JSON.stringify(state, null, 2);

    if (Platform.OS === 'android') {
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      
      if (permissions.granted) {
        try {
          const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            fileName,
            'application/json'
          );
          
          await FileSystem.writeAsStringAsync(fileUri, jsonContent, {
            encoding: 'utf8',
          });
          
          alert('Data exported successfully to your selected folder!');
          return true;
        } catch (e) {
          console.warn('SAF export failed, falling back to share sheet', e);
        }
      }
    }

    // Write to temp directory for sharing (Fallback or iOS)
    const tempUri = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(tempUri, jsonContent, {
      encoding: 'utf8',
    });
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(tempUri, {
        mimeType: 'application/json',
        dialogTitle: 'Export Semi Data',
        UTI: 'public.json',
      });
      // Note: We can't guarantee the user saved it, but we tried.
    } else {
      throw new Error('Sharing is not available on this platform');
    }
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
}

/**
 * Opens a document picker to select a backup file and returns the parsed state.
 */
export async function importAppState(): Promise<SemiAppState | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const fileUri = result.assets[0].uri;
    const content = await FileSystem.readAsStringAsync(fileUri, {
      encoding: 'utf8',
    });

    const parsedState = JSON.parse(content) as SemiAppState;

    // Basic validation to ensure it's a valid Semi backup
    if (!parsedState.wallets || !parsedState.moneyMovements || !parsedState.settings) {
      throw new Error('Invalid backup file: Missing core data structures.');
    }

    return parsedState;
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
}
