import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Download } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import { PieChart } from 'react-native-chart-kit';
import { getReportsData } from '../services/api';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { SERVER_URL } from '../config';
import { SCREEN_WIDTH } from '../utils/responsive';



const ReportsScreen = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('GST');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await getReportsData();
      setData(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const url = `${SERVER_URL}/reports/export?type=${activeTab}&token=${token}`;
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Could not initiate download');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const reportsData = data || { gstData: [], summary: {} };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={handleDownload}>
          <Download size={20} color={COLORS.textWhite} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Sales' && styles.activeTab]} 
          onPress={() => setActiveTab('Sales')}
        >
          <Text style={[styles.tabText, activeTab === 'Sales' && styles.activeTabText]}>Sales</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'GST' && styles.activeTab]} 
          onPress={() => setActiveTab('GST')}
        >
          <Text style={[styles.tabText, activeTab === 'GST' && styles.activeTabText]}>GST</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Expenses' && styles.activeTab]} 
          onPress={() => setActiveTab('Expenses')}
        >
          <Text style={[styles.tabText, activeTab === 'Expenses' && styles.activeTabText]}>Expenses</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.dateRange}>Real-time Summary</Text>

      <View style={styles.statsGrid}>
        <View style={[styles.miniStat, SHADOW.small]}>
          <Text style={styles.statLabel}>Output GST</Text>
          <Text style={styles.statValue}>₹ {reportsData.outputGst?.toLocaleString()}</Text>
        </View>
        <View style={[styles.miniStat, SHADOW.small]}>
          <Text style={styles.statLabel}>Input GST</Text>
          <Text style={styles.statValue}>₹ {reportsData.inputGst?.toLocaleString()}</Text>
        </View>
      </View>

      <View style={[styles.chartCard, SHADOW.small]}>
        <Text style={styles.chartTitle}>
          {activeTab === 'GST' ? 'GST Distribution' : activeTab === 'Expenses' ? 'Expense Categories' : 'Monthly Sales'}
        </Text>
        
        {activeTab === 'GST' && reportsData.gstData?.length > 0 && (
          <PieChart
            data={reportsData.gstData.map(d => ({ ...d, legendFontColor: COLORS.textMuted, legendFontSize: 12 }))}
            width={SCREEN_WIDTH - 48}
            height={180}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor={"value"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            center={[10, 0]}
            absolute
          />
        )}

        {activeTab === 'Expenses' && reportsData.expenseCategories?.length > 0 && (
          <PieChart
            data={reportsData.expenseCategories.map((d, i) => ({ 
              ...d, 
              color: [COLORS.primary, COLORS.secondary, COLORS.danger, COLORS.warning, '#8b5cf6', '#ec4899'][i % 6],
              legendFontColor: COLORS.textMuted, 
              legendFontSize: 12 
            }))}
            width={SCREEN_WIDTH - 48}
            height={180}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor={"value"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            center={[10, 0]}
            absolute
          />
        )}

        {activeTab === 'Sales' && reportsData.salesByCustomer?.length > 0 && (
          <PieChart
            data={reportsData.salesByCustomer.map((d, i) => ({ 
              ...d, 
              color: [COLORS.primary, COLORS.secondary, COLORS.danger, COLORS.warning, '#8b5cf6', '#ec4899'][i % 6],
              legendFontColor: COLORS.textMuted, 
              legendFontSize: 12 
            }))}
            width={SCREEN_WIDTH - 48}
            height={180}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor={"value"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            center={[10, 0]}
            absolute
          />
        )}

        {((activeTab === 'GST' && (!reportsData.gstData || reportsData.gstData.length === 0)) || 
          (activeTab === 'Expenses' && (!reportsData.expenseCategories || reportsData.expenseCategories.length === 0)) ||
          (activeTab === 'Sales' && (!reportsData.salesByCustomer || reportsData.salesByCustomer.length === 0))) && (
          <View style={styles.placeholderChart}>
            <Text style={styles.placeholderText}>No data available for this section</Text>
          </View>
        )}
      </View>

      <View style={[styles.summaryCard, SHADOW.small]}>
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Business Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.rowLabel}>Total Invoices</Text>
            <Text style={styles.rowValue}>{reportsData.summary.totalInvoices}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.rowLabel}>Taxable Value</Text>
            <Text style={styles.rowValue}>₹ {reportsData.summary.taxableValue?.toLocaleString()}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>GST Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.rowLabel}>Total Liability</Text>
            <Text style={styles.rowValue}>₹ {reportsData.summary.totalLiability?.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.rowLabel}>Net Payable</Text>
            <Text style={styles.rowValue}>₹ {reportsData.summary.netPayable?.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload}>
        <Text style={styles.downloadBtnText}>Download Detailed Report</Text>
      </TouchableOpacity>

      <View style={{ height: 100 }} />
      </ScrollView>
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
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 4,
    borderRadius: 12,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  activeTabText: {
    color: COLORS.textWhite,
  },
  dateRange: {
    textAlign: 'right',
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  miniStat: {
    flex: 1,
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  chartCard: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  placeholderChart: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontStyle: 'italic',
  },
  summaryCard: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  summarySection: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  rowLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  downloadBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  downloadBtnText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: '700',
  }
});

export default ReportsScreen;
