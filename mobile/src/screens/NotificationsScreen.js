import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, ChevronLeft, Trash2, Package, FileText, AlertCircle, CheckCircle, Info } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { scale, moderateScale } from '../utils/responsive';
import { useTheme } from '../context/ThemeContext';

const NotificationsScreen = ({ navigation }) => {
  const { isDark, colors } = useTheme();
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'inventory', title: 'Low Stock Alert', message: 'Maggi Noodles stock is below 10 units.', time: '2h ago', icon: Package, color: '#f59e0b', read: false },
    { id: 2, type: 'invoice', title: 'Payment Received', message: 'Invoice INV-2024-001 has been marked as paid.', time: '5h ago', icon: CheckCircle, color: '#22c55e', read: true },
    { id: 3, type: 'system', title: 'Plan Expiring', message: 'Your Premium plan expires in 3 days. Renew now!', time: '1d ago', icon: AlertCircle, color: '#ef4444', read: false },
    { id: 4, type: 'expense', title: 'Large Expense', message: 'New expense of ₹15,000 recorded in "Rent".', time: '2d ago', icon: Info, color: '#3b82f6', read: true },
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const renderItem = ({ item }) => {
    const IconComp = item.icon;
    return (
      <TouchableOpacity style={[styles.notifCard, { backgroundColor: colors.card, borderColor: colors.border }, !item.read && { borderLeftWidth: 4, borderLeftColor: item.color }]}>
        <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
          <IconComp size={20} color={item.color} />
        </View>
        <View style={styles.content}>
          <View style={styles.cardHeader}>
            <Text style={[styles.notifTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.notifTime, { color: colors.textMuted }]}>{item.time}</Text>
          </View>
          <Text style={[styles.notifMsg, { color: colors.textMuted }]} numberOfLines={2}>{item.message}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <LinearGradient colors={isDark ? ['#0f172a', '#1e293b'] : ['#f8fafc', '#f1f5f9']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.glass }]}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
          <TouchableOpacity onPress={clearAll} style={[styles.backBtn, { backgroundColor: colors.glass }]}><Trash2 size={20} color="#f87171" /></TouchableOpacity>
        </View>

        <View style={styles.container}>
          <View style={styles.actionRow}>
            <Text style={[styles.countText, { color: colors.textMuted }]}>{notifications.filter(n => !n.read).length} Unread</Text>
            <TouchableOpacity onPress={markAllRead}><Text style={styles.actionText}>Mark all as read</Text></TouchableOpacity>
          </View>

          <FlatList 
            data={notifications} 
            renderItem={renderItem} 
            keyExtractor={item => item.id.toString()} 
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Bell size={64} color={colors.border} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No notifications yet</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16, marginTop: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '800' },
  container: { flex: 1, paddingHorizontal: 20 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingHorizontal: 4 },
  countText: { fontSize: 13, fontWeight: '700' },
  actionText: { fontSize: 13, fontWeight: '800', color: COLORS.primary },
  listContent: { paddingBottom: 100 },
  notifCard: { flexDirection: 'row', padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 12, gap: 16 },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, gap: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notifTitle: { fontSize: 15, fontWeight: '800' },
  notifTime: { fontSize: 11, fontWeight: '600' },
  notifMsg: { fontSize: 13, lineHeight: 18 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 120, gap: 16 },
  emptyText: { fontSize: 16, fontWeight: '600' },
});

export default NotificationsScreen;
