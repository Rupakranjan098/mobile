import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Save, Building, MapPin, Phone, Mail, FileText, Camera } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import { getBusinessProfile, updateBusinessProfile } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { scale, moderateScale } from '../utils/responsive';
import { useTheme } from '../context/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import { SERVER_URL } from '../config';

const BusinessProfileScreen = ({ navigation }) => {
  const { isDark, colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ name: '', gstin: '', address: '', phone: '', email: '', logo_url: '' });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await getBusinessProfile();
      setProfile(res.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateBusinessProfile(profile);
      Alert.alert('Success', 'Business profile updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally { setSaving(false); }
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
    formData.append('name', profile.name);
    try {
      setSaving(true);
      const res = await updateBusinessProfile(formData);
      setProfile(res.data);
      Alert.alert('Success', 'Logo updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to upload logo');
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <View style={[styles.mainContainer, { justifyContent: 'center', backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const logoUri = profile.logo_url ? `${SERVER_URL}${profile.logo_url}` : null;

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <LinearGradient colors={isDark ? ['#0f172a', '#1e293b'] : ['#f8fafc', '#f1f5f9']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.glass }]}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Business Profile</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving} style={[styles.saveBtn, { backgroundColor: COLORS.primary }]}><Save size={20} color="#fff" /></TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickImage} style={[styles.avatarContainer, { borderColor: colors.border, backgroundColor: colors.card }]}>
              {logoUri ? <Image source={{ uri: logoUri }} style={styles.avatarImg} /> : <Building size={40} color={colors.textMuted} />}
              <View style={styles.cameraBtn}><Camera size={14} color="#fff" /></View>
            </TouchableOpacity>
            <Text style={[styles.avatarLabel, { color: colors.text }]}>Company Logo</Text>
          </View>

          <View style={styles.container}>
            <View style={styles.inputGroup}><Text style={[styles.label, { color: colors.textMuted }]}>Company Name</Text><View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}><Building size={18} color={colors.textMuted} style={styles.inputIcon} /><TextInput style={[styles.input, { color: colors.text }]} value={profile.name} onChangeText={(t) => setProfile({...profile, name: t})} placeholder="Enter business name" placeholderTextColor={colors.textMuted} /></View></View>
            <View style={styles.inputGroup}><Text style={[styles.label, { color: colors.textMuted }]}>GSTIN Number</Text><View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}><FileText size={18} color={colors.textMuted} style={styles.inputIcon} /><TextInput style={[styles.input, { color: colors.text }]} value={profile.gstin} onChangeText={(t) => setProfile({...profile, gstin: t})} placeholder="27AAACP..." autoCapitalize="characters" placeholderTextColor={colors.textMuted} /></View></View>
            <View style={styles.inputGroup}><Text style={[styles.label, { color: colors.textMuted }]}>Phone Number</Text><View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}><Phone size={18} color={colors.textMuted} style={styles.inputIcon} /><TextInput style={[styles.input, { color: colors.text }]} value={profile.phone} onChangeText={(t) => setProfile({...profile, phone: t})} keyboardType="phone-pad" placeholder="Enter contact number" placeholderTextColor={colors.textMuted} /></View></View>
            <View style={styles.inputGroup}><Text style={[styles.label, { color: colors.textMuted }]}>Email Address</Text><View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}><Mail size={18} color={colors.textMuted} style={styles.inputIcon} /><TextInput style={[styles.input, { color: colors.text }]} value={profile.email} onChangeText={(t) => setProfile({...profile, email: t})} keyboardType="email-address" autoCapitalize="none" placeholder="Enter business email" placeholderTextColor={colors.textMuted} /></View></View>
            <View style={styles.inputGroup}><Text style={[styles.label, { color: colors.textMuted }]}>Business Address</Text><View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border, height: 100, alignItems: 'flex-start', paddingTop: 12 }]}><MapPin size={18} color={colors.textMuted} style={styles.inputIcon} /><TextInput style={[styles.input, { color: colors.text, height: 80 }]} value={profile.address} onChangeText={(t) => setProfile({...profile, address: t})} multiline placeholder="Full business address" placeholderTextColor={colors.textMuted} /></View></View>
            
            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: COLORS.primary }]} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>SAVE PROFILE</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 24, marginTop: 8 },
  backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  saveBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  title: { fontSize: 20, fontWeight: '800' },
  avatarSection: { alignItems: 'center', marginBottom: 30 },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, borderWidth: 1, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  cameraBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.primary, width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  avatarLabel: { marginTop: 12, fontSize: 13, fontWeight: '700' },
  container: { paddingHorizontal: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 8, marginLeft: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderHeight: 56, borderRadius: 16, borderWidth: 1, paddingHorizontal: 16 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 15, fontWeight: '600' },
  submitBtn: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
});

export default BusinessProfileScreen;
