import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, HelpCircle, Phone, Mail, MessageCircle, ChevronDown, ChevronUp, Search, Send, Clock, Globe } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import { getFAQs, getSupportContact } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const SupportCenterScreen = ({ navigation }) => {
  const { isDark, colors } = useTheme();
  const [activeTab, setActiveTab] = useState('FAQs');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { loadSupportData(); }, []);

  const loadSupportData = async () => {
    try {
      const [faqRes, contactRes] = await Promise.all([getFAQs(), getSupportContact()]);
      setFaqs(faqRes.data.length > 0 ? faqRes.data : [
        { question: 'How do I add a new product?', answer: 'Go to the Products tab and tap the "+" button in the top right corner. You can also scan a barcode to auto-fill details.' },
        { question: 'Is my data backed up?', answer: 'Yes! All your data is synced to our secure cloud servers whenever you have an active internet connection.' },
        { question: 'How can I export my reports?', answer: 'Navigate to the Reports screen and tap the download icon. You can choose between GST summaries or detailed sales reports.' },
        { question: 'Can I use this app offline?', answer: 'The app works partially offline. However, cloud sync, AI chat, and barcode lookups require an active connection.' }
      ]);
      setContact(contactRes.data || {
        email: 'support@progst.com',
        phone: '+91 98765 43210',
        website: 'www.progst.com',
        timing: 'Mon-Fri, 9:00 AM - 6:00 PM'
      });
    } catch (error) {
      console.error('Error loading support data:', error);
    } finally { setLoading(false); }
  };

  const filteredFaqs = faqs.filter(f => f.question.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleEmail = () => Linking.openURL(`mailto:${contact.email}`);
  const handlePhone = () => Linking.openURL(`tel:${contact.phone}`);
  const handleWeb = () => Linking.openURL(`https://${contact.website}`);

  if (loading) {
    return (
      <View style={[styles.mainContainer, { justifyContent: 'center', backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <LinearGradient colors={isDark ? ['#0f172a', '#1e293b'] : ['#f8fafc', '#f1f5f9']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.glass }]}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Support Center</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.tabBar}>
          {['FAQs', 'Contact Us'].map(t => (
            <TouchableOpacity key={t} style={[styles.tab, activeTab === t && { borderBottomColor: COLORS.primary }]} onPress={() => setActiveTab(t)}>
              <Text style={[styles.tabText, { color: activeTab === t ? COLORS.primary : colors.textMuted }]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {activeTab === 'FAQs' ? (
            <View style={styles.faqSection}>
              <View style={[styles.searchBar, { backgroundColor: colors.glass, borderColor: colors.border }]}>
                <Search size={18} color={colors.textMuted} />
                <TextInput style={[styles.searchInput, { color: colors.text }]} placeholder="Search help topics..." placeholderTextColor={colors.textMuted} value={searchQuery} onChangeText={setSearchQuery} />
              </View>

              {filteredFaqs.map((faq, idx) => {
                const isExpanded = expandedFaq === idx;
                return (
                  <TouchableOpacity key={idx} style={[styles.faqCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => setExpandedFaq(isExpanded ? null : idx)}>
                    <View style={styles.faqHeader}>
                      <Text style={[styles.faqQuestion, { color: colors.text }]}>{faq.question}</Text>
                      {isExpanded ? <ChevronUp size={18} color={colors.textMuted} /> : <ChevronDown size={18} color={colors.textMuted} />}
                    </View>
                    {isExpanded && <Text style={[styles.faqAnswer, { color: colors.textMuted }]}>{faq.answer}</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.contactSection}>
              <View style={styles.contactHero}>
                <HelpCircle size={64} color={COLORS.primary} strokeWidth={1} />
                <Text style={[styles.contactTitle, { color: colors.text }]}>How can we help?</Text>
                <Text style={[styles.contactSubtitle, { color: colors.textMuted }]}>Our support team is available during business hours to assist you.</Text>
              </View>

              <View style={styles.contactGrid}>
                <TouchableOpacity style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={handlePhone}>
                  <View style={[styles.iconBox, { backgroundColor: '#dcfce7' }]}><Phone size={24} color="#16a34a" /></View>
                  <Text style={[styles.cardLabel, { color: colors.text }]}>Call Us</Text>
                  <Text style={[styles.cardValue, { color: colors.textMuted }]}>{contact.phone}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={handleEmail}>
                  <View style={[styles.iconBox, { backgroundColor: '#dbeafe' }]}><Mail size={24} color="#2563eb" /></View>
                  <Text style={[styles.cardLabel, { color: colors.text }]}>Email Support</Text>
                  <Text style={[styles.cardValue, { color: colors.textMuted }]}>{contact.email}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={handleWeb}>
                  <View style={[styles.iconBox, { backgroundColor: '#fef3c7' }]}><Globe size={24} color="#d97706" /></View>
                  <Text style={[styles.cardLabel, { color: colors.text }]}>Visit Website</Text>
                  <Text style={[styles.cardValue, { color: colors.textMuted }]}>{contact.website}</Text>
                </TouchableOpacity>

                <View style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: 0.7 }]}>
                  <View style={[styles.iconBox, { backgroundColor: '#f3e8ff' }]}><Clock size={24} color="#9333ea" /></View>
                  <Text style={[styles.cardLabel, { color: colors.text }]}>Working Hours</Text>
                  <Text style={[styles.cardValue, { color: colors.textMuted }]}>{contact.timing}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.chatBtn} onPress={() => navigation.navigate('AI Chat')}>
                <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.chatGradient}>
                  <MessageCircle size={20} color="#fff" />
                  <Text style={styles.chatBtnText}>Chat with AI Assistant</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12, marginTop: 8 },
  backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '800' },
  tabBar: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 24, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText: { fontSize: 14, fontWeight: '800' },
  faqSection: { paddingHorizontal: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 52, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 14, fontWeight: '600' },
  faqCard: { padding: 18, borderRadius: 20, borderWidth: 1, marginBottom: 12 },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { fontSize: 15, fontWeight: '800', flex: 1, marginRight: 12 },
  faqAnswer: { fontSize: 14, lineHeight: 22, marginTop: 12, fontWeight: '600' },
  contactSection: { paddingHorizontal: 20 },
  contactHero: { alignItems: 'center', marginVertical: 30, gap: 12 },
  contactTitle: { fontSize: 22, fontWeight: '900' },
  contactSubtitle: { fontSize: 14, textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 },
  contactGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 30 },
  contactCard: { width: '48%', padding: 20, borderRadius: 24, borderWidth: 1, alignItems: 'center', gap: 10 },
  iconBox: { width: 52, height: 52, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  cardLabel: { fontSize: 13, fontWeight: '800' },
  cardValue: { fontSize: 11, fontWeight: '700' },
  chatBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 10 },
  chatGradient: { height: 56, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
  chatBtnText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
});

export default SupportCenterScreen;
