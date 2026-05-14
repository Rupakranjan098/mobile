import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, TrendingDown, ChevronRight, Sparkles } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import { getDashboardData } from '../services/api';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scale, verticalScale, moderateScale, SCREEN_WIDTH } from '../utils/responsive';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';




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

          <View style={styles.dateSelector}>
            <View style={styles.dateChip}>
              <Text style={styles.dateText}>Real-time Insights</Text>
            </View>
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

          <View style={[styles.chartCard, SHADOW.small]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Sales Overview</Text>
              <TouchableOpacity style={styles.filterBtn}>
                <Text style={styles.filterText}>Recent</Text>
                <ChevronRight size={14} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {dashboardData.salesChart?.length > 0 && (
              <LineChart
                data={{
                  labels: dashboardData.salesChart.map(d => d.day),
                  datasets: [{
                    data: dashboardData.salesChart.map(d => d.value)
                  }]
                }}
                width={SCREEN_WIDTH - 72}
                height={180}
                chartConfig={{
                  backgroundColor: 'transparent',
                  backgroundGradientFrom: COLORS.card,
                  backgroundGradientTo: COLORS.card,
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
                  style: { borderRadius: 16 },
                  propsForDots: { r: "4", strokeWidth: "2", stroke: "#fff" },
                  propsForBackgroundLines: { strokeDasharray: "", stroke: 'rgba(255,255,255,0.05)' }
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
              <View key={invoice.id} style={[styles.listItem, i === dashboardData.recentInvoices.length - 1 && { borderBottomWidth: 0 }]}>
                <View>
                  <Text style={styles.itemTitle}>{invoice.customer?.name || 'Walk-in'}</Text>
                  <Text style={styles.itemSub}>{new Date(invoice.date).toLocaleDateString()}</Text>
                </View>
                <View style={styles.itemMeta}>
                  <Text style={styles.itemValue}>₹{parseFloat(invoice.total_amount).toLocaleString()}</Text>
                  <View style={[styles.statusPill, styles[invoice.status?.toLowerCase()]]}>
                    <Text style={[styles.statusText, styles[`text${invoice.status}`]]}>{invoice.status}</Text>
                  </View>
                </View>
              </View>
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
            { bottom: insets.bottom + verticalScale(20) }
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
  mainContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  safeArea: {
    flex: 1,
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
  },
  container: {
    flex: 1,
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  welcomeText: {
    fontSize: moderateScale(20),
    fontWeight: '800',
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  dateSelector: {
    marginBottom: SPACING.lg,
  },
  dateChip: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  dateText: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    padding: scale(16),
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: scale(16),
  },
  statIconWrapper: {
    width: scale(36),
    height: scale(36),
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(12),
  },
  typeSales: { backgroundColor: 'rgba(59, 130, 246, 0.1)' },
  typePaid: { backgroundColor: 'rgba(34, 197, 94, 0.1)' },
  typeUnpaid: { backgroundColor: 'rgba(245, 158, 11, 0.1)' },
  typeOverdue: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  statLabel: {
    fontSize: moderateScale(12),
    color: '#94a3b8',
    fontWeight: '600',
    marginBottom: scale(4),
  },
  statValue: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    color: '#fff',
    marginBottom: scale(4),
  },
  statTrend: {
    fontSize: moderateScale(11),
    fontWeight: '700',
  },
  up: { color: COLORS.success },
  down: { color: COLORS.danger },
  chartCard: {
    backgroundColor: COLORS.card,
    padding: scale(20),
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(24),
  },
  cardTitle: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: '#fff',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    gap: scale(4),
  },
  filterText: {
    fontSize: moderateScale(11),
    color: '#94a3b8',
    fontWeight: '700',
  },
  chart: {
    marginVertical: scale(8),
    borderRadius: RADIUS.xl,
    marginLeft: -scale(16),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(28),
    marginBottom: verticalScale(16),
  },
  sectionTitle: {
    fontSize: moderateScale(17),
    fontWeight: '800',
    color: '#fff',
  },
  viewAll: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: COLORS.primary,
  },
  listCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: scale(20),
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: scale(16),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  itemTitle: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: '#f1f5f9',
  },
  itemSub: {
    fontSize: moderateScale(11),
    color: '#94a3b8',
    marginTop: verticalScale(4),
  },
  itemMeta: {
    alignItems: 'flex-end',
    gap: scale(6),
  },
  itemValue: {
    fontSize: moderateScale(14),
    fontWeight: '800',
    color: '#fff',
  },
  statusPill: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    borderRadius: RADIUS.sm,
  },
  paid: { backgroundColor: 'rgba(34, 197, 94, 0.15)' },
  unpaid: { backgroundColor: 'rgba(245, 158, 11, 0.15)' },
  overdue: { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
  statusText: {
    fontSize: moderateScale(9),
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  textPaid: { color: '#4ade80' },
  textUnpaid: { color: '#fbbf24' },
  textOverdue: { color: '#f87171' },
  badge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: scale(10),
    paddingVertical: scale(2),
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  badgeText: {
    color: '#f87171',
    fontSize: moderateScale(10),
    fontWeight: '800',
  },
  stockTag: {
    paddingHorizontal: scale(10),
    paddingVertical: scale(4),
    borderRadius: RADIUS.md,
  },
  tagLow: { backgroundColor: 'rgba(245, 158, 11, 0.1)' },
  tagOut: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  tagText: {
    fontSize: moderateScale(10),
    fontWeight: '800',
    color: '#fbbf24',
  },
  emptyMsg: {
    textAlign: 'center',
    padding: scale(24),
    color: '#94a3b8',
    fontSize: moderateScale(13),
  },
  planBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  planBadgeText: {
    fontSize: moderateScale(9),
    fontWeight: '900',
    color: '#4ade80',
    textTransform: 'uppercase',
  },
  floatingAiBtn: {
    position: 'absolute',
    right: scale(20),
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: scale(14),
    borderRadius: RADIUS.full,
    gap: scale(10),
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  aiBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: moderateScale(14),
    letterSpacing: 0.5,
  },
});

export default DashboardScreen;
