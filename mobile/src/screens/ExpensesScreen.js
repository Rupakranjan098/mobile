import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Home, Lightbulb, Wifi, Train, PenTool, Plus, X, Calendar, DollarSign, Tag, RefreshCw } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import { getExpenses, createExpense } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { scale, moderateScale } from '../utils/responsive';
import { useTheme } from '../context/ThemeContext';

const categoryIcons = { 'Office': Home, 'Utilities': Lightbulb, 'Internet': Wifi, 'Travel': Train, 'Others': PenTool };
const categoryColors = { 'Office': '#f59e0b', 'Utilities': '#fbbf24', 'Internet': '#3b82f6', 'Travel': '#ef4444', 'Others': '#6366f1' };

const ExpensesScreen = () => {
  const { isDark, colors } = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [newExpense, setNewExpense] = useState({ name: '', amount: '', category: 'Business', date: new Date().toISOString().split('T')[0] });

  useEffect(() => { fetchExpenses(); }, []);

  const fetchExpenses = async () => {
    try {
      const res = await getExpenses();
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.name || !newExpense.amount) { Alert.alert('Error', 'Please fill all fields'); return; }
    try {
      setLoading(true);
      await createExpense(newExpense);
      setModalVisible(false);
      setNewExpense({ name: '', amount: '', category: 'Business', date: new Date().toISOString().split('T')[0] });
      fetchExpenses();
      Alert.alert('Success', 'Expense recorded');
    } catch (err) {
      Alert.alert('Error', 'Failed to add expense');
    } finally { setLoading(false); }
  };

  const filteredExpenses = expenses.filter(exp => filter === 'All' ? true : exp.category === filter);

  const renderItem = ({ item }) => {
    const Icon = categoryIcons[item.category] || PenTool;
    const color = categoryColors[item.category] || '#6366f1';
    return (
      <View style={[styles.expenseItem, { backgroundColor: colors.card, borderColor: colors.border }, SHADOW.small]}>
        <View style={[styles.expIcon, { backgroundColor: color + '15' }]}><Icon size={20} color={color} /></View>
        <View style={styles.expDetails}>
          <View style={styles.expRow}><Text style={[styles.expName, { color: colors.text }]}>{item.name}</Text><Text style={[styles.expAmount, { color: colors.text }]}>₹ {parseFloat(item.amount).toLocaleString()}</Text></View>
          <View style={styles.expRow}><Text style={[styles.expDate, { color: colors.textMuted }]}>{item.date}</Text><View style={[styles.badge, { backgroundColor: color + '20' }]}><Text style={[styles.badgeText, { color: color }]}>{item.category}</Text></View></View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <LinearGradient colors={isDark ? ['#0f172a', '#1e293b'] : ['#f8fafc', '#f1f5f9']} style={StyleSheet.absoluteFill} />
      <View style={[styles.decorCircle, { top: -80, left: -100, width: 300, height: 300, backgroundColor: isDark ? 'rgba(34, 197, 94, 0.08)' : 'rgba(34, 197, 94, 0.04)' }]} />
      <View style={[styles.decorCircle, { bottom: 100, right: -120, width: 350, height: 350, backgroundColor: isDark ? 'rgba(30, 64, 175, 0.06)' : 'rgba(30, 64, 175, 0.03)' }]} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}><Text style={[styles.title, { color: colors.text }]}>Expenses</Text><TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}><Plus size={24} color="#fff" /></TouchableOpacity></View>

          <View style={[styles.filterTabs, { backgroundColor: colors.glass, borderColor: colors.border }]}>
            {['All', 'Business', 'Personal'].map((t) => (
              <TouchableOpacity key={t} style={[styles.tab, filter === t && styles.activeTab]} onPress={() => setFilter(t)}><Text style={[styles.tabText, filter === t && styles.activeTabText, { color: filter === t ? '#fff' : colors.textMuted }]}>{t}</Text></TouchableOpacity>
            ))}
          </View>

          <FlatList data={filteredExpenses} renderItem={renderItem} keyExtractor={item => item.id.toString()} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchExpenses(); }} tintColor={COLORS.primary} />} ListEmptyComponent={<View style={styles.emptyContainer}><RefreshCw size={48} color={colors.border} /><Text style={[styles.emptyText, { color: colors.text }]}>No expenses found</Text></View>} />
        </View>
      </SafeAreaView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <View style={styles.modalHeader}><Text style={[styles.modalTitle, { color: colors.text }]}>New Expense</Text><TouchableOpacity onPress={() => setModalVisible(false)}><X size={24} color={colors.textMuted} /></TouchableOpacity></View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}><Text style={[styles.inputLabel, { color: colors.textMuted }]}>Expense Title</Text><View style={[styles.inputWrapper, { borderColor: colors.border }]}><Tag size={18} color={colors.textMuted} style={styles.inputIcon} /><TextInput style={[styles.input, { color: colors.text }]} placeholder="e.g. Office Rent" placeholderTextColor={colors.textMuted} value={newExpense.name} onChangeText={(t) => setNewExpense({...newExpense, name: t})} /></View></View>
              <View style={styles.inputGroup}><Text style={[styles.inputLabel, { color: colors.textMuted }]}>Amount (₹)</Text><View style={[styles.inputWrapper, { borderColor: colors.border }]}><DollarSign size={18} color={colors.textMuted} style={styles.inputIcon} /><TextInput style={[styles.input, { color: colors.text }]} placeholder="0.00" placeholderTextColor={colors.textMuted} keyboardType="numeric" value={newExpense.amount} onChangeText={(t) => setNewExpense({...newExpense, amount: t})} /></View></View>
              <View style={styles.inputGroup}><Text style={[styles.inputLabel, { color: colors.textMuted }]}>Category</Text><View style={styles.categoryGrid}>{['Business', 'Personal', 'Office', 'Travel', 'Utilities'].map((cat) => (
                <TouchableOpacity key={cat} style={[styles.catOption, { borderColor: colors.border }, newExpense.category === cat && styles.catOptionActive]} onPress={() => setNewExpense({...newExpense, category: cat})}><Text style={[styles.catOptionText, { color: newExpense.category === cat ? '#fff' : colors.textMuted }]}>{cat}</Text></TouchableOpacity>
              ))}</View></View>
              <View style={styles.inputGroup}><Text style={[styles.inputLabel, { color: colors.textMuted }]}>Date</Text><View style={[styles.inputWrapper, { borderColor: colors.border }]}><Calendar size={18} color={colors.textMuted} style={styles.inputIcon} /><TextInput style={[styles.input, { color: colors.text }]} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textMuted} value={newExpense.date} onChangeText={(t) => setNewExpense({...newExpense, date: t})} /></View></View>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddExpense}><LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.saveBtnGradient}><Text style={styles.saveBtnText}>SAVE EXPENSE</Text></LinearGradient></TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  safeArea: { flex: 1 },
  decorCircle: { position: 'absolute', borderRadius: 999 },
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 8 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  addBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  filterTabs: { flexDirection: 'row', padding: 4, borderRadius: 16, marginBottom: 24, borderWidth: 1 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  activeTab: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 13, fontWeight: '700' },
  activeTabText: { color: '#fff' },
  listContent: { paddingBottom: 120 },
  expenseItem: { flexDirection: 'row', padding: 16, borderRadius: 24, borderWidth: 1, marginBottom: 12, alignItems: 'center', gap: 16 },
  expIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  expDetails: { flex: 1 },
  expRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  expName: { fontSize: 15, fontWeight: '800' },
  expAmount: { fontSize: 15, fontWeight: '900' },
  expDate: { fontSize: 11, fontWeight: '600' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100, gap: 12 },
  emptyText: { fontSize: 18, fontWeight: '800' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40, height: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: '800' },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: '700', marginBottom: 8, marginLeft: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, paddingHorizontal: 16 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: 52, fontSize: 15 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catOption: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  catOptionActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catOptionText: { fontSize: 13, fontWeight: '700' },
  saveBtn: { marginTop: 12, borderRadius: 16, overflow: 'hidden' },
  saveBtnGradient: { height: 56, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 1 },
});

export default ExpensesScreen;
