import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Printer, Share2, Download, Package, Calendar, User, FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import { getInvoice } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { scale, moderateScale } from '../utils/responsive';
import { useTheme } from '../context/ThemeContext';
import * as WebBrowser from 'expo-web-browser';
import { SERVER_URL } from '../config';

const ViewInvoiceScreen = ({ route, navigation }) => {
  const { isDark, colors } = useTheme();
  const { invoiceId } = route.params;
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchInvoice(); }, []);

  const fetchInvoice = async () => {
    try {
      const res = await getInvoice(invoiceId);
      setInvoice(res.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load invoice');
      navigation.goBack();
    } finally { setLoading(false); }
  };

  const handlePrint = async () => {
    const url = `${SERVER_URL}/invoices/${invoiceId}/print`;
    await WebBrowser.openBrowserAsync(url);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Invoice ${invoice.invoice_number} from ProGst\nAmount: ₹${invoice.total_amount}\nView here: ${SERVER_URL}/invoices/${invoiceId}/print`,
      });
    } catch (error) { console.error(error); }
  };

  if (loading || !invoice) {
    return (
      <View style={[styles.mainContainer, { justifyContent: 'center', backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid': return '#4ade80';
      case 'unpaid': return '#fbbf24';
      case 'overdue': return '#f87171';
      default: return colors.textMuted;
    }
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <LinearGradient colors={isDark ? ['#0f172a', '#1e293b'] : ['#f8fafc', '#f1f5f9']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.glass }]}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Invoice Details</Text>
          <TouchableOpacity onPress={handleShare} style={[styles.backBtn, { backgroundColor: colors.glass }]}><Share2 size={20} color={colors.text} /></TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={[styles.statusBanner, { backgroundColor: getStatusColor(invoice.status) + '15', borderColor: getStatusColor(invoice.status) + '30' }]}>
            <View style={styles.statusInfo}>
              <Text style={[styles.statusLabel, { color: colors.textMuted }]}>STATUS</Text>
              <Text style={[styles.statusValue, { color: getStatusColor(invoice.status) }]}>{invoice.status.toUpperCase()}</Text>
            </View>
            {invoice.status.toLowerCase() === 'paid' ? <CheckCircle size={24} color="#4ade80" /> : <Clock size={24} color="#fbbf24" />}
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, SHADOW.small]}>
            <View style={styles.cardSection}>
              <View style={styles.sectionHeader}><FileText size={16} color={COLORS.primary} /><Text style={[styles.sectionTitle, { color: colors.text }]}>General Information</Text></View>
              <View style={styles.infoRow}><Text style={[styles.infoLabel, { color: colors.textMuted }]}>Invoice Number</Text><Text style={[styles.infoValue, { color: colors.text }]}>{invoice.invoice_number}</Text></View>
              <View style={styles.infoRow}><Text style={[styles.infoLabel, { color: colors.textMuted }]}>Date</Text><Text style={[styles.infoValue, { color: colors.text }]}>{new Date(invoice.date).toLocaleDateString()}</Text></View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.cardSection}>
              <View style={styles.sectionHeader}><User size={16} color={COLORS.primary} /><Text style={[styles.sectionTitle, { color: colors.text }]}>Customer Details</Text></View>
              <Text style={[styles.custName, { color: colors.text }]}>{invoice.customer?.name || 'Walk-in Customer'}</Text>
              <Text style={[styles.custMeta, { color: colors.textMuted }]}>{invoice.customer?.gstin || 'No GSTIN registered'}</Text>
              <Text style={[styles.custMeta, { color: colors.textMuted }]}>{invoice.customer?.address || 'No address provided'}</Text>
            </View>
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>ITEMS SUMMARY</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, SHADOW.small]}>
            {invoice.items?.map((item, idx) => (
              <View key={idx} style={[styles.itemRow, idx !== invoice.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                <View style={styles.itemMain}>
                  <Text style={[styles.itemName, { color: colors.text }]}>{item.product?.name || 'Product'}</Text>
                  <Text style={[styles.itemMeta, { color: colors.textMuted }]}>₹{item.price} × {item.quantity}</Text>
                </View>
                <Text style={[styles.itemTotal, { color: colors.text }]}>₹{item.total.toLocaleString()}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>PAYMENT BREAKDOWN</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, SHADOW.small]}>
            <View style={styles.priceRow}><Text style={[styles.priceLabel, { color: colors.textMuted }]}>Sub Total</Text><Text style={[styles.priceValue, { color: colors.text }]}>₹{parseFloat(invoice.sub_total || 0).toLocaleString()}</Text></View>
            <View style={styles.priceRow}><Text style={[styles.priceLabel, { color: colors.textMuted }]}>Taxable Amount</Text><Text style={[styles.priceValue, { color: colors.text }]}>₹{parseFloat(invoice.taxable_amount || 0).toLocaleString()}</Text></View>
            <View style={styles.priceRow}><Text style={[styles.priceLabel, { color: colors.textMuted }]}>CGST (9%)</Text><Text style={[styles.priceValue, { color: colors.text }]}>₹{parseFloat(invoice.cgst || 0).toLocaleString()}</Text></View>
            <View style={styles.priceRow}><Text style={[styles.priceLabel, { color: colors.textMuted }]}>SGST (9%)</Text><Text style={[styles.priceValue, { color: colors.text }]}>₹{parseFloat(invoice.sgst || 0).toLocaleString()}</Text></View>
            <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 12 }]} />
            <View style={styles.totalRow}><Text style={[styles.totalLabel, { color: colors.text }]}>Total Amount</Text><Text style={styles.totalValue}>₹{parseFloat(invoice.total_amount).toLocaleString()}</Text></View>
          </View>

          <TouchableOpacity style={styles.printBtn} onPress={handlePrint}>
            <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.printGradient}>
              <Printer size={20} color="#fff" /><Text style={styles.printText}>PRINT & DOWNLOAD PDF</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 24, marginTop: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '800' },
  statusBanner: { marginHorizontal: 20, padding: 16, borderRadius: 20, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  statusInfo: { gap: 2 },
  statusLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  statusValue: { fontSize: 16, fontWeight: '900' },
  card: { marginHorizontal: 20, borderRadius: 24, borderWidth: 1, padding: 20, marginBottom: 24 },
  cardSection: { gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  sectionTitle: { fontSize: 14, fontWeight: '800' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoLabel: { fontSize: 13, fontWeight: '600' },
  infoValue: { fontSize: 13, fontWeight: '700' },
  divider: { height: 1, marginVertical: 16 },
  custName: { fontSize: 16, fontWeight: '800' },
  custMeta: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  sectionLabel: { fontSize: 11, fontWeight: '800', marginLeft: 36, marginBottom: 12, letterSpacing: 1 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  itemMain: { gap: 4 },
  itemName: { fontSize: 14, fontWeight: '800' },
  itemMeta: { fontSize: 12, fontWeight: '600' },
  itemTotal: { fontSize: 14, fontWeight: '900' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel: { fontSize: 13, fontWeight: '600' },
  priceValue: { fontSize: 13, fontWeight: '700' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 18, fontWeight: '800' },
  totalValue: { fontSize: 22, fontWeight: '900', color: COLORS.primary },
  printBtn: { marginHorizontal: 20, borderRadius: 16, overflow: 'hidden', marginTop: 8 },
  printGradient: { height: 56, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
  printText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 1 },
});

export default ViewInvoiceScreen;
