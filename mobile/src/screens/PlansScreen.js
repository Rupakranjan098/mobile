import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Check, Sparkles, Zap, Crown, Rocket, Star } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import { getSubscriptionPlans, subscribe } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { scale, moderateScale, SCREEN_WIDTH } from '../utils/responsive';
import { useTheme } from '../context/ThemeContext';

const PlansScreen = ({ navigation }) => {
  const { isDark, colors } = useTheme();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => { fetchPlans(); }, []);

  const fetchPlans = async () => {
    try {
      const res = await getSubscriptionPlans();
      setPlans(res.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally { setLoading(false); }
  };

  const handleSubscribe = async (planId) => {
    setSubscribing(true);
    try {
      await subscribe(planId);
      Alert.alert('Success', 'Subscription updated successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update subscription');
    } finally { setSubscribing(false); }
  };

  if (loading) {
    return (
      <View style={[styles.mainContainer, { justifyContent: 'center', backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const getPlanTheme = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('premium')) return { color: '#f59e0b', gradient: ['rgba(245, 158, 11, 0.15)', 'rgba(245, 158, 11, 0.05)'], icon: Crown };
    if (lowerName.includes('pro')) return { color: '#3b82f6', gradient: ['rgba(59, 130, 246, 0.15)', 'rgba(59, 130, 246, 0.05)'], icon: Zap };
    return { color: '#22c55e', gradient: ['rgba(34, 197, 94, 0.15)', 'rgba(34, 197, 94, 0.05)'], icon: Rocket };
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <LinearGradient colors={isDark ? ['#0f172a', '#1e293b'] : ['#f8fafc', '#f1f5f9']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.glass }]}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Choose Your Plan</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
          <View style={styles.promoHeader}>
            <LinearGradient colors={[COLORS.primary, '#3b82f6']} style={styles.promoIconWrapper}>
              <Sparkles size={32} color="#fff" />
            </LinearGradient>
            <Text style={[styles.promoTitle, { color: colors.text }]}>Unlock Pro Features</Text>
            <Text style={[styles.promoSubtitle, { color: colors.textMuted }]}>Choose a plan that fits your business needs</Text>
          </View>

          <View style={styles.plansContainer}>
            {plans.map((plan) => {
              const theme = getPlanTheme(plan.name);
              const isPopular = plan.name.toLowerCase().includes('pro');
              
              return (
                <View key={plan.id} style={[styles.planCard, { backgroundColor: colors.card, borderColor: isPopular ? theme.color : colors.border }, SHADOW.medium]}>
                  <LinearGradient colors={theme.gradient} style={StyleSheet.absoluteFill} />
                  {isPopular && <View style={[styles.popularBadge, { backgroundColor: theme.color }]}><Text style={styles.popularText}>MOST POPULAR</Text></View>}
                  
                  <View style={styles.planHeader}>
                    <View style={[styles.iconBox, { backgroundColor: theme.color + '20' }]}>
                      <theme.icon size={26} color={theme.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.planName, { color: colors.text }]}>{plan.name}</Text>
                      <Text style={[styles.planPrice, { color: colors.text }]}>₹{plan.price}<Text style={styles.planDuration}>/{plan.duration === 'monthly' ? 'mo' : 'yr'}</Text></Text>
                    </View>
                  </View>
                  
                  <View style={styles.divider} />

                  <View style={styles.featuresList}>
                    {Array.isArray(plan.features) ? (
                      plan.features.map((feature, idx) => (
                        <View key={idx} style={styles.featureItem}>
                          <View style={[styles.checkCircle, { backgroundColor: theme.color + '15' }]}>
                            <Check size={12} color={theme.color} />
                          </View>
                          <Text style={[styles.featureText, { color: colors.textMuted }]}>{feature}</Text>
                        </View>
                      ))
                    ) : (
                      <>
                        <View style={styles.featureItem}><View style={[styles.checkCircle, { backgroundColor: theme.color + '15' }]}><Check size={12} color={theme.color} /></View><Text style={[styles.featureText, { color: colors.textMuted }]}>Unlimited Invoices</Text></View>
                        <View style={styles.featureItem}><View style={[styles.checkCircle, { backgroundColor: theme.color + '15' }]}><Check size={12} color={theme.color} /></View><Text style={[styles.featureText, { color: colors.textMuted }]}>Cloud Backup & Sync</Text></View>
                        <View style={styles.featureItem}><View style={[styles.checkCircle, { backgroundColor: theme.color + '15' }]}><Check size={12} color={theme.color} /></View><Text style={[styles.featureText, { color: colors.textMuted }]}>AI Business Assistant</Text></View>
                        <View style={styles.featureItem}><View style={[styles.checkCircle, { backgroundColor: theme.color + '15' }]}><Check size={12} color={theme.color} /></View><Text style={[styles.featureText, { color: colors.textMuted }]}>Priority Support</Text></View>
                      </>
                    )}
                  </View>

                  <TouchableOpacity 
                    style={[styles.selectBtn, { backgroundColor: isPopular ? theme.color : colors.glass }]}
                    onPress={() => handleSubscribe(plan.id)}
                    disabled={subscribing}
                  >
                    <Text style={[styles.selectBtnText, { color: isPopular ? '#fff' : colors.text }]}>
                      {subscribing ? 'Processing...' : 'Get Started'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20, marginTop: 8 },
  backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '800' },
  promoHeader: { alignItems: 'center', marginVertical: 30, paddingHorizontal: 40 },
  promoTitle: { fontSize: 24, fontWeight: '900', marginTop: 12, textAlign: 'center' },
  promoSubtitle: { fontSize: 14, fontWeight: '600', marginTop: 8, textAlign: 'center', lineHeight: 20 },
  plansContainer: { paddingHorizontal: 20, gap: 24 },
  planCard: { padding: 24, borderRadius: 32, borderWidth: 1.5, overflow: 'hidden' },
  promoIconWrapper: { width: 64, height: 64, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  popularBadge: { position: 'absolute', top: 16, right: 24, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  popularText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  planHeader: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 20 },
  iconBox: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  planName: { fontSize: 18, fontWeight: '900', marginBottom: 4 },
  planPrice: { fontSize: 28, fontWeight: '900' },
  planDuration: { fontSize: 14, fontWeight: '600', opacity: 0.6 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 4, marginBottom: 20 },
  featuresList: { gap: 14, marginBottom: 30 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkCircle: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  featureText: { fontSize: 14, fontWeight: '600' },
  selectBtn: { height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  selectBtnText: { fontSize: 16, fontWeight: '900', letterSpacing: 1 },
});

export default PlansScreen;
