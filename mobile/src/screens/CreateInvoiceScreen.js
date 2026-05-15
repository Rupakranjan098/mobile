import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, FlatList, Vibration, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, User, Plus, Scan, Package, Check, X, Zap } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import { getCustomers, getProducts, createInvoice } from '../services/api';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { getProductDetails } from '../utils/barcodeApi';



const CreateInvoiceScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [items, setItems] = useState([]);
  const [customerModal, setCustomerModal] = useState(false);
  const [productModal, setProductModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isFetchingBarcode, setIsFetchingBarcode] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  const startScan = async () => {
    if (!permission?.granted) {
      const r = await requestPermission();
      if (!r.granted) { Alert.alert('Permission Denied', 'Camera access required.'); return; }
    }
    setLastScanned(null);
    setIsScanning(true);
    Animated.loop(Animated.sequence([
      Animated.timing(scanLineAnim, { toValue: 260, duration: 2000, useNativeDriver: true }),
      Animated.timing(scanLineAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
    ])).start();
  };

  const onBarcodeScannedForInvoice = async ({ data }) => {
    if (lastScanned === data || isFetchingBarcode) return;
    setLastScanned(data);
    if (data.startsWith('exp://') || data.startsWith('http') || data.includes('192.168')) return;
    Vibration.vibrate(100);
    setIsScanning(false);
    setIsFetchingBarcode(true);

    // Use shared getProductDetails utility
    // OpenFoodFacts → name, UPCItemDB → price, local HSN_DATA → HSN + GST
    const result = await getProductDetails(data);
    setIsFetchingBarcode(false);

    if (!result.found) {
      Alert.alert('Not Found', `Barcode ${data} not found. Add it to Products first.`);
      return;
    }

    // Add or increment item in invoice
    const existing = items.find(i => i.barcode === data);
    if (existing) {
      setItems(items.map(i => i.barcode === data
        ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price }
        : i));
    } else {
      setItems(prev => [...prev, {
        product_id: null,
        barcode: data,
        name: result.name,
        price: result.price,
        quantity: 1,
        total: result.price,
        hsn: result.hsn,
        gst: result.gst,
        fromScan: true,
      }]);
    }
  };

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
      Alert.alert('Error', 'Failed to load customers or products');
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
    const discount = 0; // Can be made dynamic later
    const taxableAmount = subTotal - discount;
    const cgst = taxableAmount * 0.09;
    const sgst = taxableAmount * 0.09;
    const total = taxableAmount + cgst + sgst;
    return { subTotal, discount, taxableAmount, cgst, sgst, total };
  };

  const { subTotal, discount, taxableAmount, cgst, sgst, total } = calculateTotals();

  const handleGenerateInvoice = async () => {
    if (!selectedCustomer) {
      Alert.alert('Error', 'Please select a customer');
      return;
    }
    if (items.length === 0) {
      Alert.alert('Error', 'Please add at least one item');
      return;
    }

    setLoading(true);
    try {
      const invoiceData = {
        customer_id: selectedCustomer.id,
        invoice_number: `INV-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        sub_total: subTotal,
        taxable_amount: taxableAmount,
        tax_amount: cgst + sgst,
        cgst: cgst,
        sgst: sgst,
        total_amount: total,
        status: 'Unpaid',
        items: items
      };

      await createInvoice(invoiceData);
      Alert.alert('Success', 'Invoice generated successfully', [
        { text: 'OK', onPress: () => navigation.navigate('Invoices') }
      ]);
    } catch (error) {
      console.error('Error creating invoice:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to generate invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 100}}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ChevronLeft size={24} color={COLORS.textMain} />
            </TouchableOpacity>
            <Text style={styles.title}>Create Invoice</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Customer Details</Text>
        <TouchableOpacity 
          style={[styles.card, SHADOW.small]}
          onPress={() => setCustomerModal(true)}
        >
          {selectedCustomer ? (
            <View style={styles.customerInfo}>
              <View style={styles.customerAvatar}>
                <User size={20} color={COLORS.primary} />
              </View>
              <View style={styles.customerDetails}>
                <Text style={styles.customerName}>{selectedCustomer.name}</Text>
                <Text style={styles.customerMeta}>{selectedCustomer.gstin || 'No GSTIN'}</Text>
                <Text style={styles.customerMeta}>{selectedCustomer.city}, {selectedCustomer.state}</Text>
              </View>
              <Check size={20} color={COLORS.primary} />
            </View>
          ) : (
            <View style={styles.placeholderCard}>
              <User size={24} color={COLORS.textMuted} />
              <Text style={styles.placeholderText}>Select Customer</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Invoice Items</Text>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <TouchableOpacity style={styles.scanItemBtn} onPress={startScan}>
              {isFetchingBarcode
                ? <ActivityIndicator size="small" color="#fff" />
                : <><Scan size={15} color="#fff" /><Text style={styles.scanItemText}>Scan</Text></>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.addItemBtn} onPress={() => setProductModal(true)}>
              <Plus size={16} color={COLORS.primary} />
              <Text style={styles.addItemText}>Add Item</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.itemsList}>
          {items.map((item, index) => (
            <View key={index} style={[styles.card, SHADOW.small, styles.itemCard]}>
              <View style={styles.itemMain}>
                <View style={[styles.itemIcon, item.fromScan && { backgroundColor: '#dcfce7' }]}>
                  {item.fromScan ? <Scan size={16} color={COLORS.primary} /> : <Package size={16} color={COLORS.textMuted} />}
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemMeta}>HSN: {item.hsn || 'N/A'} | ₹{item.price} × {item.quantity}</Text>
                </View>
                <View style={styles.itemTotal}>
                  <Text style={styles.itemTotalValue}>₹{item.total.toLocaleString()}</Text>
                  <TouchableOpacity onPress={() => setItems(items.filter((_, i) => i !== index))}>
                    <X size={14} color={COLORS.danger} style={{ marginTop: 4 }} />
                  </TouchableOpacity>
                </View>
              </View>
              {item.fromScan && (
                <View style={styles.scannedBadge}>
                  <Zap size={10} color={COLORS.primary} />
                  <Text style={styles.scannedBadgeText}>Auto-filled from barcode scan</Text>
                </View>
              )}
            </View>
          ))}
          {items.length === 0 && (
            <View style={styles.emptyItemsBox}>
              <Scan size={32} color={COLORS.border} />
              <Text style={styles.emptyItems}>Scan a barcode or tap Add Item</Text>
            </View>
          )}
        </View>

        {items.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Price Details</Text>
            <View style={[styles.card, SHADOW.small, styles.priceCard]}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Sub Total</Text>
                <Text style={styles.priceValue}>₹ {subTotal.toLocaleString()}</Text>
              </View>
              <View style={[styles.priceRow, { marginTop: 8 }]}>
                <Text style={[styles.priceLabel, { fontWeight: '700', color: COLORS.textMain }]}>Taxable Amount</Text>
                <Text style={[styles.priceValue, { fontWeight: '700', color: COLORS.textMain }]}>₹ {taxableAmount.toLocaleString()}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.taxGrid}>
                <View style={styles.taxItem}>
                  <Text style={styles.taxLabel}>CGST (9%)</Text>
                  <Text style={styles.taxValue}>₹ {cgst.toLocaleString()}</Text>
                </View>
                <View style={styles.taxItem}>
                  <Text style={styles.taxLabel}>SGST (9%)</Text>
                  <Text style={styles.taxValue}>₹ {sgst.toLocaleString()}</Text>
                </View>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalValue}>₹ {total.toLocaleString()}</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.generateBtn, loading && styles.disabledBtn]} 
          onPress={handleGenerateInvoice}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.textWhite} />
          ) : (
            <>
              <Text style={styles.generateBtnText}>Generate Invoice</Text>
              <Check size={20} color={COLORS.textWhite} />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Customer Selection Modal */}
      <Modal visible={customerModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Customer</Text>
              <TouchableOpacity onPress={() => setCustomerModal(false)}>
                <Text style={styles.closeBtn}>Close</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={customers}
              keyExtractor={item => item.id.toString()}
              renderItem={({item}) => (
                <TouchableOpacity 
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedCustomer(item);
                    setCustomerModal(false);
                  }}
                >
                  <Text style={styles.modalItemName}>{item.name}</Text>
                  <Text style={styles.modalItemMeta}>{item.gstin || 'No GSTIN'}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Product Selection Modal */}
      <Modal visible={productModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Product</Text>
              <TouchableOpacity onPress={() => setProductModal(false)}>
                <Text style={styles.closeBtn}>Close</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={products}
              keyExtractor={item => item.id.toString()}
              renderItem={({item}) => (
                <TouchableOpacity 
                  style={styles.modalItem}
                  onPress={() => addItem(item)}
                >
                  <Text style={styles.modalItemName}>{item.name}</Text>
                  <Text style={styles.modalItemMeta}>HSN: {item.hsn} | ₹{item.price}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Barcode Scanner Modal */}
      <Modal visible={isScanning} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', padding: 16, alignItems: 'center' }}>
            <TouchableOpacity onPress={() => setIsScanning(false)} style={styles.scanCloseBtn}>
              <X size={20} color="#1e293b" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#fff' }}>Scan Product</Text>
            <View style={{ width: 40 }} />
          </View>
          <Text style={{ color: '#6b7280', fontSize: 13, textAlign: 'center', marginBottom: 24, paddingHorizontal: 32 }}>
            Point at product barcode. Name, price & HSN will auto-fill.
          </Text>
          <View style={styles.scanCameraBox}>
            <CameraView
              style={{ width: '100%', height: '100%' }}
              facing="back"
              onBarcodeScanned={onBarcodeScannedForInvoice}
              barcodeScannerSettings={{ barcodeTypes: ['ean13','ean8','upc_a','upc_e','code128','code39','qr'] }}
            />
            <View style={[styles.corner, styles.cTL]} />
            <View style={[styles.corner, styles.cTR]} />
            <View style={[styles.corner, styles.cBL]} />
            <View style={[styles.corner, styles.cBR]} />
            <Animated.View style={[styles.invoiceScanLine, { transform: [{ translateY: scanLineAnim }] }]} />
          </View>
          <Text style={{ color: '#6b7280', marginTop: 24, fontSize: 13 }}>Scanning for barcode…</Text>
        </SafeAreaView>
      </Modal>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 24,
    marginBottom: 12,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  customerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  customerMeta: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  placeholderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addItemText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  scanItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  scanItemText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  scannedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  scannedBadgeText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyItemsBox: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 10,
  },
  scanCloseBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center', alignItems: 'center',
  },
  scanCameraBox: {
    width: 280, height: 280,
    borderRadius: 16, overflow: 'hidden',
    position: 'relative', backgroundColor: '#000',
  },
  corner: {
    position: 'absolute', width: 28, height: 28,
    borderColor: COLORS.primary, borderWidth: 3,
  },
  cTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 8 },
  cTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 8 },
  cBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 8 },
  cBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 8 },
  invoiceScanLine: {
    position: 'absolute', left: 0, right: 0, height: 2.5,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary, shadowOpacity: 1, shadowRadius: 6, elevation: 6,
  },
  itemsList: {
    gap: 12,
  },
  itemCard: {
    padding: 12,
  },
  itemMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  itemMeta: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  itemTotal: {
    alignItems: 'flex-end',
  },
  itemTotalValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  emptyItems: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 10,
  },
  priceCard: {
    padding: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  priceValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
    borderStyle: 'dashed',
  },
  taxGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  taxItem: {
    flex: 1,
  },
  taxLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  taxValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  generateBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  generateBtnText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '60%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  closeBtn: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  modalItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  modalItemMeta: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});

export default CreateInvoiceScreen;
