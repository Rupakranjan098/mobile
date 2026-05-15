import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import { login, sendLoginOtp, verifyLoginOtp } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../utils/responsive';



const LoginScreen = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [debugOtp, setDebugOtp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
  const [otpStep, setOtpStep] = useState('request'); // 'request' or 'verify'

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

  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const response = await sendLoginOtp(email);
      if (response.data.debug_otp) {
        setDebugOtp(response.data.debug_otp);
      }
      setOtpStep('verify');
      Alert.alert('Success', 'Login OTP has been sent to your email.');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send OTP. Ensure the email is registered.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await verifyLoginOtp({ email, otp });
      await AsyncStorage.setItem('token', response.data.access_token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      onLoginSuccess(response.data.user);
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid or expired OTP';
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
      
      {/* Decorative background circles */}
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
              {loginMethod === 'password' ? (
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

                  <TouchableOpacity 
                    style={styles.switchMethodBtn}
                    onPress={() => setLoginMethod('otp')}
                  >
                    <Text style={styles.switchMethodText}>Login with OTP instead</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.form}>
                  {debugOtp && (
                    <View style={styles.debugContainer}>
                      <Text style={styles.debugText}>Dev Mode OTP: {debugOtp}</Text>
                    </View>
                  )}
                  {otpStep === 'request' ? (
                    <>
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
                      <TouchableOpacity 
                        style={[styles.loginBtn, SHADOW.medium]} 
                        onPress={handleSendOtp}
                        disabled={loading}
                      >
                        {loading ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <View style={styles.btnContent}>
                            <Text style={styles.loginBtnText}>SEND LOGIN OTP</Text>
                            <ArrowRight size={18} color="#fff" />
                          </View>
                        )}
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>Enter OTP sent to {email}</Text>
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
                        style={[styles.loginBtn, SHADOW.medium]} 
                        onPress={handleVerifyOtp}
                        disabled={loading}
                      >
                        {loading ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <View style={styles.btnContent}>
                            <Text style={styles.loginBtnText}>VERIFY & LOGIN</Text>
                            <ArrowRight size={18} color="#fff" />
                          </View>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.switchMethodBtn}
                        onPress={() => setOtpStep('request')}
                      >
                        <Text style={styles.switchMethodText}>Change Email</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  
                  <TouchableOpacity 
                    style={styles.switchMethodBtn}
                    onPress={() => {
                      setLoginMethod('password');
                      setOtpStep('request');
                      setDebugOtp(null);
                    }}
                  >
                    <Text style={styles.switchMethodText}>Login with Password instead</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account?</Text>
                <TouchableOpacity onPress={onSwitchToRegister}>
                  <Text style={styles.registerLink}>Register Now</Text>
                </TouchableOpacity>
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
    paddingTop: 20,
    justifyContent: 'flex-start',
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
  switchMethodBtn: {
    alignItems: 'center',
    marginTop: 4,
  },
  switchMethodText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
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

export default LoginScreen;
