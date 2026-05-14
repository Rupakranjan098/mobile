import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, Modal, Linking, KeyboardAvoidingView, Platform, Animated, Vibration } from 'react-native';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, Package, Scan, X, Trash2 } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import { getProducts, getProductByBarcode, deleteProduct, createProduct } from '../services/api';
import { scale, moderateScale, verticalScale } from '../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ProductsScreen = () => {
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

  // Expanded mock DB for instant offline lookup
  const MOCK_PRODUCT_DB = {
    '8901030971032': { name: 'Lux Soap 100g',        price: '45',  hsn: '3401' },
    '8901491101836': { name: 'Lays Classic 50g',      price: '20',  hsn: '2106' },
    '8901058000103': { name: 'Amul Butter 100g',      price: '56',  hsn: '0405' },
    '8901207040406': { name: 'Colgate MaxFresh',       price: '95',  hsn: '3306' },
    '8901803000568': { name: 'Good Day Biscuits',      price: '10',  hsn: '1905' },
    '8901030895482': { name: 'Coca Cola 750ml',        price: '45',  hsn: '2202' },
    '8901030616117': { name: 'Thums Up 2L',            price: '99',  hsn: '2202' },
    '8901491503029': { name: 'Kurkure Masala',         price: '10',  hsn: '2106' },
    '8901719113590': { name: 'Maggi Noodles 70g',      price: '14',  hsn: '1902' },
    '8901058840211': { name: 'Amul Gold Milk 500ml',   price: '33',  hsn: '0401' },
    '8901030895488': { name: 'Coca Cola 300ml',        price: '35',  hsn: '2202' },
    '8906002680019': { name: 'Parle G Biscuit',        price: '5',   hsn: '1905' },
    '8901063151956': { name: 'Britannia Marie Gold',   price: '30',  hsn: '1905' },
    '8901030486301': { name: 'Lifebuoy Soap',          price: '42',  hsn: '3401' },
    '8901491524140': { name: 'Haldirams Namkeen',      price: '30',  hsn: '2106' },
  };

  const [scannedData, setScannedData] = useState(null);
  const [showNotFound, setShowNotFound] = useState(false);
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
    // Price is optional from API (not available for all Indian products)
    if (!newProduct.name || newProduct.stock === '') {
      Alert.alert('Validation Error', 'Please fill Product Name and Stock Quantity.');
      return;
    }
    if (!newProduct.price) {
      Alert.alert('Validation Error', 'Please enter the Price manually. Price could not be auto-fetched for this product.');
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
      console.error('API Error:', error.response?.status, error.response?.data);
      const errors = error.response?.data?.errors;
      
      if (errors) {
        let detailedMsg = '';
        Object.keys(errors).forEach(key => {
          detailedMsg += `${errors[key][0]}\n`;
        });
        Alert.alert('Validation Error', detailedMsg.trim());
      } else {
        Alert.alert('Error', 'Failed to add product. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id, name) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
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
              Alert.alert('Success', 'Product deleted successfully');
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Error', 'Failed to delete product');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    if (isScanning) {
      scanned.current = false;
    }
  }, [isScanning]);

  const handleScan = async (fromModal) => {
    if (!permission || !permission.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permission Denied', 'Camera access is required to scan barcodes.');
        return;
      }
    }
    setScannedData(null);
    scanned.current = false;
    setIsScanning(true);
    setIsScanningFromModal(fromModal || false);
    setIsFlashOn(false);
    
    // Start scan line animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, { toValue: 240, duration: 2000, useNativeDriver: true }),
        Animated.timing(scanLineAnim, { toValue: 0, duration: 2000, useNativeDriver: true })
      ])
    ).start();
  };

  const onBarcodeScanned = async ({ data }) => {
    if (scanned.current || isSearchingAPI || !isScanning) return;
    scanned.current = true;
    setScannedData(data);
    Vibration.vibrate(100);

    setIsSearchingAPI(true);
    try {
      const response = await getProductByBarcode(data);
      const { source, product } = response.data;

      setIsSearchingAPI(false);
      setIsScanning(false);

      if (source === 'local') {
        Alert.alert(
          'Already in Inventory', 
          `"${product.name}" is already in your stock.`,
          [{ text: 'OK', onPress: () => { scanned.current = false; } }]
        );
        return;
      }

      setNewProduct({
        name: product.name || '',
        price: product.price ? String(product.price) : '',
        stock: '0',
        hsn: product.hsn || '',
        barcode: data,
        unit: product.unit || 'PCS'
      });
      setShowAddModal(true);
      
    } catch (error) {
      console.error('Scan API Error:', error);
      setIsSearchingAPI(false);
      setIsScanning(false);
      
      setNewProduct({ ...initialProductState, barcode: data });
      setShowAddModal(true);
    }
  };

  const onBarcodeScannedFromModal = async ({ data }) => {
    if (scanned.current || isSearchingAPI) return;
    scanned.current = true;
    setScannedData(data);
    Vibration.vibrate(100);
    setIsSearchingAPI(true);

    try {
      const response = await getProductByBarcode(data);
      const { product } = response.data;

      setNewProduct(prev => ({
        ...prev,
        name: product.name || prev.name,
        price: product.price ? String(product.price) : prev.price,
        hsn: product.hsn || prev.hsn,
        barcode: data,
        unit: product.unit || prev.unit
      }));
    } catch (error) {
      console.error('Modal Scan API Error:', error);
      setNewProduct(prev => ({ ...prev, barcode: data }));
    } finally {
      setIsSearchingAPI(false);
      setIsScanning(false);
      setIsScanningFromModal(false);
      scanned.current = false;
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.hsn && p.hsn.includes(searchTerm)) ||
    (p.barcode && p.barcode.includes(searchTerm))
  );

  if (loading && !isScanning && !showAddModal) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={[styles.productItem, SHADOW.small]}>
      <View style={styles.productImage}>
        <Package size={24} color={COLORS.textMuted} />
      </View>
      <View style={styles.productInfo}>
        <View style={styles.productTop}>
          <Text style={styles.productName}>{item.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={styles.productStockCount}>{item.stock}</Text>
            <TouchableOpacity
              style={styles.deleteIconBtn}
              onPress={() => handleDelete(item.id, item.name)}
            >
              <Trash2 size={16} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.productMid}>
          <Text style={styles.productHsn}>HSN: {item.hsn || 'N/A'}</Text>
          {item.barcode && <Text style={styles.productBarcode}>Code: {item.barcode}</Text>}
        </View>
        <View style={styles.productBottom}>
          <Text style={styles.productPrice}>₹ {parseFloat(item.price).toLocaleString()}</Text>
          <View style={[styles.badge, styles[`badge${item.status?.replace(' ', '') || 'InStock'}`]]}>
            <Text style={[styles.badgeText, styles[`badgeText${item.status?.replace(' ', '') || 'InStock'}`]]}>{item.status || 'In Stock'}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Products</Text>
          <TouchableOpacity 
            style={styles.addBtn} 
            onPress={() => handleScan(false)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Scan size={22} color={COLORS.textWhite} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Search size={18} color={COLORS.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>
        </View>

        <FlatList
          data={filteredProducts}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Package size={48} color={COLORS.border} />
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          }
        />
      </View>

      {/* Add Product Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent={true} statusBarTranslucent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>

            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderIcon}>
                <Package size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.modalTitle}>Add New Product</Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => { setShowAddModal(false); setNewProduct(initialProductState); setScannedData(null); }}
              >
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Fetching banner */}
            {isSearchingAPI && (
              <View style={styles.apiBanner}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.apiBannerText}>Fetching product details from global database…</Text>
              </View>
            )}

            {/* ── AUTO-FILLED SECTION ───────────────────────────── */}
            <View style={styles.sectionBox}>
              <View style={styles.sectionLabelRow}>
                <Scan size={13} color={COLORS.primary} />
                <Text style={styles.sectionLabel}>AUTO-FILLED FROM SCAN</Text>
              </View>

              {/* Barcode */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Barcode</Text>
                <View style={styles.barcodeInputWrapper}>
                  <TextInput
                    style={[styles.input, styles.autoInput, { flex: 1 }]}
                    value={newProduct.barcode}
                    onChangeText={(t) => setNewProduct({ ...newProduct, barcode: t })}
                    placeholder="Scan barcode or enter manually"
                    placeholderTextColor="#aaa"
                  />
                  <TouchableOpacity style={styles.modalScanBtn} onPress={() => handleScan(true)}>
                    <Scan size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Product Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Product Name *</Text>
                <TextInput
                  style={[styles.input, newProduct.name ? styles.autoInput : null]}
                  value={newProduct.name}
                  onChangeText={(t) => setNewProduct({ ...newProduct, name: t })}
                  placeholder="Auto-filled after scan"
                  placeholderTextColor="#aaa"
                />
              </View>

              {/* Price — auto-fetched, always editable as fallback */}
              <View style={styles.inputGroup}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: verticalScale(6) }}>
                  <Text style={styles.inputLabel}>Price (₹) *</Text>
                  {!isSearchingAPI && !newProduct.price && (
                    <Text style={styles.priceHint}>⚠️ Not found — enter manually</Text>
                  )}
                  {isSearchingAPI && (
                    <Text style={styles.priceFetching}>Fetching…</Text>
                  )}
                </View>
                <TextInput
                  style={[styles.input, newProduct.price ? styles.autoInput : styles.priceEmptyInput]}
                  value={newProduct.price}
                  keyboardType="numeric"
                  onChangeText={(t) => setNewProduct({ ...newProduct, price: t })}
                  placeholder={isSearchingAPI ? 'Looking up price…' : '₹ Enter selling price'}
                  placeholderTextColor={isSearchingAPI ? '#aaa' : '#f59e0b'}
                  editable={true}
                />
              </View>

              {/* HSN Code */}
              <View style={[styles.inputGroup, { marginBottom: 0 }]}>
                <Text style={styles.inputLabel}>HSN Code</Text>
                <TextInput
                  style={[styles.input, newProduct.hsn ? styles.autoInput : null]}
                  value={newProduct.hsn}
                  onChangeText={(t) => setNewProduct({ ...newProduct, hsn: t })}
                  placeholder="Auto-filled after scan"
                  placeholderTextColor="#aaa"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* ── MANUAL ENTRY SECTION ─────────────────────────── */}
            <View style={[styles.sectionBox, styles.manualBox]}>
              <View style={styles.sectionLabelRow}>
                <Text style={styles.sectionLabelManual}>✏️  ENTER MANUALLY</Text>
              </View>
              <View style={[styles.inputGroup, { marginBottom: 0 }]}>
                <Text style={styles.inputLabel}>Stock Qty *</Text>
                <TextInput
                  style={[styles.input, styles.manualInput]}
                  value={newProduct.stock}
                  keyboardType="numeric"
                  onChangeText={(t) => setNewProduct({ ...newProduct, stock: t })}
                  placeholder="Enter stock quantity"
                  placeholderTextColor="#f59e0b"
                />
              </View>
            </View>

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={() => { setShowAddModal(false); setNewProduct(initialProductState); setScannedData(null); }}
              >
                <Text style={styles.modalBtnTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnAdd} onPress={handleAddProduct}>
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.modalBtnTextAdd}>Save Product</Text>
                }
              </TouchableOpacity>
            </View>

            {/* In-modal camera for re-scan */}
            {isScanningFromModal && isScanning && (
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: RADIUS.xl, overflow: 'hidden' }}>
                <CameraView
                  style={{ flex: 1 }}
                  facing="back"
                  enableTorch={isFlashOn}
                  onBarcodeScanned={onBarcodeScannedFromModal}
                />
                <View style={styles.scannerOverlay}>
                  <View style={styles.scannerTopActions}>
                    <TouchableOpacity style={styles.flashBtn} onPress={() => setIsFlashOn(!isFlashOn)}>
                      <Text style={{ color: '#fff', fontWeight: '800' }}>{isFlashOn ? '⚡ ON' : '🌑 OFF'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.closeScanner} onPress={() => { setIsScanning(false); setIsScanningFromModal(false); }}>
                      <X size={28} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.scanFrame}>
                    <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineAnim }] }]} />
                  </View>
                  <Text style={styles.scanText}>Point at product barcode</Text>
                </View>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Premium Optical Scanner Modal */}
      <Modal visible={isScanning && !isScanningFromModal} animationType="slide">
        <SafeAreaView style={styles.opticalScannerContainer}>
          {/* Header */}
          <View style={[styles.opticalHeader, { paddingTop: insets.top + verticalScale(10) }]}>
            <TouchableOpacity style={styles.opticalCloseBtn} onPress={() => setIsScanning(false)}>
              <X size={22} color={COLORS.textMain} />
            </TouchableOpacity>
            <Text style={styles.opticalTitle}>Optical Scanner</Text>
            <TouchableOpacity style={styles.opticalFlashBtn} onPress={() => setIsFlashOn(!isFlashOn)}>
              <Text style={{ fontSize: 22 }}>{isFlashOn ? '⚡' : '🔦'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.opticalSubtitle}>
            Place barcode or QR code inside the frame to scan.{`\n`}Hold steady for best results.
          </Text>

          {/* Camera with corner-bracket frame */}
          <View style={styles.opticalCameraWrapper}>
            <CameraView
              style={styles.opticalCamera}
              facing="back"
              enableTorch={isFlashOn}
              onBarcodeScanned={onBarcodeScanned}
            />
            {/* Corner bracket markers */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
            {/* Scanning line */}
            <Animated.View style={[styles.opticalScanLine, { transform: [{ translateY: scanLineAnim }] }]} />
          </View>

          {/* Status text */}
          {isSearchingAPI ? (
            <View style={styles.opticalStatusRow}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.opticalStatusText}>Looking up product…</Text>
            </View>
          ) : (
            <Text style={styles.opticalScanningText}>Scanning code...</Text>
          )}
        </SafeAreaView>
      </Modal>

      <Modal visible={showNotFound} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.notFoundCard}>
            <View style={styles.notFoundHeader}>
              <Package size={48} color={COLORS.danger} />
              <Text style={styles.notFoundTitle}>Product Not Found</Text>
            </View>
            <Text style={styles.notFoundText}>
              The barcode <Text style={{fontWeight: '700', color: COLORS.textMain}}>{scannedData}</Text> is not in your inventory.
            </Text>
            <Text style={styles.notFoundSub}>Would you like to add this as a new product?</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setShowNotFound(false)}
              >
                <Text style={styles.modalBtnTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnAdd]}
                onPress={() => {
                  setShowNotFound(false);
                  setNewProduct({ ...newProduct, barcode: scannedData });
                  setShowAddModal(true);
                }}
              >
                <Text style={styles.modalBtnTextAdd}>Add New</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    zIndex: 10,
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
    marginBottom: verticalScale(20),
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: scale(12),
  },
  scanBtn: {
    width: scale(44),
    height: scale(44),
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
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
  listContent: {
    paddingBottom: verticalScale(100),
  },
  productItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    padding: scale(16),
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: verticalScale(12),
    alignItems: 'center',
    gap: scale(16),
  },
  productImage: {
    width: scale(60),
    height: scale(60),
    backgroundColor: '#f3f4f6',
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteIconBtn: {
    padding: scale(6),
    backgroundColor: '#fee2e2',
    borderRadius: RADIUS.sm,
  },
  productName: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: COLORS.textMain,
  },
  productStockCount: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  productMid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(2),
  },
  productHsn: {
    fontSize: moderateScale(11),
    color: COLORS.textMuted,
  },
  productBarcode: {
    fontSize: moderateScale(11),
    color: COLORS.primary,
    fontWeight: '600',
  },
  productBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(8),
  },
  productPrice: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: COLORS.textMain,
  },
  badge: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    borderRadius: RADIUS.full,
  },
  badgeInStock: { backgroundColor: '#d1fae5' },
  badgeLowStock: { backgroundColor: '#fef3c7' },
  badgeOutofStock: { backgroundColor: '#fee2e2' },
  badgeText: { fontSize: moderateScale(10), fontWeight: '700' },
  badgeTextInStock: { color: '#065f46' },
  badgeTextLowStock: { color: '#92400e' },
  badgeTextOutofStock: { color: '#991b1b' },
  emptyContainer: {
    paddingTop: verticalScale(60),
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(12),
  },
  emptyText: {
    fontSize: moderateScale(16),
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  scannerModal: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerTopActions: {
    position: 'absolute',
    top: verticalScale(50),
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    alignItems: 'center',
  },
  flashBtn: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: scale(16),
    paddingVertical: scale(10),
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  closeScanner: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: scale(250),
    height: scale(250),
    borderWidth: 2,
    borderColor: '#22c55e',
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
    overflow: 'hidden',
  },
  scanLine: {
    width: '100%',
    height: 3,
    backgroundColor: '#22c55e',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  scanText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginTop: verticalScale(30),
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: scale(20),
    paddingVertical: scale(8),
    borderRadius: RADIUS.full,
  },

  // ─── Premium Optical Scanner Styles ─────────────────────────────────
  opticalScannerContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  opticalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(16),
  },
  opticalCloseBtn: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  opticalFlashBtn: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  opticalTitle: {
    fontSize: moderateScale(22),
    fontWeight: '800',
    color: COLORS.textMain,
    letterSpacing: 0.3,
  },
  opticalSubtitle: {
    fontSize: moderateScale(13),
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: scale(30),
    marginBottom: verticalScale(28),
  },
  opticalCameraWrapper: {
    width: scale(280),
    height: scale(280),
    borderRadius: scale(16),
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
  },
  opticalCamera: {
    width: '100%',
    height: '100%',
  },
  // Corner bracket markers
  corner: {
    position: 'absolute',
    width: scale(32),
    height: scale(32),
    borderColor: '#3b82f6',
    borderWidth: 3,
  },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: scale(8) },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: scale(8) },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: scale(8) },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: scale(8) },
  opticalScanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  opticalScanningText: {
    marginTop: verticalScale(24),
    fontSize: moderateScale(14),
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  opticalStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(24),
    gap: scale(8),
  },
  opticalStatusText: {
    fontSize: moderateScale(14),
    color: COLORS.primary,
    fontWeight: '600',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(30),
  },
  modalCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    width: '100%',
    padding: scale(20),
    maxHeight: '92%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(16),
    gap: scale(10),
  },
  modalHeaderIcon: {
    width: scale(36),
    height: scale(36),
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    flex: 1,
    fontSize: moderateScale(17),
    fontWeight: '800',
    color: COLORS.textMain,
  },
  modalCloseBtn: {
    width: scale(32),
    height: scale(32),
    borderRadius: RADIUS.md,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  apiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: RADIUS.md,
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
    marginBottom: verticalScale(12),
  },
  apiBannerText: {
    fontSize: moderateScale(12),
    color: '#15803d',
    fontWeight: '600',
    flex: 1,
  },
  sectionBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    padding: scale(12),
    marginBottom: verticalScale(12),
  },
  manualBox: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(5),
    marginBottom: verticalScale(10),
  },
  sectionLabel: {
    fontSize: moderateScale(10),
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.8,
  },
  sectionLabelManual: {
    fontSize: moderateScale(10),
    fontWeight: '800',
    color: '#d97706',
    letterSpacing: 0.8,
  },
  autoInput: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
    color: '#15803d',
  },
  priceEmptyInput: {
    backgroundColor: '#fffbeb',
    borderColor: '#fcd34d',
  },
  priceHint: {
    fontSize: moderateScale(10),
    color: '#ef4444',
    fontWeight: '700',
  },
  priceFetching: {
    fontSize: moderateScale(10),
    color: COLORS.primary,
    fontWeight: '700',
  },
  manualInput: {
    backgroundColor: '#fffbeb',
    borderColor: '#fcd34d',
    fontWeight: '700',
  },
  scanningAPIIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: scale(16),
    paddingVertical: scale(10),
    borderRadius: RADIUS.full,
    marginTop: verticalScale(16),
  },
  inputGroup: {
    marginBottom: verticalScale(16),
  },
  inputRow: {
    flexDirection: 'row',
    gap: scale(12),
  },
  inputLabel: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: verticalScale(6),
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    height: verticalScale(48),
    paddingHorizontal: scale(12),
    fontSize: moderateScale(14),
    color: COLORS.textMain,
  },
  modalActions: {
    flexDirection: 'row',
    gap: scale(12),
    marginTop: verticalScale(10),
  },
  modalBtnCancel: {
    flex: 1,
    height: verticalScale(50),
    borderRadius: RADIUS.md,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnAdd: {
    flex: 1,
    height: verticalScale(50),
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barcodeInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  modalScanBtn: {
    width: scale(48),
    height: scale(48),
    backgroundColor: '#f0fdf4',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#bcf0da',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnTextCancel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  modalBtnTextAdd: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textWhite,
  },
  notFoundCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    width: '100%',
    padding: 24,
    alignItems: 'center',
  },
  notFoundHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textMain,
    marginTop: 12,
  },
  notFoundText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  notFoundSub: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textMain,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProductsScreen;
