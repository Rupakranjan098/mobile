import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert, Platform, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User as UserIcon, Briefcase, Users, RefreshCw, CreditCard, Bell, Settings, HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVER_URL } from '../config';
import * as ImagePicker from 'expo-image-picker';
import { getBusinessProfile, updateBusinessProfile, getMe, updateProfile, getSubscriptionPlans, subscribe, syncData, getAppSettings, updateAppSettings, getFAQs, getSupportContact } from '../services/api';


const SettingsItem = ({ icon: Icon, label, value, color = COLORS.textMuted, onClick }) => (
  <TouchableOpacity style={styles.settingsItem} onPress={onClick}>
    <View style={styles.settingsIconLabel}>
      <Icon size={20} color={color} />
      <Text style={styles.settingsLabel}>{label}</Text>
    </View>
    <View style={styles.settingsValueArrow}>
      {value && <Text style={styles.settingsValue}>{value}</Text>}
      <ChevronRight size={18} color="#9ca3af" />
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
  const [appSettings, setAppSettings] = useState({ email_notifications: true, push_notifications: true, language: 'en', theme: 'light' });
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
      Alert.alert('Success', `Subscribed to ${res.data.user.subscription_plan?.name || 'new plan'}!`);
    } catch (error) {
      Alert.alert('Error', 'Subscription failed. Please try again.');
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
      Alert.alert('Success', 'Cloud Backup & Sync completed!');
    } catch (error) {
      Alert.alert('Error', 'Sync failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const formatLastSync = (dateString) => {
    if (!dateString) return 'Never synced';
    const date = new Date(dateString);
    return `Last sync: ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
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

    const profileName = profile?.name || 'My Business';
    formData.append('name', profileName);

    try {
      setLoading(true);
      const res = await updateBusinessProfile(formData);
      setProfile(res.data);
      Alert.alert('Success', 'Logo updated successfully');
    } catch (error) {
      console.error('Logo upload error:', error);
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
      Alert.alert('Success', 'Profile updated successfully');
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
      Alert.alert('Success', 'Account updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update account');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newData) => {
    try {
      setLoading(true);
      const res = await updateAppSettings(newData);
      setAppSettings(res.data.settings);
      Alert.alert('Success', 'Settings updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const logoUri = profile?.logo_url
    ? `${SERVER_URL}${profile.logo_url}`
    : `https://ui-avatars.com/api/?name=${profile?.name || 'Business'}&background=22c55e&color=fff`;

  if (loading && !profile) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <TouchableOpacity style={[styles.profileCard, SHADOW.small]} onPress={() => setModalVisible(true)}>
        <View style={styles.profileInfo}>
          <TouchableOpacity onPress={pickImage} style={styles.profileAvatar}>
            <Image source={{ uri: logoUri }} style={styles.avatarImg} />
            <View style={styles.editOverlay}>
              <Settings size={12} color="#fff" />
            </View>
          </TouchableOpacity>
          <View style={styles.profileDetails}>
            <Text style={styles.profileName}>{profile?.name || 'Business Name'}</Text>
            <Text style={styles.profileEmail}>{profile?.gstin || 'GSTIN Not Set'}</Text>
          </View>
        </View>
        <ChevronRight size={20} color="#9ca3af" />
      </TouchableOpacity>

      <View style={styles.settingsGroup}>
        <SettingsItem icon={Briefcase} label="Business Profile" onClick={() => setModalVisible(true)} />
        <SettingsItem icon={Users} label="Account Details" value={user?.name} onClick={() => setAccountModalVisible(true)} />
        <SettingsItem
          icon={RefreshCw}
          label="Backup & Sync"
          value={formatLastSync(user?.last_sync_at)}
          onClick={handleSync}
        />
        <SettingsItem
          icon={CreditCard}
          label="Subscription"
          value={user?.subscription_plan?.name || 'Free Plan'}
          color={COLORS.primary}
          onClick={() => setPlansModalVisible(true)}
        />
      </View>

      <View style={styles.settingsGroup}>
        <SettingsItem icon={Bell} label="Notification Settings" onClick={() => setNotifModalVisible(true)} />
      </View>

      <View style={styles.settingsGroup}>
        <SettingsItem icon={HelpCircle} label="Help & Support" onClick={() => setSupportModalVisible(true)} />
        <TouchableOpacity
          style={[styles.settingsItem, styles.logoutItem]}
          onPress={onLogout}
        >
          <View style={styles.settingsIconLabel}>
            <LogOut size={20} color={COLORS.danger} />
            <Text style={[styles.settingsLabel, { color: COLORS.danger, fontWeight: '700' }]}>Logout</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Edit Business Profile Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Business Profile</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Business Name</Text>
              <TextInput
                style={styles.input}
                value={editData.name}
                onChangeText={(t) => setEditData({...editData, name: t})}
                placeholder="Enter business name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>GSTIN</Text>
              <TextInput
                style={styles.input}
                value={editData.gstin}
                onChangeText={(t) => setEditData({...editData, gstin: t})}
                placeholder="Enter GSTIN"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                value={editData.address}
                onChangeText={(t) => setEditData({...editData, address: t})}
                placeholder="Enter full address"
                multiline
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Account Modal */}
      <Modal visible={accountModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Account Details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Your Name</Text>
              <TextInput
                style={styles.input}
                value={accountData.name}
                onChangeText={(t) => setAccountData({...accountData, name: t})}
                placeholder="Full Name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={accountData.email}
                onChangeText={(t) => setAccountData({...accountData, email: t})}
                placeholder="Email Address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password (Optional)</Text>
              <TextInput
                style={styles.input}
                value={accountData.password}
                onChangeText={(t) => setAccountData({...accountData, password: t})}
                placeholder="Leave blank to keep current"
                secureTextEntry
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setAccountModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={saveAccount}>
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Subscription Plans Modal */}
      <Modal visible={plansModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '92%', paddingBottom: 0 }]}>

            {/* Header */}
            <View style={styles.planModalHeader}>
              <View>
                <Text style={styles.modalTitle}>Choose a Plan</Text>
                <Text style={styles.planModalSub}>
                  Current: <Text style={{ color: COLORS.primary, fontWeight: '700' }}>{user?.subscription_plan?.name || 'Free'}</Text>
                </Text>
              </View>
              <TouchableOpacity style={styles.closeCircle} onPress={() => setPlansModalVisible(false)}>
                <Text style={styles.closeCircleText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
              {plans.map((plan) => {
                const isActive = user?.subscription_plan_id === plan.id;
                const planColor = plan.duration_months === 1 ? '#3b82f6'
                  : plan.duration_months === 3 ? '#22c55e'
                  : plan.duration_months === 6 ? '#f97316'
                  : '#8b5cf6';
                const isAnnual = plan.duration_months === 12;
                const perMonth = (parseFloat(plan.price) / plan.duration_months).toFixed(0);
                const features = JSON.parse(plan.features || '[]');

                return (
                  <View
                    key={plan.id}
                    style={[
                      styles.premiumPlanCard,
                      { borderColor: isActive ? planColor : isAnnual ? planColor : COLORS.border },
                      isActive && { backgroundColor: planColor + '12' },
                    ]}
                  >
                    {/* Best Value Ribbon */}
                    {isAnnual && (
                      <View style={[styles.bestValueRibbon, { backgroundColor: planColor }]}>
                        <Text style={styles.bestValueText}>🏆 BEST VALUE</Text>
                      </View>
                    )}

                    {/* Plan Top Row */}
                    <View style={styles.premiumPlanTop}>
                      <View style={[styles.planBadge, { backgroundColor: planColor + '20' }]}>
                        <Text style={[styles.planBadgeText, { color: planColor }]}>
                          {plan.duration_months === 1 ? '📅 Monthly'
                            : plan.duration_months === 3 ? '📆 Quarterly'
                            : plan.duration_months === 6 ? '🗓️ Half-Year'
                            : '🎯 Annual'}
                        </Text>
                      </View>
                      {isActive && (
                        <View style={[styles.activePillBadge, { backgroundColor: planColor }]}>
                          <Text style={styles.activePillText}>✓ Active</Text>
                        </View>
                      )}
                    </View>

                    {/* Plan Name & Price */}
                    <Text style={[styles.premiumPlanName, { color: planColor }]}>{plan.name}</Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.premiumPlanPrice}>₹{parseFloat(plan.price).toLocaleString()}</Text>
                      <View style={styles.priceMeta}>
                        <Text style={styles.pricePerMonth}>₹{perMonth}/mo</Text>
                        <Text style={styles.priceDuration}>for {plan.duration_months} month{plan.duration_months > 1 ? 's' : ''}</Text>
                      </View>
                    </View>

                    {/* Savings Tag */}
                    {plan.duration_months > 1 && (
                      <View style={[styles.savingsTag, { backgroundColor: planColor + '15', borderColor: planColor + '40' }]}>
                        <Text style={[styles.savingsText, { color: planColor }]}>
                          💰 Save ₹{(99 * plan.duration_months - parseFloat(plan.price)).toFixed(0)} vs monthly
                        </Text>
                      </View>
                    )}

                    <Text style={styles.premiumPlanDesc}>{plan.description}</Text>

                    {/* Features */}
                    <View style={styles.premiumFeaturesList}>
                      {features.map((feature, i) => (
                        <View key={i} style={styles.premiumFeatureRow}>
                          <View style={[styles.featureCheckDot, { backgroundColor: planColor }]} />
                          <Text style={styles.premiumFeatureText}>{feature}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Subscribe Button */}
                    <TouchableOpacity
                      style={[
                        styles.premiumSubscribeBtn,
                        isActive
                          ? styles.currentPlanBtn
                          : { backgroundColor: planColor },
                      ]}
                      disabled={isActive}
                      onPress={() => handleSubscribe(plan.id)}
                    >
                      <Text style={styles.premiumSubscribeBtnText}>
                        {isActive ? '✓ Current Plan' : `Get ${plan.name} →`}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Notification Settings Modal */}
      <Modal visible={notifModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setNotifModalVisible(false)}>
                <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Done</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Email Notifications</Text>
                <Text style={styles.settingSub}>Receive invoice & report summaries</Text>
              </View>
              <Switch
                value={!!appSettings.email_notifications}
                onValueChange={(v) => saveSettings({...appSettings, email_notifications: v})}
                trackColor={{ true: COLORS.primary }}
              />
            </View>

            <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
              <View>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Text style={styles.settingSub}>Real-time alerts for inventory & sales</Text>
              </View>
              <Switch
                value={!!appSettings.push_notifications}
                onValueChange={(v) => saveSettings({...appSettings, push_notifications: v})}
                trackColor={{ true: COLORS.primary }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Help & Support Modal */}
      <Modal visible={supportModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Help & Support</Text>
              <TouchableOpacity onPress={() => setSupportModalVisible(false)}>
                <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
              {faqs.length > 0 ? faqs.map((faq) => (
                <View key={faq.id} style={styles.faqItem}>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                </View>
              )) : (
                <Text style={styles.emptyText}>No FAQs available yet.</Text>
              )}

              <View style={styles.contactCard}>
                <Text style={styles.contactTitle}>Need more help?</Text>
                {supportContact ? (
                  <>
                    <Text style={styles.contactItem}>📧 {supportContact.email}</Text>
                    <Text style={styles.contactItem}>📞 {supportContact.phone}</Text>
                    <Text style={styles.contactItem}>⏰ {supportContact.working_hours}</Text>
                  </>
                ) : (
                  <Text style={styles.contactItem}>Contacting support...</Text>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  profileCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  editOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    padding: 4,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileDetails: {
    gap: 2,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  profileEmail: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  settingsGroup: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 20,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingsIconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  settingsValueArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsValue: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: COLORS.textMain,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  cancelBtnText: {
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  saveBtn: {
    flex: 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  saveBtnText: {
    fontWeight: '700',
    color: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activePlanCard: {
    borderColor: COLORS.primary,
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  activeBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textMain,
    marginBottom: 8,
  },
  planDuration: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '400',
  },
  planDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 16,
    lineHeight: 18,
  },
  featuresList: {
    gap: 8,
    marginBottom: 20,
  },
  featureItem: {
    fontSize: 13,
    color: COLORS.textMain,
    fontWeight: '500',
  },
  subscribeBtn: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  subscribeBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  disabledBtn: {
    backgroundColor: '#9ca3af',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  settingSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  pickerEmulator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pickerText: {
    fontSize: 14,
    color: COLORS.textMain,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
    marginBottom: 16,
    marginTop: 8,
  },
  faqItem: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 14,
    marginVertical: 20,
  },
  contactCard: {
    backgroundColor: '#eff6ff',
    padding: 20,
    borderRadius: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e40af',
    marginBottom: 12,
  },
  contactItem: {
    fontSize: 14,
    color: '#1e3a8a',
    marginBottom: 8,
    fontWeight: '500',
  },

  // ── Premium Plan Modal ──────────────────────────────────────────────────────
  planModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  planModalSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  closeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeCircleText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  premiumPlanCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  bestValueRibbon: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderBottomLeftRadius: 14,
  },
  bestValueText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  premiumPlanTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  planBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  planBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  activePillBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  activePillText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  premiumPlanName: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginBottom: 10,
  },
  premiumPlanPrice: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.textMain,
  },
  priceMeta: {
    paddingBottom: 4,
  },
  pricePerMonth: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  priceDuration: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  savingsTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '700',
  },
  premiumPlanDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginBottom: 16,
  },
  premiumFeaturesList: {
    gap: 10,
    marginBottom: 20,
  },
  premiumFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureCheckDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  premiumFeatureText: {
    fontSize: 13,
    color: COLORS.textMain,
    fontWeight: '500',
    flex: 1,
  },
  premiumSubscribeBtn: {
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  currentPlanBtn: {
    backgroundColor: '#e5e7eb',
  },
  premiumSubscribeBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
});

export default SettingsScreen;
