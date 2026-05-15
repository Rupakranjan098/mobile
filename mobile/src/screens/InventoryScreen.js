import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package, Search, Filter, ArrowUpDown, AlertTriangle, CheckCircle, TrendingDown, Edit2, Plus, Box, Info } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import { getProducts } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { scale, moderateScale, verticalScale } from '../utils/responsive';
import { useTheme } from '../context/ThemeContext';

const InventoryScreen = ({ navigation }) => {
  const { isDark, colors } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('All'); // All, Low, Out

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, []);

  const getFilteredProducts = () => {
    let filtered = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filterMode === 'Low') filtered = filtered.filter(p => p.stock > 0 && p.stock <= 10);
    if (filterMode === 'Out') filtered = filtered.filter(p => p.stock <= 0);
    return filtered;
  };

  const totalValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outOfStockCount = products.filter(p => p.stock <= 0).length;

  const renderItem = ({ item }) => {
    const isOut = item.stock <= 0;
    const isLow = item.stock > 0 && item.stock <= 10;
    
    return (
      <TouchableOpacity 
        style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }, SHADOW.small]}
        onPress={() => navigation.navigate('Products', { screen: 'Products', params: { editProduct: item } })}
      >
        <View style={styles.cardMain}>
          <View style={[styles.iconBox, { backgroundColor: isOut ? '#fee2e2' : isLow ? '#fef3c7' : '#dcfce7' }]}>
            <Box size={22} color={isOut ? '#ef4444' : isLow ? '#f59e0b' : '#22c55e'} />
          </View>
          <View style={styles.infoBox}>
            <Text style={[styles.prodName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
            <Text style={[styles.prodHsn, { color: colors.textMuted }]}>HSN: {item.hsn || 'N/A'}</Text>
          </View>
          <View style={styles.metaBox}>
            <Text style={[styles.prodPrice, { color: colors.text }]}>₹{parseFloat(item.price).toLocaleString()}</Text>
            <View style={[styles.stockBadge, { backgroundColor: isOut ? 'rgba(239, 68, 68, 0.1)' : isLow ? 'rgba(245, 158, 11, 0.1)' : 'rgba(34, 197, 94, 0.1)' }]}>
              <Text style={[styles.stockText, { color: isOut ? '#ef4444' : isLow ? '#f59e0b' : '#22c55e' }]}>{item.stock} {item.unit}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <LinearGradient colors={isDark ? ['#0f172a', '#1e293b'] : ['#f8fafc', '#f1f5f9']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Inventory</Text>
          <View style={styles.headerBtns}>
            <TouchableOpacity style={[styles.headerIconBtn, { backgroundColor: colors.glass }]}><ArrowUpDown size={20} color={colors.text} /></TouchableOpacity>
          </View>
        </View>

        <View style={styles.summaryScroll}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.summaryContent}>
            <View style={[styles.summaryCard, { backgroundColor: '#3b82f6' }]}>
              <Text style={styles.summaryLabel}>Total Value</Text>
              <Text style={styles.summaryValue}>₹{totalValue.toLocaleString()}</Text>
              <TrendingDown size={24} color="rgba(255,255,255,0.2)" style={styles.summaryIcon} />
            </View>
            <TouchableOpacity style={[styles.summaryCard, { backgroundColor: '#f59e0b' }]} onPress={() => setFilterMode('Low')}>
              <Text style={styles.summaryLabel}>Low Stock</Text>
              <Text style={styles.summaryValue}>{lowStockCount} Items</Text>
              <AlertTriangle size={24} color="rgba(255,255,255,0.2)" style={styles.summaryIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.summaryCard, { backgroundColor: '#ef4444' }]} onPress={() => setFilterMode('Out')}>
              <Text style={styles.summaryLabel}>Out of Stock</Text>
              <Text style={styles.summaryValue}>{outOfStockCount} Items</Text>
              <Box size={24} color="rgba(255,255,255,0.2)" style={styles.summaryIcon} />
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.container}>
          <View style={[styles.searchBar, { backgroundColor: colors.glass, borderColor: colors.border }]}>
            <Search size={20} color={colors.textMuted} />
            <TextInput style={[styles.searchInput, { color: colors.text }]} placeholder="Search stock..." placeholderTextColor={colors.textMuted} value={searchQuery} onChangeText={setSearchQuery} />
            <TouchableOpacity onPress={() => setFilterMode('All')}><Filter size={20} color={filterMode === 'All' ? COLORS.primary : colors.textMuted} /></TouchableOpacity>
          </View>

          <FlatList 
            data={getFilteredProducts()} 
            renderItem={renderItem} 
            keyExtractor={item => item.id.toString()} 
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Package size={64} color={colors.border} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No stock matches your criteria</Text>
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
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20, marginTop: 8 },
  title: { fontSize: 28, fontWeight: '800' },
  headerBtns: { flexDirection: 'row', gap: 12 },
  headerIconBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  summaryScroll: { marginBottom: 20 },
  summaryContent: { paddingHorizontal: 20, gap: 12 },
  summaryCard: { width: 160, height: 100, borderRadius: 24, padding: 16, justifyContent: 'center', overflow: 'hidden' },
  summaryLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700' },
  summaryValue: { color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 4 },
  summaryIcon: { position: 'absolute', right: -5, bottom: -5 },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 52, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 15 },
  listContent: { paddingBottom: 120 },
  productCard: { borderRadius: 24, borderWidth: 1, padding: 12, marginBottom: 12 },
  cardMain: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  infoBox: { flex: 1, marginLeft: 16, gap: 2 },
  prodName: { fontSize: 15, fontWeight: '800' },
  prodHsn: { fontSize: 11, fontWeight: '600' },
  metaBox: { alignItems: 'flex-end', gap: 6 },
  prodPrice: { fontSize: 15, fontWeight: '900' },
  stockBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  stockText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 80, gap: 16 },
  emptyText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
});

export default InventoryScreen;
