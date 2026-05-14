import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, FileText, Plus, CheckCircle, Clock, AlertCircle, List } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import { getInvoices } from '../services/api';
import * as WebBrowser from 'expo-web-browser';
import { SERVER_URL } from '../config';
import { scale, moderateScale, verticalScale } from '../utils/responsive';

// Filter config: label, status value (matches DB), colors, icon
const FILTERS = [
  { label: 'All',     status: 'All',     bg: '#6366f1', light: '#eef2ff', icon: List,         textActive: '#fff', textInactive: '#6b7280' },
  { label: 'Paid',    status: 'Paid',    bg: '#10b981', light: '#d1fae5', icon: CheckCircle,  textActive: '#fff', textInactive: '#6b7280' },
  { label: 'Unpaid',  status: 'Unpaid',  bg: '#f59e0b', light: '#fef3c7', icon: Clock,        textActive: '#fff', textInactive: '#6b7280' },
  { label: 'Overdue', status: 'Overdue', bg: '#ef4444', light: '#fee2e2', icon: AlertCircle,  textActive: '#fff', textInactive: '#6b7280' },
];

const InvoicesScreen = ({ navigation }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

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

  // Case-insensitive status match to handle any DB casing
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

  // Count per status for badge display
  const getCount = (status) => {
    if (status === 'All') return invoices.length;
    return invoices.filter(inv => normalizeStatus(inv.status) === normalizeStatus(status)).length;
  };

  const handlePrint = async (id) => {
    const url = `${SERVER_URL}/invoices/${id}/print`;
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.error("Couldn't load page", error);
      Alert.alert("Error", "Failed to open invoice. Please check your internet connection.");
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.invoiceItem, SHADOW.small]} 
      onPress={() => handlePrint(item.id)}
    >
      <View style={styles.invIcon}>
        <FileText size={20} color={COLORS.primary} />
      </View>
      <View style={styles.invDetails}>
        <View style={styles.invRow}>
          <Text style={styles.invId}>{item.invoice_number}</Text>
          <Text style={styles.invAmount}>₹ {parseFloat(item.total_amount).toLocaleString()}</Text>
        </View>
        <View style={styles.invRow}>
          <Text style={styles.invCustomer}>{item.customer?.name}</Text>
          <View style={[styles.badge, styles[`badge${item.status}`]]}>
            <Text style={[styles.badgeText, styles[`badgeText${item.status}`]]}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.invDate}>{item.date}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Invoices</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('CreateInvoice')}>
          <Plus size={24} color={COLORS.textWhite} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={18} color={COLORS.textMuted} style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search invoices..."
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
                    : { backgroundColor: '#fff', borderColor: COLORS.border },
                ]}
                onPress={() => setFilter(f.status)}
                activeOpacity={0.8}
              >
                <IconComp
                  size={scale(13)}
                  color={isActive ? '#fff' : f.bg}
                  style={{ marginRight: scale(4) }}
                />
                <Text style={[styles.chipText, { color: isActive ? '#fff' : COLORS.textMuted }]}>
                  {f.label}
                </Text>
                <View style={[
                  styles.chipBadge,
                  { backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : f.light },
                ]}>
                  <Text style={[
                    styles.chipBadgeText,
                    { color: isActive ? '#fff' : f.bg },
                  ]}>{count}</Text>
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FileText size={scale(48)} color={COLORS.border} />
            <Text style={styles.emptyTitle}>No Invoices Found</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'All'
                ? 'Create your first invoice to get started.'
                : `No ${filter.toLowerCase()} invoices match your search.`}
            </Text>
          </View>
        }
      />
      </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: COLORS.textMain,
  },
  addBtn: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: scale(12),
    marginBottom: verticalScale(16),
  },
  searchIcon: {
    marginRight: scale(8),
  },
  searchInput: {
    flex: 1,
    height: verticalScale(44),
    fontSize: moderateScale(14),
    color: COLORS.textMain,
  },
  filterContainer: {
    marginBottom: verticalScale(16),
  },
  filterScroll: {
    paddingRight: scale(8),
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(14),
    paddingVertical: scale(8),
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    marginRight: scale(8),
  },
  chipText: {
    fontSize: moderateScale(13),
    fontWeight: '700',
  },
  chipBadge: {
    marginLeft: scale(6),
    minWidth: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(4),
  },
  chipBadgeText: {
    fontSize: moderateScale(10),
    fontWeight: '800',
  },
  listContent: {
    paddingBottom: verticalScale(100),
  },
  invoiceItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    padding: scale(16),
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: verticalScale(12),
    alignItems: 'center',
    gap: scale(12),
  },
  invIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  invDetails: {
    flex: 1,
  },
  invRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  invId: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: COLORS.textMain,
  },
  invAmount: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: COLORS.textMain,
  },
  invCustomer: {
    fontSize: moderateScale(12),
    color: COLORS.textMuted,
  },
  invDate: {
    fontSize: moderateScale(11),
    color: COLORS.textMuted,
    marginTop: verticalScale(2),
  },
  badge: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    borderRadius: RADIUS.sm,
  },
  badgePaid:    { backgroundColor: '#d1fae5' },
  badgeUnpaid:  { backgroundColor: '#fef3c7' },
  badgeOverdue: { backgroundColor: '#fee2e2' },
  badgeText:         { fontSize: moderateScale(10), fontWeight: '700' },
  badgeTextPaid:     { color: '#065f46' },
  badgeTextUnpaid:   { color: '#92400e' },
  badgeTextOverdue:  { color: '#991b1b' },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: verticalScale(80),
    paddingHorizontal: scale(32),
  },
  emptyTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: COLORS.textMain,
    marginTop: verticalScale(16),
    marginBottom: verticalScale(8),
  },
  emptySubtitle: {
    fontSize: moderateScale(13),
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: moderateScale(20),
  },
});

export default InvoicesScreen;
