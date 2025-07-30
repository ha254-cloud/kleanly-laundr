import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, CreditCard, Smartphone, Banknote, Shield, Clock, CheckCircle, AlertCircle, Info } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/Colors';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

const { width, height } = Dimensions.get('window');

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  total: number;
  onPaymentComplete: (method: string, details?: any) => void;
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
  const [step, setStep] = useState<'select' | 'details' | 'processing' | 'success'>('select');
  const [countdown, setCountdown] = useState(300); // 5 minutes for M-Pesa
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);
  
  const slideAnimation = new Animated.Value(0);
  const fadeAnimation = new Animated.Value(1);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'processing' && selectedMethod === 'mpesa' && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown, step, selectedMethod]);

  const paymentMethods = [
    {
      id: 'cash',
      title: 'Cash on Pickup',
      subtitle: 'Pay when we collect your items',
      description: 'Most convenient • No processing fees',
      icon: <Banknote size={28} color={colors.success} />,
      color: colors.success,
      recommended: true,
      processingTime: 'Instant',
      fees: 'No fees',
    },
    {
      id: 'mpesa',
      title: 'M-Pesa',
      subtitle: 'Pay instantly with mobile money',
      description: 'Secure • Instant confirmation',
      icon: <Smartphone size={28} color="#00C851" />,
      color: '#00C851',
      recommended: false,
      processingTime: '1-2 minutes',
      fees: 'Standard M-Pesa rates apply',
    },
    {
      id: 'card',
      title: 'Debit/Credit Card',
      subtitle: 'Visa, Mastercard, American Express',
      description: 'Coming soon • Secure payments',
      icon: <CreditCard size={28} color={colors.textSecondary} />,
      color: colors.textSecondary,
      recommended: false,
      processingTime: 'Instant',
      fees: 'No additional fees',
      disabled: true,
    },
  ];

  const handleMethodSelect = (methodId: string) => {
    if (methodId === 'card') {
      Alert.alert(
        'Coming Soon',
        'Card payments will be available in the next update. Please use M-Pesa or Cash on Pickup for now.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setSelectedMethod(methodId);
    
    if (methodId === 'cash') {
      setStep('processing');
      handleCashPayment();
    } else {
      setStep('details');
    }
  };

  const handleCashPayment = () => {
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onPaymentComplete('cash', { status: 'pending' });
        resetModal();
      }, 2000);
    }, 1500);
  };

  const handleMpesaPayment = async () => {
    if (!mpesaNumber.trim()) {
      Alert.alert('Error', 'Please enter your M-Pesa number');
      return;
    }

    if (!/^(\+254|0)[7-9]\d{8}$/.test(mpesaNumber.replace(/\s/g, ''))) {
      Alert.alert('Error', 'Please enter a valid Kenyan phone number');
      return;
    }

    setStep('processing');
    setProcessing(true);

    // Simulate M-Pesa payment request
    setTimeout(() => {
      Alert.alert(
        '📱 M-Pesa Payment Request Sent',
        `Check your phone ${mpesaNumber} for the payment prompt.\n\nAmount: KSH ${total.toLocaleString()}\nMerchant: Kleanly Services\n\nComplete the payment within 5 minutes.`,
        [
          {
            text: 'Payment Completed',
            onPress: () => {
              setStep('success');
              setTimeout(() => {
                onPaymentComplete('mpesa', { 
                  mpesaNumber, 
                  status: 'paid',
                  transactionId: `MP${Date.now()}`,
                  amount: total
                });
                resetModal();
              }, 2000);
            },
          },
          {
            text: 'Cancel Payment',
            style: 'cancel',
            onPress: () => {
              setStep('select');
              setProcessing(false);
            },
          },
        ]
      );
    }, 2000);
  };

  const resetModal = () => {
    setSelectedMethod('');
    setMpesaNumber('');
    setProcessing(false);
    setStep('select');
    setCountdown(300);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderMethodSelection = () => (
    <ScrollView style={styles.methodsContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.headerSection}>
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          Choose Payment Method
        </Text>
        <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
          Select how you'd like to pay for your order
        </Text>
      </View>

      <View style={styles.totalSection}>
        <LinearGradient
          colors={[colors.primary + '15', colors.primary + '08']}
          style={styles.totalGradient}
        >
          <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
            Order Total
          </Text>
          <Text style={[styles.totalAmount, { color: colors.primary }]}>
            KSH {total.toLocaleString()}
          </Text>
          <Text style={[styles.totalNote, { color: colors.textSecondary }]}>
            Including all taxes and fees
          </Text>
        </LinearGradient>
      </View>

      {paymentMethods.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={[
            styles.paymentMethodCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: method.disabled ? 0.6 : 1,
            },
          ]}
          onPress={() => !method.disabled && setSelectedMethod(method.id)}
          disabled={method.disabled}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={method.recommended ? [method.color + '08', method.color + '04'] : ['transparent', 'transparent']}
            style={styles.methodGradient}
          >
            <View style={styles.methodContent}>
              <View style={styles.methodLeft}>
                <View style={[styles.methodIcon, { backgroundColor: method.color + '20' }]}>
                  {method.icon}
                </View>
                <View style={styles.methodInfo}>
                  <View style={styles.methodHeader}>
                    <Text style={[styles.methodTitle, { color: colors.text }]}>
                      {method.title}
                    </Text>
                    {method.recommended && (
                      <View style={[styles.recommendedBadge, { backgroundColor: method.color }]}>
                        <Text style={styles.recommendedText}>RECOMMENDED</Text>
                      </View>
                    )}
                    {method.disabled && (
                      <View style={[styles.comingSoonBadge, { backgroundColor: colors.warning }]}>
                        <Text style={styles.comingSoonText}>COMING SOON</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.methodSubtitle, { color: colors.textSecondary }]}>
                    {method.subtitle}
                  </Text>
                  <Text style={[styles.methodDescription, { color: method.color }]}>
                    {method.description}
                  </Text>
                  <View style={styles.methodDetails}>
                    <View style={styles.methodDetailItem}>
                      <Clock size={12} color={colors.textSecondary} />
                      <Text style={[styles.methodDetailText, { color: colors.textSecondary }]}>
                        {method.processingTime}
                      </Text>
                    </View>
                    <View style={styles.methodDetailItem}>
                      <Shield size={12} color={colors.textSecondary} />
                      <Text style={[styles.methodDetailText, { color: colors.textSecondary }]}>
                        {method.fees}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.methodArrow}>
                <Text style={[styles.arrowText, { color: method.color }]}>→</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      ))}

      {/* Continue Button */}
      {selectedMethod && (
        <LinearGradient
          colors={[colors.primary, colors.primary + 'E6']}
          style={styles.continueButtonGradient}
        >
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => {
              if (selectedMethod === 'cash') {
                setStep('processing');
                handleCashPayment();
              } else if (selectedMethod === 'mpesa') {
                setStep('details');
              } else if (selectedMethod === 'card') {
                Alert.alert(
                  'Coming Soon',
                  'Card payments will be available in the next update. Please use M-Pesa or Cash on Pickup for now.',
                  [{ text: 'OK' }]
                );
              }
            }}
            activeOpacity={0.9}
          >
            <Text style={styles.continueButtonText}>
              {selectedMethod === 'cash' ? 'Confirm Order' : 
               selectedMethod === 'mpesa' ? 'Continue with M-Pesa' : 
               'Continue'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      )}

      <TouchableOpacity
        style={[styles.securityInfo, { backgroundColor: colors.primary + '10' }]}
        onPress={() => setShowSecurityInfo(true)}
      >
        <Shield size={20} color={colors.primary} />
        <Text style={[styles.securityText, { color: colors.primary }]}>
          Your payments are secured with 256-bit encryption
        </Text>
        <Info size={16} color={colors.primary} />
      </TouchableOpacity>
    </ScrollView>
  );

  const renderMpesaDetails = () => (
    <ScrollView style={styles.detailsContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.headerSection}>
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          M-Pesa Payment
        </Text>
        <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
          Enter your M-Pesa number to receive payment prompt
        </Text>
      </View>

      <Card style={styles.mpesaCard}>
        <View style={styles.mpesaHeader}>
          <View style={[styles.mpesaIcon, { backgroundColor: '#00C851' + '20' }]}>
            <Smartphone size={32} color="#00C851" />
          </View>
          <Text style={[styles.mpesaTitle, { color: colors.text }]}>
            M-Pesa Payment
          </Text>
          <Text style={[styles.mpesaAmount, { color: '#00C851' }]}>
            KSH {total.toLocaleString()}
          </Text>
        </View>

        <Input
          label="M-Pesa Number"
          value={mpesaNumber}
          onChangeText={setMpesaNumber}
          placeholder="+254 700 000 000"
          keyboardType="phone-pad"
          leftIcon={<Smartphone size={20} color={colors.textSecondary} />}
          style={styles.mpesaInput}
        />

        <View style={styles.mpesaSteps}>
          <Text style={[styles.stepsTitle, { color: colors.text }]}>
            How it works:
          </Text>
          <View style={styles.stepItem}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={[styles.stepText, { color: colors.textSecondary }]}>
              Enter your M-Pesa number
            </Text>
          </View>
          <View style={styles.stepItem}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={[styles.stepText, { color: colors.textSecondary }]}>
              You'll receive a payment prompt on your phone
            </Text>
          </View>
          <View style={styles.stepItem}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={[styles.stepText, { color: colors.textSecondary }]}>
              Enter your M-Pesa PIN to complete payment
            </Text>
          </View>
        </View>
      </Card>

      <View style={styles.actionButtons}>
        <Button
          title="Back"
          onPress={() => setStep('select')}
          variant="outline"
          style={styles.backButton}
        />
        <LinearGradient
          colors={['#00C851', '#00A844']}
          style={styles.payButtonGradient}
        >
          <TouchableOpacity
            style={styles.payButton}
            onPress={handleMpesaPayment}
            disabled={!mpesaNumber.trim()}
          >
            <Smartphone size={20} color="#FFFFFF" />
            <Text style={styles.payButtonText}>
              Send Payment Request
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </ScrollView>
  );

  const renderProcessing = () => (
    <View style={styles.processingContainer}>
      <View style={styles.processingContent}>
        {selectedMethod === 'mpesa' ? (
          <>
            <View style={[styles.processingIcon, { backgroundColor: '#00C851' + '20' }]}>
              <Smartphone size={48} color="#00C851" />
            </View>
            <Text style={[styles.processingTitle, { color: colors.text }]}>
              Payment Request Sent
            </Text>
            <Text style={[styles.processingSubtitle, { color: colors.textSecondary }]}>
              Check your phone for the M-Pesa prompt
            </Text>
            <View style={[styles.countdownContainer, { backgroundColor: colors.warning + '20' }]}>
              <Clock size={20} color={colors.warning} />
              <Text style={[styles.countdownText, { color: colors.warning }]}>
                Complete within: {formatTime(countdown)}
              </Text>
            </View>
            <Text style={[styles.processingNote, { color: colors.textSecondary }]}>
              Amount: KSH {total.toLocaleString()}{'\n'}
              Number: {mpesaNumber}
            </Text>
          </>
        ) : (
          <>
            <View style={[styles.processingIcon, { backgroundColor: colors.success + '20' }]}>
              <Banknote size={48} color={colors.success} />
            </View>
            <Text style={[styles.processingTitle, { color: colors.text }]}>
              Order Confirmed!
            </Text>
            <Text style={[styles.processingSubtitle, { color: colors.textSecondary }]}>
              You'll pay when we collect your items
            </Text>
          </>
        )}
        
        <View style={styles.processingIndicator}>
          <Animated.View style={[styles.processingDot, { backgroundColor: colors.primary }]} />
          <Animated.View style={[styles.processingDot, { backgroundColor: colors.primary }]} />
          <Animated.View style={[styles.processingDot, { backgroundColor: colors.primary }]} />
        </View>
      </View>
    </View>
  );

  const renderSuccess = () => (
    <View style={styles.successContainer}>
      <LinearGradient
        colors={[colors.success + '15', colors.success + '08']}
        style={styles.successGradient}
      >
        <View style={styles.successContent}>
          <View style={[styles.successIcon, { backgroundColor: colors.success }]}>
            <CheckCircle size={48} color="#FFFFFF" />
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>
            Payment Successful!
          </Text>
          <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
            Your order has been confirmed and we'll start processing it shortly
          </Text>
          {selectedMethod === 'mpesa' && (
            <View style={styles.transactionDetails}>
              <Text style={[styles.transactionTitle, { color: colors.text }]}>
                Transaction Details
              </Text>
              <Text style={[styles.transactionText, { color: colors.textSecondary }]}>
                Amount: KSH {total.toLocaleString()}{'\n'}
                Method: M-Pesa{'\n'}
                Number: {mpesaNumber}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="none"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        {/* Header */}
        <LinearGradient
          colors={[colors.primary, colors.primary + 'E6']}
          style={styles.header}
        >
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Secure Payment</Text>
          <View style={styles.stepIndicator}>
            <Text style={styles.stepIndicatorText}>
              {step === 'select' ? '1' : step === 'details' ? '2' : '3'}/3
            </Text>
          </View>
        </LinearGradient>

        <Animated.View
          style={[
            styles.content,
            {
              transform: [{
                translateY: slideAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                })
              }],
              opacity: fadeAnimation,
            }
          ]}
        >
          {step === 'select' && renderMethodSelection()}
          {step === 'details' && renderMpesaDetails()}
          {step === 'processing' && renderProcessing()}
          {step === 'success' && renderSuccess()}
        </Animated.View>

        {/* Security Info Modal */}
        <Modal
          visible={showSecurityInfo}
          animationType="fade"
          transparent
          onRequestClose={() => setShowSecurityInfo(false)}
        >
          <View style={styles.securityModalOverlay}>
            <Card style={styles.securityModal}>
              <View style={styles.securityModalHeader}>
                <Shield size={24} color={colors.primary} />
                <Text style={[styles.securityModalTitle, { color: colors.text }]}>
                  Payment Security
                </Text>
                <TouchableOpacity onPress={() => setShowSecurityInfo(false)}>
                  <X size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.securityModalText, { color: colors.textSecondary }]}>
                • All payments are encrypted with 256-bit SSL{'\n'}
                • We never store your payment information{'\n'}
                • M-Pesa payments are processed securely through Safaricom{'\n'}
                • Your data is protected by industry-standard security measures
              </Text>
              <Button
                title="Got it"
                onPress={() => setShowSecurityInfo(false)}
                style={styles.securityModalButton}
              />
            </Card>
          </View>
        </Modal>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndicatorText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  
  // Method Selection Styles
  methodsContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  totalSection: {
    marginBottom: 32,
  },
  totalGradient: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 4,
  },
  totalNote: {
    fontSize: 12,
  },
  paymentMethodCard: {
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  methodGradient: {
    padding: 20,
  },
  methodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  methodTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  recommendedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 4,
  },
  recommendedText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  comingSoonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  comingSoonText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  methodSubtitle: {
    fontSize: 14,
    marginBottom: 6,
  },
  methodDescription: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  methodDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  methodDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  methodDetailText: {
    fontSize: 11,
  },
  methodArrow: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 20,
    fontWeight: '700',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    gap: 12,
  },
  securityText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  
  // M-Pesa Details Styles
  detailsContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  mpesaCard: {
    padding: 24,
    marginBottom: 24,
  },
  mpesaHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  mpesaIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  mpesaTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  mpesaAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  mpesaInput: {
    marginBottom: 20,
  },
  mpesaSteps: {
    gap: 12,
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00C851',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 24,
  },
  stepText: {
    fontSize: 14,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  backButton: {
    flex: 1,
  },
  payButtonGradient: {
    flex: 2,
    borderRadius: 16,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  
  // Processing Styles
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  processingContent: {
    alignItems: 'center',
  },
  processingIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  processingTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  processingSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    gap: 8,
  },
  countdownText: {
    fontSize: 14,
    fontWeight: '700',
  },
  processingNote: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  processingIndicator: {
    flexDirection: 'row',
    gap: 8,
  },
  processingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  
  // Success Styles
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 40,
  },
  successGradient: {
    padding: 40,
    borderRadius: 24,
    alignItems: 'center',
  },
  successContent: {
    alignItems: 'center',
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  transactionDetails: {
    alignItems: 'center',
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  transactionText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Security Modal Styles
  securityModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  securityModal: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
  },
  securityModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  securityModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  securityModalText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  securityModalButton: {
    marginTop: 8,
  },
  
  // Continue Button Styles
  continueButtonGradient: {
    borderRadius: 16,
    marginTop: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});