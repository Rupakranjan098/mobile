import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert, Platform, Switch } from 'react-native';
// import * as Notifications from 'expo-notifications'; // Moved to dynamic require to avoid Expo Go warnings
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User as UserIcon, Briefcase, Users, RefreshCw, CreditCard, Bell, Settings, HelpCircle, LogOut, ChevronRight, X, Sparkles, Moon, Sun, Check, Mail } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVER_URL } from '../config';
import * as ImagePicker from 'expo-image-picker';
import { getBusinessProfile, updateBusinessProfile, getMe, updateProfile, syncData, getAppSettings, updateAppSettings } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const SettingsItem = ({ icon: Icon, label, value, color, onClick }) => (
  <TouchableOpacity style={styles.settingsItem} onPress={onClick}>
    <View style={styles.settingsIconLabel}>
      <View style={[styles.iconWrapper, { backgroundColor: color + '15' }]}>
        <Icon size={18} color={color} />
      </View>
      <Text style={[styles.settingsLabel, { color: color }]}>{label}</Text>
    </View>
    <View style={styles.settingsValueArrow}>
      {value && <Text style={styles.settingsValue}>{value}</Text>}
      <ChevronRight size={16} color="#475569" />
    </View>
  </TouchableOpacity>
);

const SettingsScreen = ({ navigation, onLogout }) => {
  const { theme, toggleTheme, isDark, colors } = useTheme();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);

  const [accountData, setAccountData] = useState({ name: '', email: '', password: '' });
  const [appSettings, setAppSettings] = useState({ email_notifications: true, push_notifications: true, language: 'en', theme: 'dark' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userRes, profileRes, settingsRes] = await Promise.all([
        getMe(),
        getBusinessProfile(),
        getAppSettings(),
      ]);

      setUser(userRes.data);
      setAccountData({ name: userRes.data.name, email: userRes.data.email, password: '' });
      setProfile(profileRes.data);
      setAppSettings(settingsRes.data);
      
      await AsyncStorage.setItem('user', JSON.stringify(userRes.data));
    } catch (error) {
      console.error('Error loading settings data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setLoading(true);
      const res = await syncData();
      setUser(res.data.user);
      await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
      Alert.alert('Success', 'Cloud Backup completed!');
    } catch (error) {
      Alert.alert('Error', 'Sync failed.');
    } finally {
      setLoading(false);
    }
  };

  const formatLastSync = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const saveAccount = async () => {
    try {
      setLoading(true);
      const res = await updateProfile(accountData);
      setUser(res.data.user);
      await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
      setAccountModalVisible(false);
      Alert.alert('Success', 'Account updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update account');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationToggle = async (key, value) => {
    const newSettings = { ...appSettings, [key]: value };
    setAppSettings(newSettings);
    try {
      if (key === 'push_notifications' && value === true) {
        // Handle Expo Go limitations for remote notifications
        if (Platform.OS === 'android' && Constants.executionEnvironment === 'storeClient') {
          Alert.alert(
            'Expo Go Limitation',
            'Remote push notifications are not supported in Expo Go on Android. Please use a development build for full notification support.'
          );
          setAppSettings({ ...newSettings, push_notifications: false });
          return;
        }

        const Notifications = require('expo-notifications');
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          Alert.alert('Permission Required', 'Please enable notifications in your phone settings.');
          setAppSettings({ ...newSettings, push_notifications: false });
          return;
        }
      }
      if (key === 'theme') {
        toggleTheme(value);
      }
      await updateAppSettings({ [key]: value });
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  const logoUri = profile?.logo_url
    ? `${SERVER_URL}${profile.logo_url}`
    : `https://ui-avatars.com/api/?name=${profile?.name || 'Business'}&background=22c55e&color=fff`;

  if (loading && !profile) {
    return (
      <View style={[styles.mainContainer, { justifyContent: 'center', backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <LinearGradient colors={isDark ? ['#0f172a', '#1e293b'] : ['#f8fafc', '#f1f5f9']} style={StyleSheet.absoluteFill} />
      <View style={[styles.decorCircle, { top: -80, right: -120, width: 400, height: 400, backgroundColor: isDark ? 'rgba(34, 197, 94, 0.08)' : 'rgba(34, 197, 94, 0.05)' }]} />
      <View style={[styles.decorCircle, { bottom: 0, left: -100, width: 300, height: 300, backgroundColor: isDark ? 'rgba(30, 64, 175, 0.06)' : 'rgba(30, 64, 175, 0.03)' }]} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>More</Text>
            <View style={styles.badge}>
              <Sparkles size={14} color={COLORS.primary} />
              <Text style={styles.badgeText}>PREMIUM</Text>
            </View>
          </View>

          <TouchableOpacity style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => navigation.navigate('BusinessProfile')}>
            <View style={styles.profileInfo}>
              <View style={styles.profileAvatar}>
                <Image source={{ uri: logoUri }} style={styles.avatarImg} />
              </View>
              <View style={styles.profileDetails}>
                <Text style={[styles.profileName, { color: colors.text }]}>{profile?.name || 'Business Name'}</Text>
                <Text style={[styles.profileEmail, { color: colors.textMuted }]}>{profile?.gstin || 'No GSTIN'}</Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>ACCOUNT & SYNC</Text>
          <View style={[styles.settingsGroup, { backgroundColor: colors.glass, borderColor: colors.border }]}>
            <SettingsItem icon={Briefcase} label="Business Profile" color={colors.text} onClick={() => navigation.navigate('BusinessProfile')} />
            <SettingsItem icon={Users} label="User Details" value={user?.name} color={colors.text} onClick={() => setAccountModalVisible(true)} />
            <SettingsItem icon={RefreshCw} label="Cloud Backup" value={formatLastSync(user?.last_sync_at)} color={colors.text} onClick={handleSync} />
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>SUBSCRIPTION</Text>
          <View style={[styles.settingsGroup, { backgroundColor: colors.glass, borderColor: colors.border }]}>
            <SettingsItem icon={CreditCard} label="Plan Details" value={user?.subscription_plan?.name || 'Free'} color={COLORS.primary} onClick={() => navigation.navigate('Plans')} />
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>PREFERENCES</Text>
          <View style={[styles.settingsGroup, { backgroundColor: colors.glass, borderColor: colors.border }]}>
            <SettingsItem icon={Bell} label="Notifications" color={colors.text} onClick={() => setNotifModalVisible(true)} />
            <SettingsItem 
              icon={appSettings.theme === 'dark' ? Moon : Sun} 
              label="Appearance" 
              value={appSettings.theme === 'dark' ? 'Dark Mode' : 'Light Mode'} 
              color={colors.text}
              onClick={() => setThemeModalVisible(true)} 
            />
            <SettingsItem icon={HelpCircle} label="Help & Support Center" color={colors.text} onClick={() => navigation.navigate('SupportCenter')} />
            <SettingsItem icon={Mail} label="Contact Us Directly" color={colors.text} onClick={() => navigation.navigate('ContactUs')} />
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <LogOut size={18} color="#f87171" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>

          <View style={styles.appInfo}>
            <Text style={[styles.versionText, { color: colors.textMuted }]}>ProGst Mobile v2.0.4</Text>
            <Text style={[styles.copyrightText, { color: colors.textMuted, opacity: 0.5 }]}>© 2026 Rupakranjan098</Text>
          </View>
          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Account Details Modal */}
      <Modal visible={accountModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Account Details</Text>
              <TouchableOpacity onPress={() => setAccountModalVisible(false)}><X size={24} color={colors.textMuted} /></TouchableOpacity>
            </View>
            <ScrollView>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Full Name</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={accountData.name} onChangeText={(t) => setAccountData({...accountData, name: t})} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Email</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={accountData.email} editable={false} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>New Password (Optional)</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={accountData.password} onChangeText={(t) => setAccountData({...accountData, password: t})} secureTextEntry />
              </View>
              <TouchableOpacity style={styles.saveBtn} onPress={saveAccount}><Text style={styles.saveBtnText}>UPDATE ACCOUNT</Text></TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal visible={notifModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Notifications</Text>
              <TouchableOpacity onPress={() => setNotifModalVisible(false)}><X size={24} color={colors.textMuted} /></TouchableOpacity>
            </View>
            <View style={styles.notifItem}>
              <View style={styles.notifInfo}>
                <Text style={[styles.notifTitle, { color: colors.text }]}>Push Notifications</Text>
                <Text style={[styles.notifDesc, { color: colors.textMuted }]}>Receive instant alerts for invoices and stock.</Text>
              </View>
              <Switch value={appSettings.push_notifications} onValueChange={(v) => handleNotificationToggle('push_notifications', v)} trackColor={{ false: '#334155', true: COLORS.primary }} thumbColor="#fff" />
            </View>
            <View style={styles.notifItem}>
              <View style={styles.notifInfo}>
                <Text style={[styles.notifTitle, { color: colors.text }]}>Email Notifications</Text>
                <Text style={[styles.notifDesc, { color: colors.textMuted }]}>Get weekly reports and billing info via email.</Text>
              </View>
              <Switch value={appSettings.email_notifications} onValueChange={(v) => handleNotificationToggle('email_notifications', v)} trackColor={{ false: '#334155', true: COLORS.primary }} thumbColor="#fff" />
            </View>
          </View>
        </View>
      </Modal>

      {/* Theme Modal */}
      <Modal visible={themeModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Appearance</Text>
              <TouchableOpacity onPress={() => setThemeModalVisible(false)}><X size={24} color={colors.textMuted} /></TouchableOpacity>
            </View>
            <TouchableOpacity style={[styles.themeOption, appSettings.theme === 'light' && styles.themeOptionActive, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f1f5f9' }]} onPress={() => { handleNotificationToggle('theme', 'light'); setThemeModalVisible(false); }}>
              <Sun size={20} color="#f59e0b" /><Text style={[styles.themeOptionTitle, { color: colors.text, flex: 1, marginLeft: 12 }]}>Light Mode</Text>
              {appSettings.theme === 'light' && <Check size={20} color={COLORS.primary} />}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.themeOption, appSettings.theme === 'dark' && styles.themeOptionActive, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f1f5f9' }]} onPress={() => { handleNotificationToggle('theme', 'dark'); setThemeModalVisible(false); }}>
              <Moon size={20} color="#818cf8" /><Text style={[styles.themeOptionTitle, { color: colors.text, flex: 1, marginLeft: 12 }]}>Dark Mode</Text>
              {appSettings.theme === 'dark' && <Check size={20} color={COLORS.primary} />}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  safeArea: { flex: 1 },
  decorCircle: { position: 'absolute', borderRadius: 999 },
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 8 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(34, 197, 94, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 6, borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.2)' },
  badgeText: { color: COLORS.primary, fontSize: 10, fontWeight: '900' },
  profileCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 24, borderWidth: 1, marginBottom: 24 },
  profileInfo: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  profileAvatar: { width: 60, height: 60, borderRadius: 30, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)' },
  avatarImg: { width: '100%', height: '100%' },
  profileDetails: { gap: 2 },
  profileName: { fontSize: 18, fontWeight: '800' },
  profileEmail: { fontSize: 12, fontWeight: '600' },
  sectionLabel: { fontSize: 11, fontWeight: '800', marginLeft: 16, marginBottom: 8, letterSpacing: 1 },
  settingsGroup: { borderRadius: 24, borderWidth: 1, overflow: 'hidden', marginBottom: 24 },
  settingsItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.03)' },
  iconWrapper: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  settingsIconLabel: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingsLabel: { fontSize: 14, fontWeight: '700' },
  settingsValueArrow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  settingsValue: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)', marginTop: 8 },
  logoutText: { color: '#f87171', fontWeight: '800', fontSize: 15 },
  appInfo: { alignItems: 'center', marginTop: 40, gap: 4 },
  versionText: { fontSize: 12, fontWeight: '700' },
  copyrightText: { fontSize: 10, fontWeight: '600' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: '800' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 8, marginLeft: 4 },
  input: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, height: 52, fontSize: 15 },
  saveBtn: { backgroundColor: COLORS.primary, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 1 },
  notifItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' },
  notifInfo: { flex: 1, paddingRight: 16 },
  notifTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  notifDesc: { fontSize: 13, lineHeight: 18 },
  themeOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: 'transparent' },
  themeOptionActive: { borderColor: COLORS.primary + '40' },
  themeOptionTitle: { fontSize: 16, fontWeight: '700' },
});

export default SettingsScreen;
