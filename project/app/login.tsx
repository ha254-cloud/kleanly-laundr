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
  ImageBackground,
  Dimensions,
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

const bgImage = require('../assets/images/space.jpg');

const { width } = Dimensions.get('window');

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
        if (typeof error.code !== 'string' || !knownAuthErrors.includes(error.code)) {
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
    <ImageBackground
      source={bgImage}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.gradientOverlay} />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <View style={styles.logoContainer}>
                <Logo size="large" showText={true} />
                <View style={[styles.logoGlow, { backgroundColor: colors.primary + '30' }]} />
              </View>
              <Text style={styles.tagline}>
                Premium Laundry & Dry Cleaning
              </Text>
            </View>

            {/* Login Form */}
            <View style={styles.glassCard}>
              <Text style={styles.formTitle}>
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </Text>
              <Text style={styles.formSubtitle}>
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
                <Text style={styles.switchText}>
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
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    backgroundColor: 'rgba(30,30,40,0.35)',
    // Modern glassmorphism gradient
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  container: {
    flex: 1,
    zIndex: 2,
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
    marginBottom: 28,
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
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '600',
    letterSpacing: 1,
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 8,
    opacity: 0.92,
  },
  glassCard: {
    padding: 28,
    marginBottom: 20,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    backdropFilter: 'blur(12px)', // For web, ignored on native
    elevation: 8,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 8,
    opacity: 0.95,
  },
  formSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    color: '#f3f3f3',
    opacity: 0.85,
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
    color: '#fff',
    opacity: 0.85,
  },
  switchButton: {
    paddingHorizontal: 16,
  },
});