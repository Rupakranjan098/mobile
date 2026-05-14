import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, ArrowRight } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import { login } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../utils/responsive';



const LoginScreen = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await login({ email, password });
      await AsyncStorage.setItem('token', response.data.access_token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      onLoginSuccess(response.data.user);
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid email or password';
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Decorative background circles (Balls) */}
      <View style={[styles.decorCircle, { top: -50, right: -150, width: 400, height: 400, backgroundColor: 'rgba(34, 197, 94, 0.15)' }]} />
      <View style={[styles.decorCircle, { top: 150, left: -180, width: 350, height: 350, backgroundColor: 'rgba(30, 64, 175, 0.12)' }]} />
      <View style={[styles.decorCircle, { bottom: -100, right: -80, width: 300, height: 300, backgroundColor: 'rgba(34, 197, 94, 0.08)' }]} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Image 
                  source={require('../../assets/logo.png')} 
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.welcomeText}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to manage your business growth</Text>
            </View>

            <View style={styles.glassCard}>
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <View style={styles.inputWrapper}>
                    <Mail size={18} color="#94a3b8" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="name@company.com"
                      placeholderTextColor="#64748b"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.inputWrapper}>
                    <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor="#64748b"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                    />
                  </View>
                  <TouchableOpacity style={styles.forgotPass}>
                    <Text style={styles.forgotPassText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  style={[styles.loginBtn, SHADOW.medium]} 
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <View style={styles.btnContent}>
                      <Text style={styles.loginBtnText}>SIGN IN</Text>
                      <ArrowRight size={18} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>Don't have an account?</Text>
                  <TouchableOpacity onPress={onSwitchToRegister}>
                    <Text style={styles.registerLink}>Register Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20, // Reduced top padding to move everything up
    justifyContent: 'flex-start', // Top aligned
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20, // Tightened header spacing
  },
  logoContainer: {
    width: SCREEN_WIDTH * 0.7,
    height: 100, // Balanced height
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
  glassCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  forgotPass: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  forgotPassText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  loginBtn: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  footerText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  registerLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
  },
});

export default LoginScreen;
