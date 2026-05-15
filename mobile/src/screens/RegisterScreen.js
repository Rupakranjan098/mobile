import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, User, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import { register, verifyOtp } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { SCREEN_WIDTH } from '../utils/responsive';



const RegisterScreen = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [step, setStep] = useState('register'); // 'register' or 'otp'
  const [otp, setOtp] = useState('');
  const [debugOtp, setDebugOtp] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const { name, email, password, password_confirmation } = formData;
    if (!name || !email || !password || !password_confirmation) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (password !== password_confirmation) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await register(formData);
      if (response.data.debug_otp) {
        setDebugOtp(response.data.debug_otp);
      }
      setStep('otp');
      Alert.alert('Success', 'OTP has been sent to your email. Please check your inbox.');
    } catch (error) {
      let message = 'Registration failed. Please try again.';
      
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        message = Object.values(errors).flat().join('\n');
      } else if (error.response?.data) {
        const data = error.response.data;
        message = typeof data.message === 'string' ? data.message : Object.values(data).filter(v => Array.isArray(v)).flat().join('\n') || message;
      }
      
      Alert.alert('Registration Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOtp({
        ...formData,
        otp: otp
      });
      
      await AsyncStorage.setItem('token', response.data.access_token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      onRegisterSuccess(response.data.user);
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid or expired OTP. Please try again.';
      Alert.alert('Verification Failed', message);
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
      <View style={[styles.decorCircle, { top: -80, left: -120, width: 400, height: 400, backgroundColor: 'rgba(34, 197, 94, 0.15)' }]} />
      <View style={[styles.decorCircle, { top: 200, right: -150, width: 350, height: 350, backgroundColor: 'rgba(30, 64, 175, 0.12)' }]} />
      <View style={[styles.decorCircle, { bottom: -120, left: -100, width: 300, height: 300, backgroundColor: 'rgba(34, 197, 94, 0.08)' }]} />

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
              <Text style={styles.welcomeText}>
                {step === 'register' ? 'Create Account' : 'Verify Email'}
              </Text>
              <Text style={styles.subtitle}>
                {step === 'register' ? 'Start your business journey today' : `Enter the 6-digit code sent to ${formData.email}`}
              </Text>
            </View>

            <View style={styles.glassCard}>
              {step === 'register' ? (
                <View style={styles.form}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Full Name</Text>
                    <View style={styles.inputWrapper}>
                      <User size={18} color="#94a3b8" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="John Doe"
                        placeholderTextColor="#64748b"
                        value={formData.name}
                        onChangeText={(val) => setFormData({...formData, name: val})}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email Address</Text>
                    <View style={styles.inputWrapper}>
                      <Mail size={18} color="#94a3b8" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="name@company.com"
                        placeholderTextColor="#64748b"
                        value={formData.email}
                        onChangeText={(val) => setFormData({...formData, email: val})}
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
                        placeholder="Create a password"
                        placeholderTextColor="#64748b"
                        value={formData.password}
                        onChangeText={(val) => setFormData({...formData, password: val})}
                        secureTextEntry
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Confirm Password</Text>
                    <View style={styles.inputWrapper}>
                      <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Confirm your password"
                        placeholderTextColor="#64748b"
                        value={formData.password_confirmation}
                        onChangeText={(val) => setFormData({...formData, password_confirmation: val})}
                        secureTextEntry
                      />
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={[styles.registerBtn, SHADOW.medium]} 
                    onPress={handleRegister}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <View style={styles.btnContent}>
                        <Text style={styles.registerBtnText}>SEND OTP</Text>
                        <ArrowRight size={18} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>

                  <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account?</Text>
                    <TouchableOpacity onPress={onSwitchToLogin}>
                      <Text style={styles.loginLink}>Login Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.form}>
                  {debugOtp && (
                    <View style={styles.debugContainer}>
                      <Text style={styles.debugText}>Dev Mode OTP: {debugOtp}</Text>
                    </View>
                  )}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Verification Code</Text>
                    <View style={styles.inputWrapper}>
                      <ShieldCheck size={18} color="#94a3b8" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="123456"
                        placeholderTextColor="#64748b"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                        maxLength={6}
                      />
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={[styles.registerBtn, SHADOW.medium]} 
                    onPress={handleVerifyOtp}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <View style={styles.btnContent}>
                        <Text style={styles.registerBtnText}>VERIFY & LOGIN</Text>
                        <ArrowRight size={18} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.backBtn}
                    onPress={() => setStep('register')}
                  >
                    <ArrowLeft size={16} color="#94a3b8" />
                    <Text style={styles.backBtnText}>Back to Registration</Text>
                  </TouchableOpacity>
                </View>
              )}
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    width: SCREEN_WIDTH * 0.7,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  welcomeText: {
    fontSize: 26,
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
    fontSize: 13,
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
    height: 52,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
  },
  registerBtn: {
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
  registerBtnText: {
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
  loginLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  backBtnText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
  },
  debugContainer: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    marginBottom: 8,
  },
  debugText: {
    color: '#4ade80',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default RegisterScreen;
