import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, TrendingDown, ChevronRight, Sparkles } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import { getDashboardData } from '../services/api';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scale, verticalScale, moderateScale, SCREEN_WIDTH } from '../utils/responsive';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const { width } = Dimensions.get('window');

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
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const dashboardData = data || { stats: [], salesChart: [] };
  const userName = user?.name?.split(' ')[0] || 'User';

  return (
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
            <Text style={styles.welcomeText}>Hello, {userName}</Text>
            {user?.subscription_plan && (
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>{user.subscription_plan.name}</Text>
              </View>
            )}
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
                {stat.type === 'sales' && <TrendingUp size={16} color="#1e40af" />}
                {stat.type === 'paid' && <TrendingUp size={16} color="#15803d" />}
                {stat.type === 'unpaid' && <TrendingDown size={16} color="#b45309" />}
                {stat.type === 'overdue' && <TrendingDown size={16} color="#b91c1c" />}
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
            width={width - 72}
            height={180}
            chartConfig={{
              backgroundColor: COLORS.card,
              backgroundGradientFrom: COLORS.card,
              backgroundGradientTo: COLORS.card,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: { r: "4", strokeWidth: "2", stroke: "#fff" },
              propsForBackgroundLines: { strokeDasharray: "", stroke: "#f0f0f0" }
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

      <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating AI Button */}
      <TouchableOpacity
        style={[
          styles.floatingAiBtn,
          SHADOW.medium,
          { bottom: insets.bottom + verticalScale(80) }
        ]}
        onPress={() => navigation.navigate('AI Chat')}
      >
        <Sparkles size={24} color="#fff" />
        <Text style={styles.aiBtnText}>AI Insights</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  floatingAiBtn: {
    position: 'absolute',
    right: scale(20),
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: scale(12),
    borderRadius: RADIUS.full,
    gap: scale(8),
    elevation: 5,
  },
  aiBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: moderateScale(14),
  },
  container: {
    flex: 1,
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  welcomeText: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: COLORS.textMain,
  },
  subText: {
    fontSize: moderateScale(13),
    color: COLORS.textMuted,
    marginTop: verticalScale(2),
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  iconBtn: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  dateSelector: {
    marginBottom: SPACING.md,
  },
  dateChip: {
    backgroundColor: COLORS.card,
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: COLORS.textMain,
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
    padding: scale(12),
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: scale(12),
  },
  statIconWrapper: {
    width: scale(32),
    height: scale(32),
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(8),
  },
  typeSales: { backgroundColor: '#dbeafe' },
  typePaid: { backgroundColor: '#dcfce7' },
  typeUnpaid: { backgroundColor: '#fef3c7' },
  typeOverdue: { backgroundColor: '#fee2e2' },
  typeOutstanding: { backgroundColor: '#fee2e2' },
  statLabel: {
    fontSize: moderateScale(12),
    color: COLORS.textMuted,
    marginBottom: scale(4),
  },
  statValue: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: scale(2),
  },
  statTrend: {
    fontSize: moderateScale(11),
    fontWeight: '600',
  },
  up: { color: COLORS.success },
  down: { color: COLORS.danger },
  chartCard: {
    backgroundColor: COLORS.card,
    padding: scale(20),
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(20),
  },
  cardTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: COLORS.textMain,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  filterText: {
    fontSize: moderateScale(12),
    color: COLORS.textMuted,
    fontWeight: '600',
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
    marginTop: verticalScale(24),
    marginBottom: verticalScale(12),
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: COLORS.textMain,
  },
  viewAll: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: COLORS.primary,
  },
  listCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: scale(16),
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: COLORS.textMain,
  },
  itemSub: {
    fontSize: moderateScale(11),
    color: COLORS.textMuted,
    marginTop: verticalScale(2),
  },
  itemMeta: {
    alignItems: 'flex-end',
    gap: scale(4),
  },
  itemValue: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: COLORS.textMain,
  },
  statusPill: {
    paddingHorizontal: scale(6),
    paddingVertical: scale(2),
    borderRadius: RADIUS.sm,
  },
  paid: { backgroundColor: '#dcfce7' },
  unpaid: { backgroundColor: '#fef3c7' },
  overdue: { backgroundColor: '#fee2e2' },
  statusText: {
    fontSize: moderateScale(9),
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  textPaid: { color: '#15803d' },
  textUnpaid: { color: '#92400e' },
  textOverdue: { color: '#b91c1c' },
  badge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    borderRadius: RADIUS.md,
  },
  badgeText: {
    color: '#b91c1c',
    fontSize: moderateScale(10),
    fontWeight: '700',
  },
  stockTag: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: RADIUS.sm,
  },
  tagLow: { backgroundColor: '#fff7ed' },
  tagOut: { backgroundColor: '#fef2f2' },
  tagText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: '#c2410c',
  },
  emptyMsg: {
    textAlign: 'center',
    padding: scale(20),
    color: COLORS.textMuted,
    fontSize: moderateScale(13),
  },
  planBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  planBadgeText: {
    fontSize: moderateScale(10),
    fontWeight: '800',
    color: '#15803d',
    textTransform: 'uppercase',
  }
});

export default DashboardScreen;
