import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import { login, sendLoginOtp, verifyLoginOtp } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../utils/responsive';
import { useTheme } from '../context/ThemeContext';

const LoginScreen = ({ onLoginSuccess, onSwitchToRegister }) => {
  const { isDark, colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [debugOtp, setDebugOtp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState('password');
  const [otpStep, setOtpStep] = useState('request');

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Error', 'Please fill all fields'); return; }
    setLoading(true);
    try {
      const response = await login({ email, password });
      await AsyncStorage.setItem('token', response.data.access_token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      onLoginSuccess(response.data.user);
    } catch (error) {
      Alert.alert('Login Failed', error.response?.data?.message || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  const handleSendOtp = async () => {
    if (!email) { Alert.alert('Error', 'Please enter your email'); return; }
    setLoading(true);
    try {
      const response = await sendLoginOtp(email);
      if (response.data.debug_otp) setDebugOtp(response.data.debug_otp);
      setOtpStep('verify');
      Alert.alert('Success', 'Login OTP has been sent to your email.');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP.');
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) { Alert.alert('Error', 'Please enter a 6-digit OTP'); return; }
    setLoading(true);
    try {
      const response = await verifyLoginOtp({ email, otp });
      await AsyncStorage.setItem('token', response.data.access_token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      onLoginSuccess(response.data.user);
    } catch (error) {
      Alert.alert('Verification Failed', error.response?.data?.message || 'Invalid or expired OTP');
    } finally { setLoading(false); }
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <LinearGradient colors={isDark ? ['#0f172a', '#1e293b'] : ['#f8fafc', '#f1f5f9']} style={StyleSheet.absoluteFill} />
      <View style={[styles.decorCircle, { top: -50, right: -150, width: 400, height: 400, backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.08)' }]} />
      <View style={[styles.decorCircle, { top: 150, left: -180, width: 350, height: 350, backgroundColor: isDark ? 'rgba(30, 64, 175, 0.12)' : 'rgba(30, 64, 175, 0.06)' }]} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <View style={styles.logoContainer}><Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" /></View>
              <Text style={[styles.welcomeText, { color: colors.text }]}>Welcome Back</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>Sign in to manage your business growth</Text>
            </View>

            <View style={[styles.glassCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.form}>
                {loginMethod === 'password' ? (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={[styles.label, { color: colors.textMuted }]}>Email Address</Text>
                      <View style={[styles.inputWrapper, { backgroundColor: colors.glass, borderColor: colors.border }]}>
                        <Mail size={18} color={colors.textMuted} style={styles.inputIcon} />
                        <TextInput style={[styles.input, { color: colors.text }]} placeholder="name@company.com" placeholderTextColor={isDark ? '#64748b' : '#94a3b8'} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                      </View>
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={[styles.label, { color: colors.textMuted }]}>Password</Text>
                      <View style={[styles.inputWrapper, { backgroundColor: colors.glass, borderColor: colors.border }]}>
                        <Lock size={18} color={colors.textMuted} style={styles.inputIcon} />
                        <TextInput style={[styles.input, { color: colors.text }]} placeholder="••••••••" placeholderTextColor={isDark ? '#64748b' : '#94a3b8'} value={password} onChangeText={setPassword} secureTextEntry />
                      </View>
                    </View>
                    <TouchableOpacity style={[styles.loginBtn, SHADOW.medium]} onPress={handleLogin} disabled={loading}>{loading ? <ActivityIndicator color="#fff" /> : <View style={styles.btnContent}><Text style={styles.loginBtnText}>SIGN IN</Text><ArrowRight size={18} color="#fff" /></View>}</TouchableOpacity>
                    <TouchableOpacity style={styles.switchMethodBtn} onPress={() => setLoginMethod('otp')}><Text style={styles.switchMethodText}>Login with OTP instead</Text></TouchableOpacity>
                  </>
                ) : (
                  <>
                    {debugOtp && <View style={styles.debugContainer}><Text style={styles.debugText}>Dev Mode OTP: {debugOtp}</Text></View>}
                    {otpStep === 'request' ? (
                      <>
                        <View style={styles.inputGroup}>
                          <Text style={[styles.label, { color: colors.textMuted }]}>Email Address</Text>
                          <View style={[styles.inputWrapper, { backgroundColor: colors.glass, borderColor: colors.border }]}>
                            <Mail size={18} color={colors.textMuted} style={styles.inputIcon} />
                            <TextInput style={[styles.input, { color: colors.text }]} placeholder="name@company.com" placeholderTextColor={isDark ? '#64748b' : '#94a3b8'} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                          </View>
                        </View>
                        <TouchableOpacity style={[styles.loginBtn, SHADOW.medium]} onPress={handleSendOtp} disabled={loading}>{loading ? <ActivityIndicator color="#fff" /> : <View style={styles.btnContent}><Text style={styles.loginBtnText}>SEND OTP</Text><ArrowRight size={18} color="#fff" /></View>}</TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <View style={styles.inputGroup}>
                          <Text style={[styles.label, { color: colors.textMuted }]}>OTP Code</Text>
                          <View style={[styles.inputWrapper, { backgroundColor: colors.glass, borderColor: colors.border }]}>
                            <ShieldCheck size={18} color={colors.textMuted} style={styles.inputIcon} />
                            <TextInput style={[styles.input, { color: colors.text }]} placeholder="123456" placeholderTextColor={isDark ? '#64748b' : '#94a3b8'} value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} />
                          </View>
                        </View>
                        <TouchableOpacity style={[styles.loginBtn, SHADOW.medium]} onPress={handleVerifyOtp} disabled={loading}>{loading ? <ActivityIndicator color="#fff" /> : <View style={styles.btnContent}><Text style={styles.loginBtnText}>VERIFY & LOGIN</Text><ArrowRight size={18} color="#fff" /></View>}</TouchableOpacity>
                        <TouchableOpacity style={styles.switchMethodBtn} onPress={() => setOtpStep('request')}><Text style={styles.switchMethodText}>Change Email</Text></TouchableOpacity>
                      </>
                    )}
                    <TouchableOpacity style={styles.switchMethodBtn} onPress={() => { setLoginMethod('password'); setOtpStep('request'); setDebugOtp(null); }}><Text style={styles.switchMethodText}>Login with Password</Text></TouchableOpacity>
                  </>
                )}
              </View>
              <View style={styles.footer}><Text style={[styles.footerText, { color: colors.textMuted }]}>Don't have an account?</Text><TouchableOpacity onPress={onSwitchToRegister}><Text style={styles.registerLink}>Register Now</Text></TouchableOpacity></View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  safeArea: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 20, justifyContent: 'flex-start' },
  decorCircle: { position: 'absolute', borderRadius: 999 },
  header: { alignItems: 'center', marginBottom: 20 },
  logoContainer: { width: SCREEN_WIDTH * 0.7, height: 100, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  logo: { width: '100%', height: '100%' },
  welcomeText: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, marginTop: 4, textAlign: 'center' },
  glassCard: { borderRadius: 32, padding: 24, borderWidth: 1, overflow: 'hidden' },
  form: { gap: 16 },
  inputGroup: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', marginLeft: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, height: 56 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16 },
  loginBtn: { backgroundColor: COLORS.primary, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  btnContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  switchMethodBtn: { alignItems: 'center', marginTop: 4 },
  switchMethodText: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 },
  footerText: { fontSize: 14 },
  registerLink: { fontSize: 14, color: COLORS.primary, fontWeight: '700' },
  debugContainer: { backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.2)', marginBottom: 8 },
  debugText: { color: '#4ade80', fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
});

export default LoginScreen;
