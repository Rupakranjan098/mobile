import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ChevronLeft, 
  Phone, 
  Mail, 
  MessageSquare, 
  MapPin, 
  Send,
  User,
  Type,
  FileText,
  Clock,
  Globe
} from 'lucide-react-native';
import { COLORS, SPACING, RADIUS } from '../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const ContactUsScreen = ({ navigation }) => {
  const { isDark, colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) {
      Alert.alert('Incomplete Form', 'Please fill in all required fields.');
      return;
    }
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Message Sent!',
        'Thank you for reaching out. Our team will get back to you shortly.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 1500);
  };

  const ContactCard = ({ icon: Icon, label, value, color, onPress }) => (
    <TouchableOpacity 
      style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Icon size={22} color={color} />
      </View>
      <View style={styles.cardInfo}>
        <Text style={[styles.cardLabel, { color: colors.textMuted }]}>{label}</Text>
        <Text style={[styles.cardValue, { color: colors.text }]}>{value}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient 
        colors={isDark ? ['#0f172a', '#1e293b'] : ['#f8fafc', '#f1f5f9']} 
        style={StyleSheet.absoluteFill} 
      />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={[styles.backBtn, { backgroundColor: colors.glass }]}
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Contact Us</Text>
          <View style={{ width: 44 }} />
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Hero Section */}
            <View style={styles.heroSection}>
              <Text style={[styles.heroTitle, { color: colors.text }]}>Get in Touch</Text>
              <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
                Have questions or feedback? We'd love to hear from you. 
                Our team usually responds within 2 hours.
              </Text>
            </View>

            {/* Quick Contact Options */}
            <View style={styles.contactGrid}>
              <ContactCard 
                icon={Phone} 
                label="Call Us" 
                value="+91 98765 43210" 
                color="#10b981"
                onPress={() => {}}
              />
              <ContactCard 
                icon={Mail} 
                label="Email" 
                value="support@progst.com" 
                color="#3b82f6"
                onPress={() => {}}
              />
              <ContactCard 
                icon={MessageSquare} 
                label="WhatsApp" 
                value="+91 98765 43210" 
                color="#22c55e"
                onPress={() => {}}
              />
              <ContactCard 
                icon={MapPin} 
                label="Office" 
                value="New Delhi, India" 
                color="#ef4444"
                onPress={() => {}}
              />
            </View>

            {/* Message Form */}
            <View style={[styles.formContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.formTitle, { color: colors.text }]}>Send us a message</Text>
              
              <View style={styles.inputGroup}>
                <View style={styles.inputWrapper}>
                  <User size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Full Name"
                    placeholderTextColor={colors.textMuted}
                    value={form.name}
                    onChangeText={(val) => setForm({...form, name: val})}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputWrapper}>
                  <Mail size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Email Address"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    value={form.email}
                    onChangeText={(val) => setForm({...form, email: val})}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputWrapper}>
                  <Type size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Subject"
                    placeholderTextColor={colors.textMuted}
                    value={form.subject}
                    onChangeText={(val) => setForm({...form, subject: val})}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                  <FileText size={18} color={colors.textMuted} style={[styles.inputIcon, { marginTop: 14 }]} />
                  <TextInput
                    style={[styles.input, styles.textArea, { color: colors.text }]}
                    placeholder="How can we help you?"
                    placeholderTextColor={colors.textMuted}
                    multiline
                    numberOfLines={4}
                    value={form.message}
                    onChangeText={(val) => setForm({...form, message: val})}
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={styles.submitBtn} 
                onPress={handleSubmit}
                disabled={loading}
              >
                <LinearGradient 
                  colors={[COLORS.primary, COLORS.primaryDark]} 
                  style={styles.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.submitText}>{loading ? 'Sending...' : 'Send Message'}</Text>
                  {!loading && <Send size={18} color="#fff" />}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Footer / Social */}
            <View style={styles.footer}>
              <View style={styles.footerItem}>
                <Clock size={16} color={colors.textMuted} />
                <Text style={[styles.footerText, { color: colors.textMuted }]}>Response time: ~2 hours</Text>
              </View>
              <View style={styles.footerItem}>
                <Globe size={16} color={colors.textMuted} />
                <Text style={[styles.footerText, { color: colors.textMuted }]}>www.progst.com</Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 10 
  },
  backBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  title: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  scrollContent: { paddingBottom: 40 },
  
  heroSection: { paddingHorizontal: 24, marginTop: 20, marginBottom: 30 },
  heroTitle: { fontSize: 32, fontWeight: '900', marginBottom: 12 },
  heroSubtitle: { fontSize: 16, lineHeight: 24, opacity: 0.8 },
  
  contactGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    paddingHorizontal: 16, 
    justifyContent: 'space-between' 
  },
  contactCard: {
    width: (width - 48) / 2,
    marginHorizontal: 4,
    marginBottom: 12,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  cardInfo: { flex: 1 },
  cardLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 },
  cardValue: { fontSize: 13, fontWeight: '800' },
  
  formContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10
  },
  formTitle: { fontSize: 20, fontWeight: '900', marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  textAreaWrapper: {
    height: 120,
    alignItems: 'flex-start'
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  textArea: {
    paddingTop: 14,
    textAlignVertical: 'top'
  },
  submitBtn: {
    marginTop: 10,
    borderRadius: 18,
    overflow: 'hidden'
  },
  gradient: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  
  footer: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  footerText: { fontSize: 12, fontWeight: '600' }
});

export default ContactUsScreen;
