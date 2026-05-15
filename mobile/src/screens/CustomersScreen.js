import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Plus, X, Search, Phone, Mail, MapPin, ChevronRight, FileText, Trash2, Edit2 } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { scale, moderateScale } from '../utils/responsive';
import { useTheme } from '../context/ThemeContext';

const CustomersScreen = ({ navigation }) => {
  const { isDark, colors } = useTheme();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', gstin: '', address: '', city: '', state: '' });

  useEffect(() => { fetchInitialData(); }, []);

  const fetchInitialData = async () => {
    try {
      const res = await getCustomers();
      setCustomers(res.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchInitialData();
  }, []);

  const handleSave = async () => {
    if (!formData.name) { Alert.alert('Error', 'Name is required'); return; }
    setLoading(true);
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, formData);
        Alert.alert('Success', 'Customer updated');
      } else {
        await createCustomer(formData);
        Alert.alert('Success', 'Customer added');
      }
      setModalVisible(false);
      fetchInitialData();
    } catch (error) {
      Alert.alert('Error', 'Failed to save customer');
    } finally { setLoading(false); }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Customer', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteCustomer(id);
          fetchInitialData();
        } catch (error) {
          Alert.alert('Error', 'Failed to delete');
        }
      }}
    ]);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.gstin && c.gstin.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderItem = ({ item }) => (
    <View style={[styles.customerCard, { backgroundColor: colors.card, borderColor: colors.border }, SHADOW.small]}>
      <View style={styles.cardHeader}>
        <View style={[styles.avatar, { backgroundColor: COLORS.primary + '15' }]}><User size={20} color={COLORS.primary} /></View>
        <View style={styles.headerInfo}>
          <Text style={[styles.custName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.custGstin, { color: colors.textMuted }]}>{item.gstin || 'No GSTIN'}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => { setEditingCustomer(item); setFormData(item); setModalVisible(true); }}><Edit2 size={16} color={colors.textMuted} /></TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)}><Trash2 size={16} color="#f87171" /></TouchableOpacity>
        </View>
      </View>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <View style={styles.cardFooter}>
        <View style={styles.contactItem}><Phone size={12} color={colors.textMuted} /><Text style={[styles.contactText, { color: colors.textMuted }]}>{item.phone || 'N/A'}</Text></View>
        <View style={styles.contactItem}><Mail size={12} color={colors.textMuted} /><Text style={[styles.contactText, { color: colors.textMuted }]}>{item.email || 'N/A'}</Text></View>
      </View>
    </View>
  );

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <LinearGradient colors={isDark ? ['#0f172a', '#1e293b'] : ['#f8fafc', '#f1f5f9']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}><Text style={[styles.title, { color: colors.text }]}>Customers</Text><TouchableOpacity style={styles.addBtn} onPress={() => { setEditingCustomer(null); setFormData({ name: '', email: '', phone: '', gstin: '', address: '', city: '', state: '' }); setModalVisible(true); }}><Plus size={24} color="#fff" /></TouchableOpacity></View>
          <View style={[styles.searchBar, { backgroundColor: colors.glass, borderColor: colors.border }]}>
            <Search size={20} color={colors.textMuted} />
            <TextInput style={[styles.searchInput, { color: colors.text }]} placeholder="Search by name or GSTIN" placeholderTextColor={colors.textMuted} value={searchQuery} onChangeText={setSearchQuery} />
          </View>
          <FlatList data={filteredCustomers} renderItem={renderItem} keyExtractor={item => item.id.toString()} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />} ListEmptyComponent={<View style={styles.emptyContainer}><User size={48} color={colors.border} /><Text style={[styles.emptyText, { color: colors.textMuted }]}>No customers found</Text></View>} />
        </View>
      </SafeAreaView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <View style={styles.modalHeader}><Text style={[styles.modalTitle, { color: colors.text }]}>{editingCustomer ? 'Edit Customer' : 'New Customer'}</Text><TouchableOpacity onPress={() => setModalVisible(false)}><X size={24} color={colors.textMuted} /></TouchableOpacity></View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}><Text style={[styles.label, { color: colors.textMuted }]}>Full Name *</Text><TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} placeholder="Business or Person Name" placeholderTextColor={colors.textMuted} value={formData.name} onChangeText={(t) => setFormData({...formData, name: t})} /></View>
              <View style={styles.inputGroup}><Text style={[styles.label, { color: colors.textMuted }]}>GSTIN</Text><TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} placeholder="27AAACP..." placeholderTextColor={colors.textMuted} value={formData.gstin} onChangeText={(t) => setFormData({...formData, gstin: t})} autoCapitalize="characters" /></View>
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}><Text style={[styles.label, { color: colors.textMuted }]}>Phone</Text><TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} placeholder="98765..." placeholderTextColor={colors.textMuted} value={formData.phone} onChangeText={(t) => setFormData({...formData, phone: t})} keyboardType="phone-pad" /></View>
                <View style={{ width: 16 }} />
                <View style={[styles.inputGroup, { flex: 1 }]}><Text style={[styles.label, { color: colors.textMuted }]}>Email</Text><TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} placeholder="client@mail.com" placeholderTextColor={colors.textMuted} value={formData.email} onChangeText={(t) => setFormData({...formData, email: t})} keyboardType="email-address" autoCapitalize="none" /></View>
              </View>
              <View style={styles.inputGroup}><Text style={[styles.label, { color: colors.textMuted }]}>Address</Text><TextInput style={[styles.input, { height: 80, color: colors.text, borderColor: colors.border }]} placeholder="Full Address" placeholderTextColor={colors.textMuted} value={formData.address} onChangeText={(t) => setFormData({...formData, address: t})} multiline /></View>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}><Text style={styles.saveBtnText}>SAVE CUSTOMER</Text></TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 8 },
  title: { fontSize: 28, fontWeight: '800' },
  addBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 52, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 15 },
  listContent: { paddingBottom: 120 },
  customerCard: { borderRadius: 24, borderWidth: 1, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  headerInfo: { flex: 1, marginLeft: 12 },
  custName: { fontSize: 16, fontWeight: '800' },
  custGstin: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 16 },
  divider: { height: 1, marginVertical: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  contactText: { fontSize: 11, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100, gap: 12 },
  emptyText: { fontSize: 16, fontWeight: '600' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40, height: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: '800' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 8, marginLeft: 4 },
  input: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, height: 52, fontSize: 15 },
  row: { flexDirection: 'row' },
  saveBtn: { backgroundColor: COLORS.primary, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 1 },
});

export default CustomersScreen;
