import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/Colors';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Logo } from '../components/ui/Logo';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const { login, register, loading } = useAuth();
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
        router.replace('/(tabs)');
      } else {
        await register(email, password);
        router.replace('/(tabs)');
      }
    } catch (error) {
      let errorMessage = '';
      
      if (error && typeof error === 'object' && 'code' in error) {
        const knownAuthErrors = [
          'auth/invalid-credential',
          'auth/user-not-found',
          'auth/wrong-password',
          'auth/email-already-in-use',
          'auth/weak-password',
          'auth/invalid-email',
          'auth/operation-not-allowed'
        ];
        
        // Only log unexpected errors to console
        if (!knownAuthErrors.includes(error.code)) {
          console.error('Unexpected auth error:', error);
        }
        
        switch (error.code) {
          case 'auth/invalid-credential':
            errorMessage = 'Invalid email or password. Please check your credentials.';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'Email/Password sign-in is not enabled. Please contact support.';
            break;
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email address.';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password. Please try again.';
            break;
          case 'auth/email-already-in-use':
            errorMessage = 'An account with this email already exists.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password is too weak. Please choose a stronger password.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
          default:
            errorMessage = isLogin 
              ? 'Failed to login. Please try again.' 
              : 'Failed to create account. Please try again.';
        }
      } else {
        // Log unexpected error types
        console.error('Unexpected auth error:', error);
        errorMessage = isLogin 
          ? 'Failed to login. Please try again.' 
          : 'Failed to create account. Please try again.';
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  if (loading) {
    return <LoadingSpinner text={isLogin ? 'Signing in...' : 'Creating account...'} />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Logo size="large" showText={true} />
              <View style={[styles.logoGlow, { backgroundColor: colors.primary + '20' }]} />
            </View>
            <Text style={[styles.tagline, { color: colors.textSecondary }]}>
              Premium Laundry & Dry Cleaning
            </Text>
          </View>

          {/* Login Form */}
          <Card style={styles.formCard}>
            <Text style={[styles.formTitle, { color: colors.text }]}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </Text>
            <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>
              {isLogin 
                ? 'Sign in to your account' 
                : 'Join Kleanly for premium laundry services'
              }
            </Text>

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
            />

            {!isLogin && (
              <Input
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                secureTextEntry
              />
            )}

            <Button
              title={isLogin ? 'Sign In' : 'Create Account'}
              onPress={handleSubmit}
              style={styles.submitButton}
            />

            <View style={styles.switchMode}>
              <Text style={[styles.switchText, { color: colors.textSecondary }]}>
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
              </Text>
              <Button
                title={isLogin ? 'Sign Up' : 'Sign In'}
                onPress={() => setIsLogin(!isLogin)}
                variant="outline"
                size="small"
                style={styles.switchButton}
              />
            </View>
          </Card>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.3,
    zIndex: -1,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '500',
  },
  formCard: {
    padding: 24,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  switchMode: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  switchText: {
    fontSize: 14,
  },
  switchButton: {
    paddingHorizontal: 16,
  },
});