import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Home, Lightbulb, Wifi, Train, PenTool, Plus } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import { getExpenses } from '../services/api';

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

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await getExpenses();
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const Icon = categoryIcons[item.category] || PenTool;
    const color = categoryColors[item.category] || '#6366f1';
    return (
      <TouchableOpacity style={[styles.expenseItem, SHADOW.small]}>
        <View style={[styles.expIcon, { backgroundColor: color + '20' }]}>
          <Icon size={20} color={color} />
        </View>
        <View style={styles.expDetails}>
          <View style={styles.expRow}>
            <Text style={styles.expName}>{item.name}</Text>
            <Text style={styles.expAmount}>₹ {parseFloat(item.amount).toLocaleString()}</Text>
          </View>
          <View style={styles.expRow}>
            <Text style={styles.expDate}>{item.date}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.category}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Expenses</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Plus size={24} color={COLORS.textWhite} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterTabs}>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={[styles.tabText, styles.activeTabText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Business</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Personal</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={expenses}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>No expenses found</Text>}
      />
      </View>
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
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 4,
    borderRadius: 12,
    marginBottom: 24,
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
  listContent: {
    paddingBottom: 100,
  },
  expenseItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    alignItems: 'center',
    gap: 16,
  },
  expIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expDetails: {
    flex: 1,
  },
  expRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  expName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  expAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  expDate: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  badge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065f46',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  }
});

export default ExpensesScreen;
