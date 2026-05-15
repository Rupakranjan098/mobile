import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, FlatList, Vibration, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, User, Plus, Scan, Package, Check, X, Zap } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import { getCustomers, getProducts, createInvoice } from '../services/api';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { getProductDetails } from '../utils/barcodeApi';
import { useTheme } from '../context/ThemeContext';
import { scale, moderateScale, verticalScale } from '../utils/responsive';
import { LinearGradient } from 'expo-linear-gradient';

const SCANNER_SETTINGS = {
  barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'qr', 'pdf417'],
};

const CreateInvoiceScreen = ({ navigation }) => {
  const { isDark, colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [items, setItems] = useState([]);
  const [customerModal, setCustomerModal] = useState(false);
  const [productModal, setProductModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isFetchingBarcode, setIsFetchingBarcode] = useState(false);
  const scanned = useRef(false);
  const [permission, requestPermission] = useCameraPermissions();
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([getCustomers(), getProducts()]);
      setCustomers(custRes.data);
      setProducts(prodRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const startScan = async () => {
    if (!permission?.granted) {
      const r = await requestPermission();
      if (!r.granted) { Alert.alert('Permission Denied', 'Camera access required.'); return; }
    }
    scanned.current = false;
    setIsScanning(true);
    Animated.loop(Animated.sequence([
      Animated.timing(scanLineAnim, { toValue: 240, duration: 1500, useNativeDriver: true }),
      Animated.timing(scanLineAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
    ])).start();
  };

  const onBarcodeScannedForInvoice = async (result) => {
    if (!result || !result.data || scanned.current || isFetchingBarcode) return;
    const { data } = result;
    if (data.startsWith('exp://') || data.startsWith('http')) return;

    scanned.current = true;
    Vibration.vibrate(100);
    setIsScanning(false);
    setIsFetchingBarcode(true);

    try {
      const res = await getProductDetails(data);
      setIsFetchingBarcode(false);

      if (!res.found) {
        Alert.alert('Not Found', `Barcode ${data} not found in database.`, [
          { text: 'OK', onPress: () => { scanned.current = false; } }
        ]);
        return;
      }

      const existing = items.find(i => i.barcode === data);
      if (existing) {
        setItems(items.map(i => i.barcode === data
          ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price }
          : i));
      } else {
        setItems(prev => [...prev, {
          product_id: res.id || null,
          barcode: data,
          name: res.name,
          price: res.price,
          quantity: 1,
          total: res.price,
          hsn: res.hsn,
          gst: res.gst,
          fromScan: true,
        }]);
      }
    } catch (error) {
      console.error('Scan error:', error);
      setIsFetchingBarcode(false);
      Alert.alert('Error', 'Failed to fetch product details.');
    } finally {
      scanned.current = false;
    }
  };

  const addItem = (product) => {
    const existing = items.find(i => i.product_id === product.id);
    if (existing) {
      setItems(items.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price } : i));
    } else {
      setItems([...items, { 
        product_id: product.id, 
        name: product.name, 
        price: product.price, 
        quantity: 1, 
        total: product.price,
        hsn: product.hsn
      }]);
    }
    setProductModal(false);
  };

  const calculateTotals = () => {
    const subTotal = items.reduce((acc, item) => acc + item.total, 0);
    const taxableAmount = subTotal;
    const cgst = taxableAmount * 0.09;
    const sgst = taxableAmount * 0.09;
    const total = taxableAmount + cgst + sgst;
    return { subTotal, taxableAmount, cgst, sgst, total };
  };

  const { subTotal, taxableAmount, cgst, sgst, total } = calculateTotals();

  const handleGenerateInvoice = async () => {
    if (!selectedCustomer) { Alert.alert('Error', 'Please select a customer'); return; }
    if (items.length === 0) { Alert.alert('Error', 'Please add items'); return; }
    setLoading(true);
    try {
      await createInvoice({
        customer_id: selectedCustomer.id,
        invoice_number: `INV-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        sub_total: subTotal,
        taxable_amount: taxableAmount,
        tax_amount: cgst + sgst,
        cgst, sgst, total_amount: total,
        status: 'Unpaid',
        items
      });
      Alert.alert('Success', 'Invoice generated!', [{ text: 'OK', onPress: () => navigation.navigate('Invoices') }]);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <LinearGradient colors={isDark ? ['#0f172a', '#1e293b'] : ['#f8fafc', '#f1f5f9']} style={StyleSheet.absoluteFill} />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.glass }]}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>Create Invoice</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>CUSTOMER DETAILS</Text>
            <TouchableOpacity style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, SHADOW.small]} onPress={() => setCustomerModal(true)}>
              {selectedCustomer ? (
                <View style={styles.customerInfo}>
                  <View style={[styles.customerAvatar, { backgroundColor: COLORS.primary + '15' }]}><User size={20} color={COLORS.primary} /></View>
                  <View style={styles.customerDetails}>
                    <Text style={[styles.customerName, { color: colors.text }]}>{selectedCustomer.name}</Text>
                    <Text style={[styles.customerMeta, { color: colors.textMuted }]}>{selectedCustomer.gstin || 'No GSTIN'}</Text>
                  </View>
                  <Check size={20} color={COLORS.primary} />
                </View>
              ) : (
                <View style={styles.placeholderCard}><User size={24} color={colors.textMuted} /><Text style={[styles.placeholderText, { color: colors.textMuted }]}>Select Customer</Text></View>
              )}
            </TouchableOpacity>

            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>INVOICE ITEMS</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity style={styles.scanItemBtn} onPress={startScan}>
                  <Scan size={14} color="#fff" /><Text style={styles.scanItemText}>Scan</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.addItemBtn, { backgroundColor: colors.glass, borderColor: colors.border }]} onPress={() => setProductModal(true)}>
                  <Plus size={14} color={COLORS.primary} /><Text style={[styles.addItemText, { color: COLORS.primary }]}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.itemsList}>
              {items.map((item, index) => (
                <View key={index} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, SHADOW.small, styles.itemCard]}>
                  <View style={styles.itemMain}>
                    <View style={[styles.itemIcon, { backgroundColor: colors.glass }]}>{item.fromScan ? <Scan size={16} color={COLORS.primary} /> : <Package size={16} color={colors.textMuted} />}</View>
                    <View style={styles.itemDetails}>
                      <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                      <Text style={[styles.itemMeta, { color: colors.textMuted }]}>HSN: {item.hsn || 'N/A'} | ₹{item.price} × {item.quantity}</Text>
                    </View>
                    <View style={styles.itemTotal}>
                      <Text style={[styles.itemTotalValue, { color: colors.text }]}>₹{item.total.toLocaleString()}</Text>
                      <TouchableOpacity onPress={() => setItems(items.filter((_, i) => i !== index))}><X size={14} color="#f87171" /></TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
              {items.length === 0 && (
                <View style={[styles.emptyItemsBox, { backgroundColor: colors.glass, borderColor: colors.border }]}><Scan size={32} color={colors.border} /><Text style={[styles.emptyItems, { color: colors.textMuted }]}>Scan barcode or tap Add Item</Text></View>
              )}
            </View>

            {items.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { color: colors.textMuted, marginTop: 32 }]}>PRICE DETAILS</Text>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, SHADOW.small, styles.priceCard]}>
                  <View style={styles.priceRow}><Text style={[styles.priceLabel, { color: colors.textMuted }]}>Sub Total</Text><Text style={[styles.priceValue, { color: colors.text }]}>₹ {subTotal.toLocaleString()}</Text></View>
                  <View style={styles.divider} />
                  <View style={styles.taxGrid}>
                    <View style={styles.taxItem}><Text style={[styles.taxLabel, { color: colors.textMuted }]}>CGST (9%)</Text><Text style={[styles.taxValue, { color: colors.text }]}>₹ {cgst.toLocaleString()}</Text></View>
                    <View style={styles.taxItem}><Text style={[styles.taxLabel, { color: colors.textMuted }]}>SGST (9%)</Text><Text style={[styles.taxValue, { color: colors.text }]}>₹ {sgst.toLocaleString()}</Text></View>
                  </View>
                  <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
                    <Text style={[styles.totalLabel, { color: colors.text }]}>Total Amount</Text>
                    <Text style={styles.totalValue}>₹ {total.toLocaleString()}</Text>
                  </View>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={[styles.generateBtn, loading && styles.disabledBtn]} onPress={handleGenerateInvoice} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <><Text style={styles.generateBtnText}>Generate Invoice</Text><Check size={20} color="#fff" /></>}
        </TouchableOpacity>
      </View>

      {/* Customer Modal */}
      <Modal visible={customerModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <View style={styles.modalHeader}><Text style={[styles.modalTitle, { color: colors.text }]}>Select Customer</Text><TouchableOpacity onPress={() => setCustomerModal(false)}><X size={24} color={colors.textMuted} /></TouchableOpacity></View>
            <FlatList data={customers} keyExtractor={item => item.id.toString()} renderItem={({item}) => (
              <TouchableOpacity style={[styles.modalItem, { borderBottomColor: colors.border }]} onPress={() => { setSelectedCustomer(item); setCustomerModal(false); }}>
                <Text style={[styles.modalItemName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.modalItemMeta, { color: colors.textMuted }]}>{item.gstin || 'No GSTIN'}</Text>
              </TouchableOpacity>
            )} />
          </View>
        </View>
      </Modal>

      {/* Product Modal */}
      <Modal visible={productModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <View style={styles.modalHeader}><Text style={[styles.modalTitle, { color: colors.text }]}>Select Product</Text><TouchableOpacity onPress={() => setProductModal(false)}><X size={24} color={colors.textMuted} /></TouchableOpacity></View>
            <FlatList data={products} keyExtractor={item => item.id.toString()} renderItem={({item}) => (
              <TouchableOpacity style={[styles.modalItem, { borderBottomColor: colors.border }]} onPress={() => addItem(item)}>
                <Text style={[styles.modalItemName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.modalItemMeta, { color: colors.textMuted }]}>₹{item.price}</Text>
              </TouchableOpacity>
            )} />
          </View>
        </View>
      </Modal>

      {/* Scanner Modal */}
      <Modal visible={isScanning} animationType="fade">
        <View style={styles.cameraContainer}>
          <CameraView style={StyleSheet.absoluteFill} facing="back" onBarcodeScanned={onBarcodeScannedForInvoice} barcodeScannerSettings={SCANNER_SETTINGS} />
          <SafeAreaView style={styles.cameraOverlay}>
            <View style={styles.cameraHeader}><TouchableOpacity onPress={() => setIsScanning(false)}><X size={28} color="#fff" /></TouchableOpacity><Text style={styles.cameraTitle}>Scan Barcode</Text><View style={{ width: 28 }} /></View>
            <View style={styles.scanTarget}><View style={[styles.scanCorner, styles.tl]} /><View style={[styles.scanCorner, styles.tr]} /><View style={[styles.scanCorner, styles.bl]} /><View style={[styles.scanCorner, styles.br]} /><Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineAnim }] }]} /></View>
            <Text style={styles.scanPrompt}>Align barcode within the frame</Text>
          </SafeAreaView>
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
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800' },
  sectionLabel: { fontSize: 11, fontWeight: '800', marginBottom: 12, letterSpacing: 1 },
  card: { borderRadius: 20, borderWidth: 1, padding: 16 },
  customerInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  customerAvatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  customerDetails: { flex: 1 },
  customerName: { fontSize: 16, fontWeight: '800' },
  customerMeta: { fontSize: 12 },
  placeholderCard: { flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'center', paddingVertical: 12 },
  placeholderText: { fontSize: 15, fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, marginBottom: 12 },
  addItemBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  addItemText: { fontSize: 12, fontWeight: '800' },
  scanItemBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  scanItemText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  itemsList: { gap: 12 },
  itemCard: { padding: 12 },
  itemMain: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '700' },
  itemMeta: { fontSize: 12, marginTop: 2 },
  itemTotal: { alignItems: 'flex-end', gap: 4 },
  itemTotalValue: { fontSize: 14, fontWeight: '800' },
  emptyItemsBox: { alignItems: 'center', paddingVertical: 40, borderRadius: 24, borderWidth: 1, borderStyle: 'dashed', gap: 12 },
  emptyItems: { fontSize: 13, fontWeight: '600' },
  priceCard: { padding: 20 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between' },
  priceLabel: { fontSize: 14, fontWeight: '600' },
  priceValue: { fontSize: 14, fontWeight: '700' },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginVertical: 16 },
  taxGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  taxItem: { flex: 1 },
  taxLabel: { fontSize: 11, fontWeight: '700', marginBottom: 4 },
  taxValue: { fontSize: 13, fontWeight: '800' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, borderTopWidth: 1 },
  totalLabel: { fontSize: 18, fontWeight: '800' },
  totalValue: { fontSize: 24, fontWeight: '900', color: COLORS.primary },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, borderTopWidth: 1 },
  generateBtn: { backgroundColor: COLORS.primary, height: 56, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  generateBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, height: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  modalItem: { paddingVertical: 16, borderBottomWidth: 1 },
  modalItemName: { fontSize: 15, fontWeight: '700' },
  modalItemMeta: { fontSize: 12, marginTop: 4 },
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  cameraOverlay: { flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 40 },
  cameraHeader: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 24, alignItems: 'center' },
  cameraTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  scanTarget: { width: scale(250), height: scale(250), justifyContent: 'center', alignItems: 'center' },
  scanCorner: { position: 'absolute', width: scale(40), height: scale(40), borderColor: COLORS.primary, borderWidth: 4 },
  tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 20 },
  tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 20 },
  bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 20 },
  br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 20 },
  scanLine: { width: '90%', height: scale(3), backgroundColor: COLORS.primary, shadowColor: COLORS.primary, shadowOpacity: 0.8, shadowRadius: 10, elevation: 15 },
  scanPrompt: { color: '#fff', fontSize: 14, fontWeight: '700', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
});

export default CreateInvoiceScreen;
