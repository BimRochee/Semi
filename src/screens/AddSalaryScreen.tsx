import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppState } from '@/src/hooks/useAppState';
import { useSalary } from '@/src/hooks/useSalary';
import { formatCurrency } from '@/src/utils/formatCurrency';

type AddSalaryScreenProps = {
  onSaved: (salaryEntryId: string) => void;
};

const SOURCE_PRESETS = ['Payroll', 'Freelance', 'Bonus', 'Allowance'];

export function AddSalaryScreen({ onSaved }: AddSalaryScreenProps) {
  const { state } = useAppState();
  const { addSalary } = useSalary();
  const [selectedWalletId, setSelectedWalletId] = useState(state.wallets[0]?.id ?? '');
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('Payroll');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const selectedWallet = state.wallets.find((wallet) => wallet.id === selectedWalletId);
  const numericAmount = Number(amount);
  const parsedAmount = Number.isFinite(numericAmount) ? numericAmount : 0;

  const sourceLabel = useMemo(() => {
    if (!source.trim()) {
      return 'Income Source';
    }

    return source.trim();
  }, [source]);

  const handleSave = () => {
    if (!selectedWalletId || !numericAmount || numericAmount <= 0) {
      setError('Enter a valid wallet and amount.');
      return;
    }

    const salaryEntryId = addSalary({
      walletId: selectedWalletId,
      amount: numericAmount,
      source: source.trim() || 'Payroll',
      note: note.trim() || undefined,
    });

    setAmount('');
    setNote('');
    setError(null);
    onSaved(salaryEntryId);
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Add Salary</Text>

      <View style={styles.heroCard}>
        <MaterialIcons
          color="rgba(255,255,255,0.12)"
          name="payments"
          size={110}
          style={styles.heroPattern}
        />
        <View style={styles.heroContent}>
          <Text style={styles.heroKicker}>Salary Preview</Text>
          <Text style={styles.heroValue}>
            {parsedAmount > 0 ? formatCurrency(parsedAmount) : '₱0.00'}
          </Text>
          <View style={styles.heroMetaRow}>
            <HeroMeta
              label="Source"
              value={sourceLabel}
            />
            <HeroMeta
              label="Wallet"
              value={selectedWallet?.name ?? 'Select wallet'}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.blockTitle}>Destination Wallet</Text>
        <View style={styles.walletGrid}>
          {state.wallets.map((wallet) => {
            const active = selectedWalletId === wallet.id;

            return (
              <Pressable
                key={wallet.id}
                onPress={() => setSelectedWalletId(wallet.id)}
                style={({ pressed }) => [
                  styles.walletCard,
                  active && styles.walletCardActive,
                  pressed && styles.cardPressed,
                ]}>
                <View style={styles.walletCardTop}>
                  <View style={[styles.walletIconWrap, walletIconPalette(wallet.name).background]}>
                    <MaterialIcons
                      color={walletIconPalette(wallet.name).color}
                      name={walletIconPalette(wallet.name).icon}
                      size={22}
                    />
                  </View>
                  {active ? <MaterialIcons color="#FFFFFF" name="check-circle" size={18} /> : null}
                </View>
                <Text style={[styles.walletName, active && styles.walletNameActive]}>{wallet.name}</Text>
                <Text style={[styles.walletType, active && styles.walletTypeActive]}>{wallet.type}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.formCard}>
        <View style={styles.field}>
          <Text style={styles.label}>Amount</Text>
          <TextInput
            keyboardType="decimal-pad"
            onChangeText={(value) => {
              setError(null);
              setAmount(value);
            }}
            placeholder="5000"
            placeholderTextColor="#8A9392"
            style={styles.amountInput}
            value={amount}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Source</Text>
          <View style={styles.presetRow}>
            {SOURCE_PRESETS.map((preset) => {
              const active = source.trim().toLowerCase() === preset.toLowerCase();

              return (
                <Pressable
                  key={preset}
                  onPress={() => {
                    setError(null);
                    setSource(preset);
                  }}
                  style={({ pressed }) => [
                    styles.presetChip,
                    active && styles.presetChipActive,
                    pressed && styles.cardPressed,
                  ]}>
                  <Text style={[styles.presetChipLabel, active && styles.presetChipLabelActive]}>
                    {preset}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <TextInput
            onChangeText={(value) => {
              setError(null);
              setSource(value);
            }}
            placeholder="Payroll"
            placeholderTextColor="#8A9392"
            style={styles.textInput}
            value={source}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Note</Text>
          <TextInput
            multiline
            onChangeText={setNote}
            placeholder="Optional note for this salary entry"
            placeholderTextColor="#8A9392"
            style={[styles.textInput, styles.noteInput]}
            textAlignVertical="top"
            value={note}
          />
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoIconWrap}>
          <MaterialIcons color="#456646" name="account-balance-wallet" size={20} />
        </View>
        <View style={styles.infoCopy}>
          <Text style={styles.infoTitle}>Ledger impact</Text>
          <Text style={styles.infoText}>
            Saving this creates one salary entry and one income movement. Wallet balances update from the ledger, not from a manually edited balance field.
          </Text>
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        onPress={handleSave}
        style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}>
        <MaterialIcons color="#FFFFFF" name="add-task" size={20} />
        <Text style={styles.primaryButtonText}>Save salary to ledger</Text>
      </Pressable>
    </ScrollView>
  );
}

function HeroMeta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.heroMeta}>
      <Text style={styles.heroMetaLabel}>{label}</Text>
      <Text style={styles.heroMetaValue}>{value}</Text>
    </View>
  );
}

function walletIconPalette(walletName: string) {
  if (/gcash/i.test(walletName)) {
    return {
      icon: 'account-balance-wallet' as const,
      color: '#246EE9',
      background: styles.walletIconBlue,
    };
  }

  if (/maya|savings/i.test(walletName)) {
    return {
      icon: 'savings' as const,
      color: '#006A14',
      background: styles.walletIconGreen,
    };
  }

  if (/cash/i.test(walletName)) {
    return {
      icon: 'payments' as const,
      color: '#404848',
      background: styles.walletIconNeutral,
    };
  }

  return {
    icon: 'account-balance' as const,
    color: '#003535',
    background: styles.walletIconPrimary,
  };
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 132,
    gap: 16,
  },
  sectionTitle: {
    color: '#0D1C2F',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  },
  heroCard: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#003535',
    borderRadius: 18,
    padding: 20,
  },
  heroPattern: {
    position: 'absolute',
    right: -6,
    top: -8,
  },
  heroContent: {
    zIndex: 1,
  },
  heroKicker: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.3,
  },
  heroValue: {
    marginTop: 6,
    color: '#FFFFFF',
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  heroMetaRow: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.18)',
    flexDirection: 'row',
    gap: 12,
  },
  heroMeta: {
    flex: 1,
  },
  heroMetaLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroMetaValue: {
    marginTop: 4,
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
  section: {
    gap: 12,
  },
  blockTitle: {
    color: '#0D1C2F',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  },
  walletGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  walletCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFC8C8',
    padding: 14,
    gap: 12,
  },
  walletCardActive: {
    backgroundColor: '#0D4D4D',
    borderColor: '#0D4D4D',
  },
  walletCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  walletIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletIconBlue: {
    backgroundColor: 'rgba(36,110,233,0.1)',
  },
  walletIconGreen: {
    backgroundColor: 'rgba(0,255,41,0.1)',
  },
  walletIconNeutral: {
    backgroundColor: '#E6EEFF',
  },
  walletIconPrimary: {
    backgroundColor: 'rgba(13,77,77,0.1)',
  },
  walletName: {
    color: '#0D1C2F',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  walletNameActive: {
    color: '#FFFFFF',
  },
  walletType: {
    color: '#5B6464',
    fontSize: 13,
    lineHeight: 18,
  },
  walletTypeActive: {
    color: 'rgba(255,255,255,0.72)',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#BFC8C8',
    padding: 18,
    gap: 18,
  },
  field: {
    gap: 10,
  },
  label: {
    color: '#0D1C2F',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  amountInput: {
    backgroundColor: '#EFF4FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D5E3FD',
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: '#003535',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D5E3FD',
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#0D1C2F',
    fontSize: 15,
    lineHeight: 20,
  },
  noteInput: {
    minHeight: 96,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  presetChip: {
    borderRadius: 999,
    backgroundColor: '#E6EEFF',
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  presetChipActive: {
    backgroundColor: '#C6EDC4',
  },
  presetChipLabel: {
    color: '#003535',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  presetChipLabelActive: {
    color: '#4B6C4C',
  },
  infoCard: {
    backgroundColor: '#C6EDC4',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C6EDC4',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(1,33,8,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCopy: {
    flex: 1,
    gap: 4,
  },
  infoTitle: {
    color: '#2E4E30',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  infoText: {
    color: '#2E4E30',
    fontSize: 14,
    lineHeight: 20,
  },
  error: {
    color: '#BA1A1A',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#003535',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryButtonPressed: {
    opacity: 0.88,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  cardPressed: {
    opacity: 0.9,
  },
});
