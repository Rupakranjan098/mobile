import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Home, Lightbulb, Wifi, Train, PenTool, Plus, X, Calendar, DollarSign, Tag, Briefcase, User as UserIcon, RefreshCw } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import { getExpenses, createExpense } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { scale, moderateScale, verticalScale } from '../utils/responsive';

const categoryIcons = {
  'Office': Home,
  'Utilities': Lightbulb,
  'Internet': Wifi,
  'Travel': Train,
  'Others': PenTool
};

const categoryColors = {
  'Office': '#f59e0b',
  'Utilities': '#fbbf24',
  'Internet': '#3b82f6',
  'Travel': '#ef4444',
  'Others': '#6366f1'
};

const ExpensesScreen = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [newExpense, setNewExpense] = useState({ name: '', amount: '', category: 'Business', date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    fetchExpenses();
  }, []);

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
    if (!newExpense.name || !newExpense.amount) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    try {
      setLoading(true);
      await createExpense(newExpense);
      setModalVisible(false);
      setNewExpense({ name: '', amount: '', category: 'Business', date: new Date().toISOString().split('T')[0] });
      fetchExpenses();
      Alert.alert('Success', 'Expense added successfully');
    } catch (err) {
      Alert.alert('Error', 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = expenses.filter(exp => {
    if (filter === 'All') return true;
    return exp.category === filter;
  });

  const renderItem = ({ item }) => {
    const Icon = categoryIcons[item.category] || PenTool;
    const color = categoryColors[item.category] || '#6366f1';
    return (
      <TouchableOpacity style={[styles.expenseItem, SHADOW.small]} activeOpacity={0.7}>
        <View style={[styles.expIcon, { backgroundColor: color + '15' }]}>
          <Icon size={20} color={color} />
        </View>
        <View style={styles.expDetails}>
          <View style={styles.expRow}>
            <Text style={styles.expName}>{item.name}</Text>
            <Text style={styles.expAmount}>₹ {parseFloat(item.amount).toLocaleString()}</Text>
          </View>
          <View style={styles.expRow}>
            <Text style={styles.expDate}>{item.date}</Text>
            <View style={[styles.badge, { backgroundColor: color + '20' }]}>
              <Text style={[styles.badgeText, { color: color }]}>{item.category}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />
      
      {/* Decorative background spheres */}
      <View style={[styles.decorCircle, { top: -80, left: -100, width: 300, height: 300, backgroundColor: 'rgba(34, 197, 94, 0.08)' }]} />
      <View style={[styles.decorCircle, { bottom: 100, right: -120, width: 350, height: 350, backgroundColor: 'rgba(30, 64, 175, 0.06)' }]} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Expenses</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
              <Plus size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.filterTabs}>
            {['All', 'Business', 'Personal'].map((t) => (
              <TouchableOpacity 
                key={t}
                style={[styles.tab, filter === t && styles.activeTab]} 
                onPress={() => setFilter(t)}
              >
                <Text style={[styles.tabText, filter === t && styles.activeTabText]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <FlatList
            data={filteredExpenses}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchExpenses(); }} tintColor={COLORS.primary} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <RefreshCw size={48} color="rgba(255,255,255,0.05)" />
                <Text style={styles.emptyText}>No expenses found</Text>
                <Text style={styles.emptySubText}>Tap + to record your first expense</Text>
              </View>
            }
          />
        </View>
      </SafeAreaView>

      {/* Add Expense Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Expense</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><X size={24} color="#94a3b8" /></TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Expense Title</Text>
                <View style={styles.inputWrapper}>
                  <Tag size={18} color="#64748b" style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input} 
                    placeholder="e.g. Office Rent" 
                    placeholderTextColor="#475569"
                    value={newExpense.name}
                    onChangeText={(t) => setNewExpense({...newExpense, name: t})}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Amount (₹)</Text>
                <View style={styles.inputWrapper}>
                  <DollarSign size={18} color="#64748b" style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input} 
                    placeholder="0.00" 
                    placeholderTextColor="#475569"
                    keyboardType="numeric"
                    value={newExpense.amount}
                    onChangeText={(t) => setNewExpense({...newExpense, amount: t})}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category</Text>
                <View style={styles.categoryGrid}>
                  {['Business', 'Personal', 'Office', 'Travel', 'Utilities'].map((cat) => (
                    <TouchableOpacity 
                      key={cat} 
                      style={[styles.catOption, newExpense.category === cat && styles.catOptionActive]}
                      onPress={() => setNewExpense({...newExpense, category: cat})}
                    >
                      <Text style={[styles.catOptionText, newExpense.category === cat && styles.catOptionTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date</Text>
                <View style={styles.inputWrapper}>
                  <Calendar size={18} color="#64748b" style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input} 
                    placeholder="YYYY-MM-DD" 
                    placeholderTextColor="#475569"
                    value={newExpense.date}
                    onChangeText={(t) => setNewExpense({...newExpense, date: t})}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleAddExpense}>
                <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.saveBtnGradient}>
                  <Text style={styles.saveBtnText}>SAVE EXPENSE</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#0f172a' },
  safeArea: { flex: 1 },
  decorCircle: { position: 'absolute', borderRadius: 999 },
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  addBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  
  filterTabs: { flexDirection: 'row', backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: 4, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  activeTab: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 13, fontWeight: '700', color: '#94a3b8' },
  activeTabText: { color: '#fff' },
  
  listContent: { paddingBottom: 120 },
  expenseItem: { flexDirection: 'row', backgroundColor: 'rgba(30, 41, 59, 0.7)', padding: 16, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', marginBottom: 12, alignItems: 'center', gap: 16 },
  expIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  expDetails: { flex: 1 },
  expRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  expName: { fontSize: 15, fontWeight: '800', color: '#fff' },
  expAmount: { fontSize: 15, fontWeight: '900', color: '#fff' },
  expDate: { fontSize: 11, color: '#94a3b8', fontWeight: '600' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100, gap: 12 },
  emptyText: { fontSize: 18, fontWeight: '800', color: '#fff' },
  emptySubText: { fontSize: 14, color: '#64748b', textAlign: 'center' },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#1e293b', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40, height: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#94a3b8', marginBottom: 8, marginLeft: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 16 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: 52, color: '#fff', fontSize: 15 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catOption: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: 'rgba(15, 23, 42, 0.4)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  catOptionActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catOptionText: { fontSize: 13, fontWeight: '700', color: '#94a3b8' },
  catOptionTextActive: { color: '#fff' },
  saveBtn: { marginTop: 12, borderRadius: 16, overflow: 'hidden' },
  saveBtnGradient: { height: 56, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 1 },
});

export default ExpensesScreen;
