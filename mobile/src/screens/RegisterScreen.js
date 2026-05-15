import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, User, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import { register, verifyOtp } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { SCREEN_WIDTH } from '../utils/responsive';
import { useTheme } from '../context/ThemeContext';

const RegisterScreen = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const { isDark, colors } = useTheme();
  const [step, setStep] = useState('register');
  const [otp, setOtp] = useState('');
  const [debugOtp, setDebugOtp] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const { name, email, password, password_confirmation } = formData;
    if (!name || !email || !password || !password_confirmation) { Alert.alert('Error', 'Please fill all fields'); return; }
    if (password !== password_confirmation) { Alert.alert('Error', 'Passwords do not match'); return; }
    if (password.length < 8) { Alert.alert('Error', 'Password must be at least 8 characters'); return; }

    setLoading(true);
    try {
      const response = await register(formData);
      if (response.data.debug_otp) setDebugOtp(response.data.debug_otp);
      setStep('otp');
      Alert.alert('Success', 'OTP sent to your email.');
    } catch (error) {
      Alert.alert('Registration Error', error.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) { Alert.alert('Error', 'Invalid OTP'); return; }
    setLoading(true);
    try {
      const response = await verifyOtp({ ...formData, otp });
      await AsyncStorage.setItem('token', response.data.access_token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      onRegisterSuccess(response.data.user);
    } catch (error) {
      Alert.alert('Verification Failed', 'Invalid or expired OTP');
    } finally { setLoading(false); }
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <LinearGradient colors={isDark ? ['#0f172a', '#1e293b'] : ['#f8fafc', '#f1f5f9']} style={StyleSheet.absoluteFill} />
      <View style={[styles.decorCircle, { top: -80, left: -120, width: 400, height: 400, backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.08)' }]} />
      <View style={[styles.decorCircle, { top: 200, right: -150, width: 350, height: 350, backgroundColor: isDark ? 'rgba(30, 64, 175, 0.12)' : 'rgba(30, 64, 175, 0.06)' }]} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <View style={styles.logoContainer}><Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" /></View>
              <Text style={[styles.welcomeText, { color: colors.text }]}>{step === 'register' ? 'Create Account' : 'Verify Email'}</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>{step === 'register' ? 'Start your business journey today' : `Enter code sent to ${formData.email}`}</Text>
            </View>

            <View style={[styles.glassCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {step === 'register' ? (
                <View style={styles.form}>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.textMuted }]}>Full Name</Text>
                    <View style={[styles.inputWrapper, { backgroundColor: colors.glass, borderColor: colors.border }]}>
                      <User size={18} color={colors.textMuted} style={styles.inputIcon} />
                      <TextInput style={[styles.input, { color: colors.text }]} placeholder="John Doe" placeholderTextColor={isDark ? '#64748b' : '#94a3b8'} value={formData.name} onChangeText={(val) => setFormData({...formData, name: val})} />
                    </View>
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.textMuted }]}>Email Address</Text>
                    <View style={[styles.inputWrapper, { backgroundColor: colors.glass, borderColor: colors.border }]}>
                      <Mail size={18} color={colors.textMuted} style={styles.inputIcon} />
                      <TextInput style={[styles.input, { color: colors.text }]} placeholder="name@company.com" placeholderTextColor={isDark ? '#64748b' : '#94a3b8'} value={formData.email} onChangeText={(val) => setFormData({...formData, email: val})} keyboardType="email-address" autoCapitalize="none" />
                    </View>
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.textMuted }]}>Password</Text>
                    <View style={[styles.inputWrapper, { backgroundColor: colors.glass, borderColor: colors.border }]}>
                      <Lock size={18} color={colors.textMuted} style={styles.inputIcon} />
                      <TextInput style={[styles.input, { color: colors.text }]} placeholder="Create a password" placeholderTextColor={isDark ? '#64748b' : '#94a3b8'} value={formData.password} onChangeText={(val) => setFormData({...formData, password: val})} secureTextEntry />
                    </View>
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.textMuted }]}>Confirm Password</Text>
                    <View style={[styles.inputWrapper, { backgroundColor: colors.glass, borderColor: colors.border }]}>
                      <Lock size={18} color={colors.textMuted} style={styles.inputIcon} />
                      <TextInput style={[styles.input, { color: colors.text }]} placeholder="Confirm password" placeholderTextColor={isDark ? '#64748b' : '#94a3b8'} value={formData.password_confirmation} onChangeText={(val) => setFormData({...formData, password_confirmation: val})} secureTextEntry />
                    </View>
                  </View>
                  <TouchableOpacity style={[styles.registerBtn, SHADOW.medium]} onPress={handleRegister} disabled={loading}>{loading ? <ActivityIndicator color="#fff" /> : <View style={styles.btnContent}><Text style={styles.registerBtnText}>SEND OTP</Text><ArrowRight size={18} color="#fff" /></View>}</TouchableOpacity>
                  <View style={styles.footer}><Text style={[styles.footerText, { color: colors.textMuted }]}>Already have an account?</Text><TouchableOpacity onPress={onSwitchToLogin}><Text style={styles.loginLink}>Login Now</Text></TouchableOpacity></View>
                </View>
              ) : (
                <View style={styles.form}>
                  {debugOtp && <View style={styles.debugContainer}><Text style={styles.debugText}>Dev Mode OTP: {debugOtp}</Text></View>}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.textMuted }]}>Verification Code</Text>
                    <View style={[styles.inputWrapper, { backgroundColor: colors.glass, borderColor: colors.border }]}>
                      <ShieldCheck size={18} color={colors.textMuted} style={styles.inputIcon} />
                      <TextInput style={[styles.input, { color: colors.text }]} placeholder="123456" placeholderTextColor={isDark ? '#64748b' : '#94a3b8'} value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} />
                    </View>
                  </View>
                  <TouchableOpacity style={[styles.registerBtn, SHADOW.medium]} onPress={handleVerifyOtp} disabled={loading}>{loading ? <ActivityIndicator color="#fff" /> : <View style={styles.btnContent}><Text style={styles.registerBtnText}>VERIFY & LOGIN</Text><ArrowRight size={18} color="#fff" /></View>}</TouchableOpacity>
                  <TouchableOpacity style={styles.backBtn} onPress={() => setStep('register')}><ArrowLeft size={16} color={colors.textMuted} /><Text style={[styles.backBtnText, { color: colors.textMuted }]}>Back to Registration</Text></TouchableOpacity>
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
  mainContainer: { flex: 1 },
  safeArea: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  decorCircle: { position: 'absolute', borderRadius: 999 },
  header: { alignItems: 'center', marginBottom: 20 },
  logoContainer: { width: SCREEN_WIDTH * 0.7, height: 100, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  logo: { width: '100%', height: '100%' },
  welcomeText: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, marginTop: 4, textAlign: 'center' },
  glassCard: { borderRadius: 32, padding: 24, borderWidth: 1, overflow: 'hidden' },
  form: { gap: 16 },
  inputGroup: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', marginLeft: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, height: 52 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 15 },
  registerBtn: { backgroundColor: COLORS.primary, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  btnContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  registerBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 10 },
  footerText: { fontSize: 14 },
  loginLink: { fontSize: 14, color: COLORS.primary, fontWeight: '700' },
  backBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10 },
  backBtnText: { fontSize: 14, fontWeight: '600' },
  debugContainer: { backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.2)', marginBottom: 8 },
  debugText: { color: '#4ade80', fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
});

export default RegisterScreen;
