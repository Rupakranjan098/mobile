import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert, RefreshControl, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, FileText, Plus, CheckCircle, Clock, AlertCircle, List, Share2, MessageCircle, Printer } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import { getInvoices } from '../services/api';
import * as WebBrowser from 'expo-web-browser';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import axios from 'axios';
import { SERVER_URL } from '../config';
import { scale, moderateScale, verticalScale } from '../utils/responsive';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const FILTERS = [
  { label: 'All',     status: 'All',     bg: '#6366f1', glass: 'rgba(99, 102, 241, 0.15)', icon: List },
  { label: 'Paid',    status: 'Paid',    bg: '#10b981', glass: 'rgba(16, 185, 129, 0.15)', icon: CheckCircle },
  { label: 'Unpaid',  status: 'Unpaid',  bg: '#f59e0b', glass: 'rgba(245, 158, 11, 0.15)', icon: Clock },
  { label: 'Overdue', status: 'Overdue', bg: '#ef4444', glass: 'rgba(239, 68, 68, 0.15)', icon: AlertCircle },
];

const InvoicesScreen = ({ navigation }) => {
  const { isDark, colors } = useTheme();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await getInvoices();
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchInvoices();
  }, []);

  const normalizeStatus = (s) => (s || '').toLowerCase().trim();

  const filteredInvoices = invoices.filter(inv => {
    const customerName = inv.customer?.name || '';
    const matchesSearch =
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.invoice_number || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === 'All' ||
      normalizeStatus(inv.status) === normalizeStatus(filter);
    return matchesSearch && matchesFilter;
  });

  const getCount = (status) => {
    if (status === 'All') return invoices.length;
    return invoices.filter(inv => normalizeStatus(inv.status) === normalizeStatus(status)).length;
  };

  const handlePrint = async (id) => {
    const url = `${SERVER_URL}/invoices/${id}/print?auto=true`;
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.error("Couldn't load page", error);
      Alert.alert("Error", "Failed to open invoice. Please check your internet connection.");
    }
  };

  const handleDownloadPDF = async (item) => {
    try {
      setDownloadingId(item.id);
      const url = `${SERVER_URL}/invoices/${item.id}/print`;
      const response = await axios.get(url, { timeout: 10000 });
      const htmlContent = response.data;
      const { uri } = await Print.printToFileAsync({ html: htmlContent, base64: false });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: `Download Invoice ${item.invoice_number}` });
    } catch (error) {
      console.error('PDF Download Error:', error);
      Alert.alert('Download Failed', 'Please check your network and try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleWhatsAppShare = (item) => {
    const url = `${SERVER_URL}/invoices/${item.id}/print`;
    const message = `*ProGst Invoice Sharing*\n\nHello *${item.customer?.name || 'Customer'}*,\n\nYour invoice *${item.invoice_number}* is ready.\n\n*Amount:* ₹ ${parseFloat(item.total_amount).toLocaleString()}\n*Status:* ${item.status}\n\nView/Download Invoice: ${url}`;
    const phone = item.customer?.phone ? item.customer.phone.replace(/\D/g, '') : '';
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}${phone ? `&phone=${phone}` : ''}`;
    Linking.openURL(whatsappUrl).catch(() => Linking.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`));
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.invoiceItem, { backgroundColor: colors.card, borderColor: colors.border }, SHADOW.small]} 
      onPress={() => handlePrint(item.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.invIcon, { backgroundColor: COLORS.primary + '15' }]}>
        <FileText size={20} color={COLORS.primary} />
      </View>
      <View style={styles.invDetails}>
        <View style={styles.invRow}>
          <Text style={[styles.invId, { color: colors.text }]}>{item.invoice_number}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={[styles.invAmount, { color: colors.text }]}>₹ {parseFloat(item.total_amount).toLocaleString()}</Text>
            <TouchableOpacity 
              style={[styles.smallPrintBtn, { backgroundColor: COLORS.primary + '15' }]}
              onPress={(e) => { e.stopPropagation(); handlePrint(item.id); }}
            >
              <Printer size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.invRow}>
          <Text style={[styles.invCustomer, { color: colors.textMuted }]}>{item.customer?.name || 'Walk-in'}</Text>
          <View style={[styles.badge, styles[`badge${item.status}`]]}>
            <Text style={[styles.badgeText, styles[`badgeText${item.status}`]]}>{item.status}</Text>
          </View>
        </View>
        <View style={styles.invFooter}>
          <Text style={[styles.invDate, { color: colors.textMuted }]}>{item.date}</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity 
              style={[styles.shareIconBtn, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}
              onPress={(e) => { e.stopPropagation(); handleDownloadPDF(item); }}
              disabled={!!downloadingId}
            >
              {downloadingId === item.id ? (
                <ActivityIndicator size="small" color="#3b82f6" />
              ) : (
                <>
                  <FileText size={16} color="#3b82f6" />
                  <Text style={[styles.shareLabel, { color: '#3b82f6' }]}>PDF</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.shareIconBtn, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}
              onPress={(e) => { e.stopPropagation(); handleWhatsAppShare(item); }}
            >
              <MessageCircle size={18} color="#22c55e" />
              <Text style={[styles.shareLabel, { color: '#22c55e' }]}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <LinearGradient colors={isDark ? ['#0f172a', '#1e293b'] : ['#f8fafc', '#f1f5f9']} style={StyleSheet.absoluteFill} />
      <View style={[styles.decorCircle, { top: -50, right: -100, width: 300, height: 300, backgroundColor: isDark ? 'rgba(34, 197, 94, 0.08)' : 'rgba(34, 197, 94, 0.05)' }]} />
      <View style={[styles.decorCircle, { bottom: 100, left: -150, width: 350, height: 350, backgroundColor: isDark ? 'rgba(30, 64, 175, 0.06)' : 'rgba(30, 64, 175, 0.03)' }]} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Invoices</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('CreateInvoice')}>
              <Plus size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={[styles.searchContainer, { backgroundColor: colors.glass, borderColor: colors.border }]}>
            <Search size={18} color={colors.textMuted} style={styles.searchIcon} />
            <TextInput 
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search invoices..."
              placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>

          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              {FILTERS.map(f => {
                const isActive = filter === f.status;
                const IconComp = f.icon;
                const count = getCount(f.status);
                return (
                  <TouchableOpacity
                    key={f.status}
                    style={[
                      styles.chip,
                      isActive
                        ? { backgroundColor: f.bg, borderColor: f.bg }
                        : { backgroundColor: colors.glass, borderColor: colors.border },
                    ]}
                    onPress={() => setFilter(f.status)}
                    activeOpacity={0.8}
                  >
                    <IconComp size={scale(13)} color={isActive ? '#fff' : f.bg} style={{ marginRight: scale(4) }} />
                    <Text style={[styles.chipText, { color: isActive ? '#fff' : colors.textMuted }]}>{f.label}</Text>
                    <View style={[styles.chipBadge, { backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : f.glass }]}>
                      <Text style={[styles.chipBadgeText, { color: isActive ? '#fff' : f.bg }]}>{count}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <FlatList
            data={filteredInvoices}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <FileText size={scale(48)} color={colors.border} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No Invoices Found</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                  {filter === 'All' ? 'Create your first invoice to get started.' : `No ${filter.toLowerCase()} invoices match search.`}
                </Text>
              </View>
            }
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  safeArea: { flex: 1 },
  decorCircle: { position: 'absolute', borderRadius: 999 },
  container: { flex: 1, paddingHorizontal: SPACING.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg, marginTop: 8 },
  title: { fontSize: moderateScale(28), fontWeight: '800', letterSpacing: -0.5 },
  addBtn: { width: scale(48), height: scale(48), borderRadius: scale(24), backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, paddingHorizontal: scale(16), marginBottom: verticalScale(16), height: 52 },
  searchIcon: { marginRight: scale(8) },
  searchInput: { flex: 1, fontSize: moderateScale(15) },
  filterContainer: { marginBottom: verticalScale(16) },
  filterScroll: { paddingRight: scale(8) },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: scale(14), paddingVertical: scale(8), borderRadius: 20, borderWidth: 1, marginRight: scale(8) },
  chipText: { fontSize: moderateScale(13), fontWeight: '800' },
  chipBadge: { marginLeft: scale(8), minWidth: scale(22), height: scale(22), borderRadius: 11, justifyContent: 'center', alignItems: 'center', paddingHorizontal: scale(4) },
  chipBadgeText: { fontSize: moderateScale(10), fontWeight: '900' },
  listContent: { paddingBottom: verticalScale(120) },
  invoiceItem: { flexDirection: 'row', padding: scale(16), borderRadius: 24, borderWidth: 1, marginBottom: verticalScale(12), alignItems: 'center', gap: scale(12) },
  invIcon: { width: scale(44), height: scale(44), borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  invDetails: { flex: 1 },
  invRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: verticalScale(2) },
  invId: { fontSize: moderateScale(14), fontWeight: '800' },
  invAmount: { fontSize: moderateScale(15), fontWeight: '900' },
  invCustomer: { fontSize: moderateScale(13), fontWeight: '600' },
  invDate: { fontSize: moderateScale(11), fontWeight: '700' },
  invFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: verticalScale(4) },
  shareIconBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: scale(10), paddingVertical: scale(4), borderRadius: 8, gap: scale(4) },
  shareLabel: { fontSize: moderateScale(11), fontWeight: '800' },
  badge: { paddingHorizontal: scale(10), paddingVertical: scale(4), borderRadius: 8 },
  badgePaid: { backgroundColor: 'rgba(34, 197, 94, 0.15)' },
  badgeUnpaid: { backgroundColor: 'rgba(245, 158, 11, 0.15)' },
  badgeOverdue: { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
  badgeText: { fontSize: moderateScale(10), fontWeight: '900', textTransform: 'uppercase' },
  badgeTextPaid: { color: '#4ade80' },
  badgeTextUnpaid: { color: '#fbbf24' },
  badgeTextOverdue: { color: '#f87171' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: verticalScale(80), paddingHorizontal: scale(32) },
  emptyTitle: { fontSize: moderateScale(18), fontWeight: '800', marginTop: verticalScale(16) },
  emptySubtitle: { fontSize: moderateScale(14), textAlign: 'center', marginTop: 8, lineHeight: moderateScale(22) },
  smallPrintBtn: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
});

export default InvoicesScreen;
