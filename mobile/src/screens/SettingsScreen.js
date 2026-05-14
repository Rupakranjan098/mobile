import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert, Platform, Switch, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User as UserIcon, Briefcase, Users, RefreshCw, CreditCard, Bell, Settings, HelpCircle, LogOut, ChevronRight, X, Sparkles } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVER_URL } from '../config';
import * as ImagePicker from 'expo-image-picker';
import { getBusinessProfile, updateBusinessProfile, getMe, updateProfile, getSubscriptionPlans, subscribe, syncData, getAppSettings, updateAppSettings, getFAQs, getSupportContact } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { scale, moderateScale, verticalScale } from '../utils/responsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SettingsItem = ({ icon: Icon, label, value, color = '#94a3b8', onClick }) => (
  <TouchableOpacity style={styles.settingsItem} onPress={onClick}>
    <View style={styles.settingsIconLabel}>
      <View style={[styles.iconWrapper, { backgroundColor: color + '15' }]}>
        <Icon size={18} color={color} />
      </View>
      <Text style={styles.settingsLabel}>{label}</Text>
    </View>
    <View style={styles.settingsValueArrow}>
      {value && <Text style={styles.settingsValue}>{value}</Text>}
      <ChevronRight size={16} color="#475569" />
    </View>
  </TouchableOpacity>
);

const SettingsScreen = ({ onLogout }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [plansModalVisible, setPlansModalVisible] = useState(false);

  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [supportModalVisible, setSupportModalVisible] = useState(false);

  const [editData, setEditData] = useState({ name: '', gstin: '', address: '' });
  const [accountData, setAccountData] = useState({ name: '', email: '', password: '' });
  const [appSettings, setAppSettings] = useState({ email_notifications: true, push_notifications: true, language: 'en', theme: 'dark' });
  const [plans, setPlans] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [supportContact, setSupportContact] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userRes, profileRes, plansRes, settingsRes, faqRes, supportRes] = await Promise.all([
        getMe(),
        getBusinessProfile(),
        getSubscriptionPlans(),
        getAppSettings(),
        getFAQs(),
        getSupportContact()
      ]);

      setUser(userRes.data);
      setAccountData({ name: userRes.data.name, email: userRes.data.email, password: '' });

      setProfile(profileRes.data);
      setEditData({ name: profileRes.data.name, gstin: profileRes.data.gstin, address: profileRes.data.address });

      setPlans(plansRes.data);
      setAppSettings(settingsRes.data);
      setFaqs(faqRes.data);
      setSupportContact(supportRes.data);

      await AsyncStorage.setItem('user', JSON.stringify(userRes.data));
    } catch (error) {
      console.error('Error loading settings data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {
    try {
      setLoading(true);
      const res = await subscribe(planId);
      setUser(res.data.user);
      await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
      setPlansModalVisible(false);
      Alert.alert('Success', `Subscribed successfully!`);
    } catch (error) {
      Alert.alert('Error', 'Subscription failed.');
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

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      uploadLogo(result.assets[0].uri);
    }
  };

  const uploadLogo = async (uri) => {
    const formData = new FormData();
    formData.append('logo', {
      uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
      type: 'image/jpeg',
      name: 'logo.jpg',
    });
    formData.append('name', profile?.name || 'My Business');

    try {
      setLoading(true);
      const res = await updateBusinessProfile(formData);
      setProfile(res.data);
      Alert.alert('Success', 'Logo updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to upload logo');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setLoading(true);
      const res = await updateBusinessProfile(editData);
      setProfile(res.data);
      setModalVisible(false);
      Alert.alert('Success', 'Profile updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
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

  const logoUri = profile?.logo_url
    ? `${SERVER_URL}${profile.logo_url}`
    : `https://ui-avatars.com/api/?name=${profile?.name || 'Business'}&background=22c55e&color=fff`;

  if (loading && !profile) {
    return (
      <View style={[styles.mainContainer, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />
      <View style={[styles.decorCircle, { top: -80, right: -120, width: 400, height: 400, backgroundColor: 'rgba(34, 197, 94, 0.08)' }]} />
      <View style={[styles.decorCircle, { bottom: 0, left: -100, width: 300, height: 300, backgroundColor: 'rgba(30, 64, 175, 0.06)' }]} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>More</Text>
            <View style={styles.badge}>
              <Sparkles size={14} color={COLORS.primary} />
              <Text style={styles.badgeText}>PREMIUM</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.profileCard} onPress={() => setModalVisible(true)}>
            <View style={styles.profileInfo}>
              <TouchableOpacity onPress={pickImage} style={styles.profileAvatar}>
                <Image source={{ uri: logoUri }} style={styles.avatarImg} />
                <View style={styles.editOverlay}>
                  <Settings size={10} color="#fff" />
                </View>
              </TouchableOpacity>
              <View style={styles.profileDetails}>
                <Text style={styles.profileName}>{profile?.name || 'Business Name'}</Text>
                <Text style={styles.profileEmail}>{profile?.gstin || 'No GSTIN'}</Text>
              </View>
            </View>
            <ChevronRight size={18} color="#475569" />
          </TouchableOpacity>

          <Text style={styles.sectionLabel}>ACCOUNT & SYNC</Text>
          <View style={styles.settingsGroup}>
            <SettingsItem icon={Briefcase} label="Business Profile" onClick={() => setModalVisible(true)} />
            <SettingsItem icon={Users} label="User Details" value={user?.name} onClick={() => setAccountModalVisible(true)} />
            <SettingsItem icon={RefreshCw} label="Cloud Backup" value={formatLastSync(user?.last_sync_at)} onClick={handleSync} />
          </View>

          <Text style={styles.sectionLabel}>SUBSCRIPTION</Text>
          <View style={styles.settingsGroup}>
            <SettingsItem
              icon={CreditCard}
              label="Plan Details"
              value={user?.subscription_plan?.name || 'Free'}
              color={COLORS.primary}
              onClick={() => setPlansModalVisible(true)}
            />
          </View>

          <Text style={styles.sectionLabel}>PREFERENCES</Text>
          <View style={styles.settingsGroup}>
            <SettingsItem icon={Bell} label="Notifications" onClick={() => setNotifModalVisible(true)} />
            <SettingsItem icon={HelpCircle} label="Help & FAQs" onClick={() => setSupportModalVisible(true)} />
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <LogOut size={18} color="#f87171" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>

          <View style={styles.appInfo}>
            <Text style={styles.versionText}>ProGst Mobile v2.0.4</Text>
            <Text style={styles.copyrightText}>© 2026 Rupakranjan098</Text>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Modals with Dark Theme */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Business Profile</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><X size={24} color="#94a3b8" /></TouchableOpacity>
            </View>
            <ScrollView>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name</Text>
                <TextInput style={styles.input} value={editData.name} onChangeText={(t) => setEditData({...editData, name: t})} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>GSTIN</Text>
                <TextInput style={styles.input} value={editData.gstin} onChangeText={(t) => setEditData({...editData, gstin: t})} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Address</Text>
                <TextInput style={[styles.input, { height: 80 }]} value={editData.address} onChangeText={(t) => setEditData({...editData, address: t})} multiline />
              </View>
              <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}><Text style={styles.saveBtnText}>SAVE CHANGES</Text></TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Plans Modal */}
      <Modal visible={plansModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { height: '85%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Plan</Text>
              <TouchableOpacity onPress={() => setPlansModalVisible(false)}><X size={24} color="#94a3b8" /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {plans.map((plan) => (
                <TouchableOpacity key={plan.id} style={styles.planCard} onPress={() => handleSubscribe(plan.id)}>
                  <View style={styles.planInfo}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planPrice}>₹{parseFloat(plan.price).toLocaleString()}</Text>
                  </View>
                  <Text style={styles.planDesc}>{plan.description}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#0f172a' },
  safeArea: { flex: 1 },
  decorCircle: { position: 'absolute', borderRadius: 999 },
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(34, 197, 94, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 6, borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.2)' },
  badgeText: { color: COLORS.primary, fontSize: 10, fontWeight: '900' },
  profileCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(30, 41, 59, 0.7)', padding: 16, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', marginBottom: 24 },
  profileInfo: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  profileAvatar: { width: 60, height: 60, borderRadius: 30, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)' },
  avatarImg: { width: '100%', height: '100%' },
  editOverlay: { position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.primary, padding: 4, borderRadius: 10, borderWidth: 2, borderColor: '#1e293b' },
  profileDetails: { gap: 2 },
  profileName: { fontSize: 18, fontWeight: '800', color: '#fff' },
  profileEmail: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: '#475569', marginLeft: 16, marginBottom: 8, letterSpacing: 1 },
  settingsGroup: { backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', overflow: 'hidden', marginBottom: 24 },
  settingsItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.03)' },
  iconWrapper: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  settingsIconLabel: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingsLabel: { fontSize: 14, fontWeight: '700', color: '#e2e8f0' },
  settingsValueArrow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  settingsValue: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)', marginTop: 8 },
  logoutText: { color: '#f87171', fontWeight: '800', fontSize: 15 },
  appInfo: { alignItems: 'center', marginTop: 40, gap: 4 },
  versionText: { fontSize: 12, color: '#475569', fontWeight: '700' },
  copyrightText: { fontSize: 10, color: '#334155', fontWeight: '600' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#1e293b', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: '#94a3b8', marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 16, height: 52, color: '#fff', fontSize: 15 },
  saveBtn: { backgroundColor: COLORS.primary, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 1 },
  planCard: { backgroundColor: 'rgba(15, 23, 42, 0.4)', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 12 },
  planInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  planName: { fontSize: 16, fontWeight: '800', color: '#fff' },
  planPrice: { fontSize: 18, fontWeight: '900', color: COLORS.primary },
  planDesc: { fontSize: 13, color: '#94a3b8', lineHeight: 18 },
});

export default SettingsScreen;
