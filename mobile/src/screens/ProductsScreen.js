import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, Modal, KeyboardAvoidingView, Platform, Animated, Vibration, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, Package, Scan, X, Trash2 } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import { getProducts, getProductByBarcode, deleteProduct, createProduct } from '../services/api';
import { scale, moderateScale, verticalScale, SCREEN_WIDTH } from '../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const ProductsScreen = () => {
  const { isDark, colors } = useTheme();
  const insets = useSafeAreaInsets();
  const scanned = useRef(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isScanningFromModal, setIsScanningFromModal] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [isSearchingAPI, setIsSearchingAPI] = useState(false);
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  const [scannedData, setScannedData] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const initialProductState = { name: '', price: '', stock: '0', hsn: '', barcode: '', unit: 'PCS' };
  const [newProduct, setNewProduct] = useState(initialProductState);

  useEffect(() => {
    fetchProducts();
    if (!permission) requestPermission();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || newProduct.stock === '') {
      Alert.alert('Validation Error', 'Please fill Product Name and Stock Quantity.');
      return;
    }
    if (!newProduct.price) {
      Alert.alert('Validation Error', 'Please enter the Price manually.');
      return;
    }
    try {
      setLoading(true);
      await createProduct(newProduct);
      setNewProduct(initialProductState);
      setScannedData(null);
      setShowAddModal(false);
      fetchProducts();
      Alert.alert('Success', 'Product added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add product.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id, name) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteProduct(id);
              setProducts(products.filter(p => p.id !== id));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleScan = async (fromModal) => {
    if (!permission || !permission.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permission Denied', 'Camera access is required.');
        return;
      }
    }
    setScannedData(null);
    scanned.current = false;
    setIsScanning(true);
    setIsScanningFromModal(fromModal || false);
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, { toValue: 240, duration: 2000, useNativeDriver: true }),
        Animated.timing(scanLineAnim, { toValue: 0, duration: 2000, useNativeDriver: true })
      ])
    ).start();
  };

  const onBarcodeScanned = async ({ type, data }) => {
    if (scanned.current || isSearchingAPI) return;
    
    console.log(`[Scanner] Scanned ${type} with data: ${data}`);
    scanned.current = true;
    Vibration.vibrate(100);
    setIsSearchingAPI(true);

    try {
      const response = await getProductByBarcode(data);
      const { source, product } = response.data;
      
      console.log(`[Scanner] API Response: source=${source}, product=${product?.name}`);
      
      setIsSearchingAPI(false);
      setIsScanning(false);
      
      if (source === 'local') {
        Alert.alert('In Stock', `"${product.name}" is already in your inventory.`, [
          { text: 'OK', onPress: () => { scanned.current = false; } }
        ]);
        return;
      }
      
      setNewProduct({
        name: product.name || '',
        price: product.price ? String(product.price) : '',
        stock: '1',
        hsn: product.hsn || '',
        barcode: data,
        unit: product.unit || 'PCS'
      });
      setShowAddModal(true);
    } catch (error) {
      console.error('[Scanner] Lookup error:', error);
      setIsSearchingAPI(false);
      setIsScanning(false);
      setNewProduct({ ...initialProductState, barcode: data });
      setShowAddModal(true);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.hsn && p.hsn.includes(searchTerm)) ||
    (p.barcode && p.barcode.includes(searchTerm))
  );

  const renderItem = ({ item }) => (
    <View style={[styles.productItem, { backgroundColor: colors.card, borderColor: colors.border }, SHADOW.small]}>
      <View style={[styles.productImage, { backgroundColor: COLORS.primary + '15' }]}>
        <Package size={24} color={COLORS.primary} />
      </View>
      <View style={styles.productInfo}>
        <View style={styles.productTop}>
          <Text style={[styles.productName, { color: colors.text }]}>{item.name}</Text>
          <TouchableOpacity onPress={() => handleDelete(item.id, item.name)}>
            <Trash2 size={16} color="#f87171" />
          </TouchableOpacity>
        </View>
        <View style={styles.productMid}>
          <Text style={[styles.productHsn, { color: colors.textMuted }]}>HSN: {item.hsn || 'N/A'}</Text>
          <Text style={[styles.productStockCount, { color: colors.textMuted }]}>Stock: {item.stock} {item.unit}</Text>
        </View>
        <View style={styles.productBottom}>
          <Text style={[styles.productPrice, { color: colors.text }]}>₹ {parseFloat(item.price).toLocaleString()}</Text>
          <View style={[styles.statusTag, item.stock > 0 ? styles.tagIn : styles.tagOut]}>
            <Text style={styles.tagText}>{item.stock > 0 ? 'IN STOCK' : 'OUT'}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <LinearGradient colors={isDark ? ['#0f172a', '#1e293b'] : ['#f8fafc', '#f1f5f9']} style={StyleSheet.absoluteFill} />
      <View style={[styles.decorCircle, { top: -50, right: -100, width: 300, height: 300, backgroundColor: isDark ? 'rgba(34, 197, 94, 0.08)' : 'rgba(34, 197, 94, 0.05)' }]} />
      <View style={[styles.decorCircle, { bottom: 100, left: -150, width: 350, height: 350, backgroundColor: isDark ? 'rgba(30, 64, 175, 0.06)' : 'rgba(30, 64, 175, 0.03)' }]} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Inventory</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => handleScan(false)}>
              <Scan size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={[styles.searchContainer, { backgroundColor: colors.glass, borderColor: colors.border }]}>
            <Search size={18} color={colors.textMuted} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search products..."
              placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>

          <FlatList
            data={filteredProducts}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Package size={48} color={colors.border} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No products found</Text>
              </View>
            }
          />
        </View>
      </SafeAreaView>

      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContent}>
            <View style={[styles.modalCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>New Product</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}><X size={24} color={colors.textMuted} /></TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: colors.textMuted }]}>Product Name</Text>
                  <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={newProduct.name} onChangeText={(t) => setNewProduct({ ...newProduct, name: t })} placeholder="Enter name" placeholderTextColor={colors.textMuted} />
                </View>
                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                    <Text style={[styles.label, { color: colors.textMuted }]}>Price (₹)</Text>
                    <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={newProduct.price} keyboardType="numeric" onChangeText={(t) => setNewProduct({ ...newProduct, price: t })} placeholder="0.00" placeholderTextColor={colors.textMuted} />
                  </View>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={[styles.label, { color: colors.textMuted }]}>Stock</Text>
                    <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={newProduct.stock} keyboardType="numeric" onChangeText={(t) => setNewProduct({ ...newProduct, stock: t })} placeholder="0" placeholderTextColor={colors.textMuted} />
                  </View>
                </View>
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: colors.textMuted }]}>HSN Code</Text>
                  <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={newProduct.hsn} onChangeText={(t) => setNewProduct({ ...newProduct, hsn: t })} placeholder="Optional" placeholderTextColor={colors.textMuted} />
                </View>
                <TouchableOpacity style={styles.saveBtn} onPress={handleAddProduct}><Text style={styles.saveBtnText}>SAVE PRODUCT</Text></TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal visible={isScanning && !isScanningFromModal} animationType="fade">
        <View style={styles.cameraContainer}>
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            enableTorch={isFlashOn}
            onBarcodeScanned={onBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: [
                'ean13', 'ean8', 'upc_a', 'upc_e', 
                'code128', 'code39', 'code93', 'itf14',
                'codabar', 'aztec', 'datamatrix', 'qr', 'pdf417'
              ],
            }}
          />
          <SafeAreaView style={styles.cameraOverlay}>
            <View style={styles.cameraHeader}>
              <TouchableOpacity onPress={() => setIsScanning(false)}><X size={28} color="#fff" /></TouchableOpacity>
              <Text style={styles.cameraTitle}>Scan Barcode</Text>
              <TouchableOpacity onPress={() => setIsFlashOn(!isFlashOn)}><Text style={{ fontSize: 24 }}>{isFlashOn ? '⚡' : '🔦'}</Text></TouchableOpacity>
            </View>
            <View style={styles.scanTarget}>
              <View style={[styles.scanCorner, styles.tl]} /><View style={[styles.scanCorner, styles.tr]} /><View style={[styles.scanCorner, styles.bl]} /><View style={[styles.scanCorner, styles.br]} />
              <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineAnim }] }]} />
            </View>
            <Text style={styles.scanPrompt}>{isSearchingAPI ? 'Searching...' : 'Align barcode within frame'}</Text>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  safeArea: { flex: 1 },
  decorCircle: { position: 'absolute', borderRadius: 999 },
  container: { flex: 1, paddingHorizontal: SPACING.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 8 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  addBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, marginBottom: 20, height: 52 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15 },
  listContent: { paddingBottom: 120 },
  productItem: { flexDirection: 'row', padding: 16, borderRadius: 24, borderWidth: 1, marginBottom: 12, alignItems: 'center', gap: 16 },
  productImage: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  productInfo: { flex: 1 },
  productTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  productName: { fontSize: 15, fontWeight: '800' },
  productMid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  productHsn: { fontSize: 11, fontWeight: '600' },
  productStockCount: { fontSize: 11, fontWeight: '600' },
  productBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productPrice: { fontSize: 16, fontWeight: '900' },
  statusTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  tagIn: { backgroundColor: 'rgba(34, 197, 94, 0.15)' },
  tagOut: { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
  tagText: { fontSize: 9, fontWeight: '900', color: '#4ade80' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyText: { fontSize: 15, marginTop: 12, fontWeight: '600' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { width: '100%' },
  modalCard: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  formGroup: { marginBottom: 16 },
  formRow: { flexDirection: 'row', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 8, marginLeft: 4 },
  input: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, height: 52, fontSize: 15 },
  saveBtn: { backgroundColor: COLORS.primary, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 1 },
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  cameraOverlay: { flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 40 },
  cameraHeader: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 24, alignItems: 'center' },
  cameraTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  scanTarget: { width: 250, height: 250, justifyContent: 'center', alignItems: 'center' },
  scanCorner: { position: 'absolute', width: 40, height: 40, borderColor: COLORS.primary, borderWidth: 4 },
  tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 20 },
  tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 20 },
  bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 20 },
  br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 20 },
  scanLine: { width: '90%', height: 2, backgroundColor: COLORS.primary },
  scanPrompt: { color: '#fff', fontSize: 14, fontWeight: '700', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
});

export default ProductsScreen;
