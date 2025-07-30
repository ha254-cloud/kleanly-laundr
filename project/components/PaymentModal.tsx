import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { X, CreditCard, Smartphone, Banknote } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/Colors';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

const { width } = Dimensions.get('window');

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  total: number;
  onPaymentComplete: (method: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  onClose,
  total,
  onPaymentComplete,
}) => {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [processing, setProcessing] = useState(false);

  const paymentMethods = [
    {
      id: 'mpesa',
      title: 'M-Pesa',
      subtitle: 'Pay with your mobile money',
      icon: <Smartphone size={24} color={colors.success} />,
      color: colors.success,
    },
    {
      id: 'card',
      title: 'Card Payment',
      subtitle: 'Visa, Mastercard, etc.',
      icon: <CreditCard size={24} color={colors.primary} />,
      color: colors.primary,
    },
    {
      id: 'cash',
      title: 'Cash on Delivery',
      subtitle: 'Pay when we deliver',
      icon: <Banknote size={24} color={colors.warning} />,
      color: colors.warning,
    },
  ];

  const handlePayment = async () => {
    if (!selectedMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    if (selectedMethod === 'mpesa' && !mpesaNumber) {
      Alert.alert('Error', 'Please enter your M-Pesa number');
      return;
    }

    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      
      if (selectedMethod === 'mpesa') {
        Alert.alert(
          'M-Pesa Payment',
          `A payment request for KSH ${total.toLocaleString()} has been sent to ${mpesaNumber}. Please complete the payment on your phone.`,
          [
            {
              text: 'OK',
              onPress: () => {
                onPaymentComplete(selectedMethod);
                onClose();
              },
            },
          ]
        );
      } else if (selectedMethod === 'card') {
        Alert.alert(
          'Card Payment',
          'Card payment integration coming soon. For now, please use M-Pesa or Cash on Delivery.',
          [{ text: 'OK' }]
        );
      } else {
        onPaymentComplete(selectedMethod);
        onClose();
      }
    }, 2000);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Payment</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Total Amount */}
          <Card style={styles.totalCard}>
            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
              Total Amount
            </Text>
            <Text style={[styles.totalAmount, { color: colors.primary }]}>
              KSH {total.toLocaleString()}
            </Text>
          </Card>

          {/* Payment Methods */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Choose Payment Method
          </Text>

          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethod,
                {
                  backgroundColor: colors.surface,
                  borderColor: selectedMethod === method.id ? method.color : colors.border,
                  borderWidth: selectedMethod === method.id ? 2 : 1,
                },
              ]}
              onPress={() => setSelectedMethod(method.id)}
            >
              <View style={styles.methodContent}>
                <View style={styles.methodIcon}>
                  {method.icon}
                </View>
                <View style={styles.methodInfo}>
                  <Text style={[styles.methodTitle, { color: colors.text }]}>
                    {method.title}
                  </Text>
                  <Text style={[styles.methodSubtitle, { color: colors.textSecondary }]}>
                    {method.subtitle}
                  </Text>
                </View>
                <View
                  style={[
                    styles.radioButton,
                    {
                      borderColor: selectedMethod === method.id ? method.color : colors.border,
                      backgroundColor: selectedMethod === method.id ? method.color : 'transparent',
                    },
                  ]}
                >
                  {selectedMethod === method.id && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* M-Pesa Number Input */}
          {selectedMethod === 'mpesa' && (
            <Card style={styles.mpesaCard}>
              <Input
                label="M-Pesa Number"
                value={mpesaNumber}
                onChangeText={setMpesaNumber}
                placeholder="+254 700 000 000"
                keyboardType="phone-pad"
              />
            </Card>
          )}

          {/* Payment Button */}
          <Button
            title={
              processing
                ? 'Processing...'
                : selectedMethod === 'cash'
                ? 'Confirm Order'
                : `Pay KSH ${total.toLocaleString()}`
            }
            onPress={handlePayment}
            disabled={!selectedMethod || processing}
            style={styles.payButton}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  totalCard: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 20,
  },
  totalLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  paymentMethod: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  methodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 197, 142, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  methodSubtitle: {
    fontSize: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  mpesaCard: {
    marginTop: 16,
    marginBottom: 16,
  },
  payButton: {
    marginTop: 'auto',
    marginBottom: 20,
  },
});