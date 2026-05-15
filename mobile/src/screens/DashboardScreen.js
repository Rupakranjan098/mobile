import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, TrendingDown, ChevronRight, Sparkles, Plus, ScanLine, FileBarChart, PieChart, Printer } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import { getDashboardData } from '../services/api';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scale, verticalScale, moderateScale, SCREEN_WIDTH } from '../utils/responsive';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { SERVER_URL } from '../config';




const DashboardScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [dashRes, savedUser] = await Promise.all([
        getDashboardData(),
        AsyncStorage.getItem('user')
      ]);
      setData(dashRes.data);
      if (savedUser) setUser(JSON.parse(savedUser));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchInitialData();
  }, []);
  
  const handlePrint = async (id) => {
    const url = `${SERVER_URL}/invoices/${id}/print?auto=true`;
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.error("Couldn't load page", error);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const dashboardData = data || { stats: [], salesChart: [] };
  const userName = user?.name?.split(' ')[0] || 'User';

  return (
    <View style={styles.mainContainer}>
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Decorative background spheres (Balls) */}
      <View style={[styles.decorCircle, { top: -100, right: -150, width: 400, height: 400, backgroundColor: 'rgba(34, 197, 94, 0.12)' }]} />
      <View style={[styles.decorCircle, { top: 400, left: -200, width: 350, height: 350, backgroundColor: 'rgba(30, 64, 175, 0.1)' }]} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
        >
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Image 
                  source={require('../../assets/logo.png')} 
                  style={{ width: 64, height: 64 }}
                  resizeMode="contain"
                />
                <View>
                  <Text style={styles.welcomeText}>Hello, {userName}</Text>
                  {user?.subscription_plan && (
                    <View style={styles.planBadge}>
                      <Text style={styles.planBadgeText}>{user.subscription_plan.name}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
            <View style={styles.headerActions}>
              <View style={styles.avatar}>
                <Image
                  source={{ uri: `https://ui-avatars.com/api/?name=${userName}&background=22c55e&color=fff` }}
                  style={styles.avatarImg}
                />
              </View>
            </View>
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Products')}>
              <LinearGradient colors={['rgba(34, 197, 94, 0.2)', 'rgba(34, 197, 94, 0.05)']} style={styles.actionGradient} />
              <ScanLine size={24} color="#4ade80" />
              <Text style={styles.actionLabel}>Scan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Invoices')}>
              <LinearGradient colors={['rgba(59, 130, 246, 0.2)', 'rgba(59, 130, 246, 0.05)']} style={styles.actionGradient} />
              <Plus size={24} color="#60a5fa" />
              <Text style={styles.actionLabel}>Invoice</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Reports')}>
              <LinearGradient colors={['rgba(168, 85, 247, 0.2)', 'rgba(168, 85, 247, 0.05)']} style={styles.actionGradient} />
              <FileBarChart size={24} color="#c084fc" />
              <Text style={styles.actionLabel}>Reports</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Expenses')}>
              <LinearGradient colors={['rgba(244, 63, 94, 0.2)', 'rgba(244, 63, 94, 0.05)']} style={styles.actionGradient} />
              <PieChart size={24} color="#fb7185" />
              <Text style={styles.actionLabel}>Expense</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Business Overview</Text>
            <View style={styles.liveBadge}><View style={styles.liveDot} /><Text style={styles.liveText}>LIVE</Text></View>
          </View>

          <View style={styles.statsGrid}>
            {dashboardData.stats.map((stat, i) => (
              <View key={i} style={[styles.statCard, SHADOW.small]}>
                <View style={[styles.statIconWrapper, styles[`type${stat.type.charAt(0).toUpperCase() + stat.type.slice(1)}`]]}>
                  {stat.type === 'sales' && <TrendingUp size={16} color="#dbeafe" />}
                  {stat.type === 'paid' && <TrendingUp size={16} color="#dcfce7" />}
                  {stat.type === 'unpaid' && <TrendingDown size={16} color="#fef3c7" />}
                  {stat.type === 'overdue' && <TrendingDown size={16} color="#fee2e2" />}
                </View>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue}>₹ {stat.value.toLocaleString()}</Text>
                <Text style={[styles.statTrend, stat.trend.startsWith('+') ? styles.up : styles.down]}>
                  {stat.trend}
                </Text>
              </View>
            ))}
          </View>

          <View style={[styles.chartCard, SHADOW.medium]}>
            <LinearGradient colors={['rgba(30, 41, 59, 0.8)', 'rgba(15, 23, 42, 0.8)']} style={StyleSheet.absoluteFill} />
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>Sales Analytics</Text>
                <Text style={styles.cardSub}>Weekly performance trend</Text>
              </View>
              <View style={styles.chartTag}><Text style={styles.chartTagText}>+12.5%</Text></View>
            </View>

            {dashboardData.salesChart?.length > 0 && (
              <LineChart
                data={{
                  labels: dashboardData.salesChart.map(d => d.day),
                  datasets: [{
                    data: dashboardData.salesChart.map(d => d.value)
                  }]
                }}
                width={SCREEN_WIDTH - 64}
                height={200}
                chartConfig={{
                  backgroundColor: 'transparent',
                  backgroundGradientFrom: '#1e293b',
                  backgroundGradientTo: '#1e293b',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
                  style: { borderRadius: 16 },
                  propsForDots: { r: "5", strokeWidth: "3", stroke: "#fff" },
                  propsForBackgroundLines: { strokeDasharray: "", stroke: 'rgba(255,255,255,0.03)' },
                  fillShadowGradient: COLORS.primary,
                  fillShadowGradientOpacity: 0.2,
                }}
                bezier
                style={styles.chart}
              />
            )}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Invoices</Text>
            <TouchableOpacity><Text style={styles.viewAll}>See All</Text></TouchableOpacity>
          </View>

          <View style={[styles.listCard, SHADOW.small]}>
            {dashboardData.recentInvoices?.map((invoice, i) => (
              <TouchableOpacity 
                key={invoice.id} 
                style={[styles.listItem, i === dashboardData.recentInvoices.length - 1 && { borderBottomWidth: 0 }]}
                onPress={() => handlePrint(invoice.id)}
              >
                <View>
                  <Text style={styles.itemTitle}>{invoice.customer?.name || 'Walk-in'}</Text>
                  <Text style={styles.itemSub}>{new Date(invoice.date).toLocaleDateString()}</Text>
                </View>
                <View style={styles.itemMeta}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.itemValue}>₹{parseFloat(invoice.total_amount).toLocaleString()}</Text>
                    <View style={styles.smallPrintBtn}>
                      <Printer size={14} color={COLORS.primary} />
                    </View>
                  </View>
                  <View style={[styles.statusPill, styles[invoice.status?.toLowerCase()]]}>
                    <Text style={[styles.statusText, styles[`text${invoice.status}`]]}>{invoice.status}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Inventory Alerts</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>{dashboardData.lowStockProducts?.length || 0}</Text></View>
          </View>

          <View style={[styles.listCard, SHADOW.small]}>
            {dashboardData.lowStockProducts?.map((product, i) => (
              <View key={product.id} style={[styles.listItem, i === dashboardData.lowStockProducts.length - 1 && { borderBottomWidth: 0 }]}>
                <View>
                  <Text style={styles.itemTitle}>{product.name}</Text>
                  <Text style={styles.itemSub}>Stock: {product.stock} {product.unit}</Text>
                </View>
                <View style={[styles.stockTag, product.stock === 0 ? styles.tagOut : styles.tagLow]}>
                  <Text style={styles.tagText}>{product.stock === 0 ? 'Out' : 'Low'}</Text>
                </View>
              </View>
            ))}
            {!dashboardData.lowStockProducts?.length && (
              <Text style={styles.emptyMsg}>All products well stocked! ✅</Text>
            )}
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Floating AI Button */}
        <TouchableOpacity
          style={[
            styles.floatingAiBtn,
            SHADOW.medium,
            { bottom: verticalScale(150) }
          ]}
          onPress={() => navigation.navigate('AI Chat')}
        >
          <Sparkles size={22} color="#fff" />
          <Text style={styles.aiBtnText}>AI Assistant</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#0f172a' },
  safeArea: { flex: 1 },
  decorCircle: { position: 'absolute', borderRadius: 999 },
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: 'rgba(34, 197, 94, 0.3)', overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  welcomeText: { fontSize: 20, fontWeight: '800', color: '#fff' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28, gap: 12 },
  actionCard: { flex: 1, height: 80, borderRadius: 20, justifyContent: 'center', alignItems: 'center', gap: 8, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  actionGradient: { ...StyleSheet.absoluteFillObject },
  actionLabel: { fontSize: 11, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ef4444' },
  liveText: { color: '#ef4444', fontSize: 10, fontWeight: '900' },
  
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  statCard: { width: '48%', backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', marginBottom: 16 },
  statIconWrapper: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  typeSales: { backgroundColor: 'rgba(59, 130, 246, 0.15)' },
  typePaid: { backgroundColor: 'rgba(34, 197, 94, 0.15)' },
  typeUnpaid: { backgroundColor: 'rgba(245, 158, 11, 0.15)' },
  typeOverdue: { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
  statLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '700', marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 6 },
  statTrend: { fontSize: 11, fontWeight: '800' },
  up: { color: '#4ade80' },
  down: { color: '#f87171' },

  chartCard: { backgroundColor: 'rgba(30, 41, 59, 0.4)', padding: 24, borderRadius: 28, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  cardSub: { fontSize: 12, color: '#64748b', marginTop: 2, fontWeight: '600' },
  chartTag: { backgroundColor: 'rgba(34, 197, 94, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  chartTagText: { color: '#4ade80', fontSize: 11, fontWeight: '800' },
  chart: { marginVertical: 8, marginLeft: -16 },
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#fff' },
  viewAll: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  listCard: { backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: 28, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', paddingHorizontal: 20 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' },
  itemTitle: { fontSize: 14, fontWeight: '800', color: '#f1f5f9' },
  itemSub: { fontSize: 11, color: '#64748b', marginTop: 4, fontWeight: '600' },
  itemMeta: { alignItems: 'flex-end', gap: 6 },
  itemValue: { fontSize: 14, fontWeight: '900', color: '#fff' },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  paid: { backgroundColor: 'rgba(34, 197, 94, 0.1)' },
  unpaid: { backgroundColor: 'rgba(245, 158, 11, 0.1)' },
  overdue: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  statusText: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase' },
  textPaid: { color: '#4ade80' },
  textUnpaid: { color: '#fbbf24' },
  textOverdue: { color: '#f87171' },
  badge: { backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' },
  badgeText: { color: '#f87171', fontSize: 10, fontWeight: '900' },
  stockTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  tagLow: { backgroundColor: 'rgba(245, 158, 11, 0.1)' },
  tagOut: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  tagText: { fontSize: 10, fontWeight: '900', color: '#fbbf24' },
  emptyMsg: { textAlign: 'center', padding: 30, color: '#475569', fontSize: 14, fontWeight: '600' },
  planBadge: { backgroundColor: 'rgba(34, 197, 94, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.2)', marginTop: 6, alignSelf: 'flex-start' },
  planBadgeText: { fontSize: 9, fontWeight: '900', color: '#4ade80', textTransform: 'uppercase', letterSpacing: 0.5 },
  floatingAiBtn: { position: 'absolute', right: 20, backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 30, gap: 10, elevation: 12, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 },
  aiBtnText: { color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 0.5 },
  smallPrintBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(34, 197, 94, 0.1)', justifyContent: 'center', alignItems: 'center' },
});

export default DashboardScreen;
