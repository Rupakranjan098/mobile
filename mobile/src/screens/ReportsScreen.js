import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Download, PieChart as PieIcon, BarChart as BarIcon, TrendingUp } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import { PieChart } from 'react-native-chart-kit';
import { getReportsData } from '../services/api';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVER_URL } from '../config';
import { SCREEN_WIDTH } from '../utils/responsive';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

const ReportsScreen = () => {
  const { isDark, colors } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('GST');

  useEffect(() => { fetchReports(); }, []);

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
      Alert.alert('Error', 'Could not initiate download');
    }
  };

  if (loading) {
    return (
      <View style={[styles.mainContainer, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const reportsData = data || { gstData: [], summary: {} };

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <LinearGradient colors={isDark ? ['#0f172a', '#1e293b'] : ['#f8fafc', '#f1f5f9']} style={StyleSheet.absoluteFill} />
      
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Reports</Text>
            <TouchableOpacity style={styles.iconBtn} onPress={handleDownload}>
              <Download size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={[styles.tabs, { backgroundColor: colors.glass, borderColor: colors.border }]}>
            {['Sales', 'GST', 'Expenses'].map((t) => (
              <TouchableOpacity key={t} style={[styles.tab, activeTab === t && styles.activeTab]} onPress={() => setActiveTab(t)}>
                <Text style={[styles.tabText, activeTab === t && styles.activeTabText, { color: activeTab === t ? '#fff' : colors.textMuted }]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.statsGrid}>
            <View style={[styles.miniStat, { backgroundColor: colors.card, borderColor: colors.border }, SHADOW.small]}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Output GST</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>₹ {reportsData.outputGst?.toLocaleString()}</Text>
            </View>
            <View style={[styles.miniStat, { backgroundColor: colors.card, borderColor: colors.border }, SHADOW.small]}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Input GST</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>₹ {reportsData.inputGst?.toLocaleString()}</Text>
            </View>
          </View>

          <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }, SHADOW.small]}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>{activeTab} Distribution</Text>
            {reportsData.gstData?.length > 0 ? (
              <PieChart
                data={reportsData.gstData.map((d, i) => ({ 
                  ...d, 
                  color: [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.warning, COLORS.danger][i % 5],
                  legendFontColor: colors.text, 
                  legendFontSize: 12 
                }))}
                width={SCREEN_WIDTH - 64}
                height={180}
                chartConfig={{ color: (opacity = 1) => colors.text }}
                accessor={"value"}
                backgroundColor={"transparent"}
                paddingLeft={"15"}
                absolute
              />
            ) : (
              <View style={styles.placeholderChart}><PieIcon size={48} color={colors.border} /><Text style={[styles.placeholderText, { color: colors.textMuted }]}>No data available</Text></View>
            )}
          </View>

          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }, SHADOW.small]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Business Summary</Text>
            <View style={styles.summaryRow}><Text style={[styles.rowLabel, { color: colors.textMuted }]}>Total Invoices</Text><Text style={[styles.rowValue, { color: colors.text }]}>{reportsData.summary.totalInvoices}</Text></View>
            <View style={styles.summaryRow}><Text style={[styles.rowLabel, { color: colors.textMuted }]}>Taxable Value</Text><Text style={[styles.rowValue, { color: colors.text }]}>₹ {reportsData.summary.taxableValue?.toLocaleString()}</Text></View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>GST Summary</Text>
            <View style={styles.summaryRow}><Text style={[styles.rowLabel, { color: colors.textMuted }]}>Total Liability</Text><Text style={[styles.rowValue, { color: colors.text }]}>₹ {reportsData.summary.totalLiability?.toLocaleString()}</Text></View>
            <View style={styles.summaryRow}><Text style={[styles.rowLabel, { color: colors.textMuted }]}>Net Payable</Text><Text style={[styles.rowValue, { color: colors.primary, fontWeight: '900' }]}>₹ {reportsData.summary.netPayable?.toLocaleString()}</Text></View>
          </View>

          <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload}><Text style={styles.downloadBtnText}>Download Detailed Report</Text></TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 8 },
  title: { fontSize: 26, fontWeight: '800' },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  tabs: { flexDirection: 'row', padding: 4, borderRadius: 16, marginBottom: 24, borderWidth: 1 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  activeTab: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 13, fontWeight: '700' },
  activeTabText: { color: '#fff' },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  miniStat: { flex: 1, padding: 16, borderRadius: 20, borderWidth: 1 },
  statLabel: { fontSize: 11, fontWeight: '700', marginBottom: 4, letterSpacing: 0.5 },
  statValue: { fontSize: 15, fontWeight: '900' },
  chartCard: { padding: 16, borderRadius: 24, borderWidth: 1, marginBottom: 20, alignItems: 'center' },
  chartTitle: { fontSize: 14, fontWeight: '800', alignSelf: 'flex-start', marginBottom: 16 },
  placeholderChart: { height: 180, justifyContent: 'center', alignItems: 'center', gap: 12 },
  placeholderText: { fontSize: 14, fontWeight: '600' },
  summaryCard: { padding: 20, borderRadius: 24, borderWidth: 1, marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  rowLabel: { fontSize: 13, fontWeight: '600' },
  rowValue: { fontSize: 13, fontWeight: '700' },
  divider: { height: 1, marginVertical: 20 },
  downloadBtn: { backgroundColor: COLORS.primary, paddingVertical: 18, borderRadius: 16, alignItems: 'center', shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  downloadBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' }
});

export default ReportsScreen;
