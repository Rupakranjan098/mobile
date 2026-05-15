import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Bot, User, BarChart2, PieChart, Sparkles, ChevronDown, ChevronLeft } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { scale, moderateScale, verticalScale, SCREEN_WIDTH } from '../utils/responsive';
import { askAI } from '../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const AIChatScreen = ({ navigation }) => {
  const { isDark, colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'bot',
      text: "Hello! I'm your ProGst AI Assistant. I can help you analyze your business data, generate reports, or answer questions about GST. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef();

  const handleSend = async (forcedText = null) => {
    const queryText = forcedText || inputText;
    if (!queryText.trim()) return;

    const userMessage = { id: Date.now().toString(), type: 'user', text: queryText, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await askAI(queryText);
      const aiResponse = { id: (Date.now() + 1).toString(), type: 'bot', text: res.data.text, chartType: res.data.chartType, chartData: res.data.chartData, timestamp: new Date() };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { id: Date.now().toString(), type: 'bot', text: "Sorry, I'm having trouble connecting to the business brain.", timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    setTimeout(() => { scrollViewRef.current?.scrollToEnd({ animated: true }); }, 100);
  }, [messages, isTyping]);

  const renderChart = (type, data) => {
    const chartConfig = {
      backgroundColor: 'transparent',
      backgroundGradientFrom: isDark ? '#1e293b' : '#fff',
      backgroundGradientTo: isDark ? '#1e293b' : '#fff',
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
      labelColor: (opacity = 1) => isDark ? `rgba(148, 163, 184, ${opacity})` : `rgba(71, 85, 105, ${opacity})`,
      style: { borderRadius: 16 },
      propsForDots: { r: "4", strokeWidth: "2", stroke: COLORS.primary },
      propsForBackgroundLines: { strokeDasharray: "", stroke: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }
    };
    if (type === 'line') return <LineChart data={data} width={SCREEN_WIDTH * 0.7} height={180} chartConfig={chartConfig} bezier style={styles.chart} />;
    if (type === 'bar') return <BarChart data={data} width={SCREEN_WIDTH * 0.7} height={180} chartConfig={chartConfig} style={styles.chart} fromZero />;
    return null;
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <LinearGradient colors={isDark ? ['#0f172a', '#1e293b'] : ['#f8fafc', '#f1f5f9']} style={StyleSheet.absoluteFill} />
      <View style={[styles.decorCircle, { top: -50, right: -100, width: 300, height: 300, backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)' }]} />
      <View style={[styles.decorCircle, { bottom: 200, left: -150, width: 350, height: 350, backgroundColor: isDark ? 'rgba(30, 64, 175, 0.08)' : 'rgba(30, 64, 175, 0.03)' }]} />

      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerTitleContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.glass }]}>
              <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.botIconWrapper}><Bot size={20} color="#fff" /></View>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>AI Assistant</Text>
              <View style={styles.onlineStatus}><View style={styles.onlineDot} /><Text style={[styles.onlineText, { color: colors.textMuted }]}>Intelligent Analysis</Text></View>
            </View>
          </View>
          <TouchableOpacity style={[styles.headerAction, { backgroundColor: COLORS.primary + '15' }]}><Sparkles size={20} color={COLORS.primary} /></TouchableOpacity>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={styles.container} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
          <ScrollView ref={scrollViewRef} style={styles.chatContainer} contentContainerStyle={styles.chatContent} showsVerticalScrollIndicator={false}>
            {messages.map((msg) => (
              <View key={msg.id} style={[styles.messageWrapper, msg.type === 'user' ? styles.userMessageWrapper : styles.botMessageWrapper]}>
                {msg.type === 'bot' && <View style={[styles.msgAvatar, { backgroundColor: COLORS.primary + '20' }]}><Bot size={14} color={COLORS.primary} /></View>}
                <View style={[styles.messageBubble, msg.type === 'user' ? styles.userBubble : [styles.botBubble, { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.7)' : '#fff', borderColor: colors.border }], SHADOW.small]}>
                  <Text style={[styles.messageText, msg.type === 'user' ? styles.userMessageText : { color: colors.text }]}>{msg.text}</Text>
                  {msg.chartData && <View style={[styles.chartWrapper, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.3)' : '#f8fafc', borderColor: colors.border }]}>{renderChart(msg.chartType, msg.chartData)}</View>}
                  <Text style={[styles.timestamp, { color: msg.type === 'user' ? 'rgba(255,255,255,0.6)' : colors.textMuted }]}>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
              </View>
            ))}
            {isTyping && (
              <View style={styles.botMessageWrapper}>
                <View style={[styles.msgAvatar, { backgroundColor: COLORS.primary + '20' }]}><Bot size={14} color={COLORS.primary} /></View>
                <View style={[styles.messageBubble, styles.botBubble, styles.typingBubble, { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.7)' : '#fff', borderColor: colors.border }]}><ActivityIndicator size="small" color={COLORS.primary} /></View>
              </View>
            )}
          </ScrollView>

          <View style={[styles.inputArea, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: insets.bottom > 0 ? insets.bottom : SPACING.md }]}>
            <View style={styles.suggestionsContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['Profit analysis', 'Top customers', 'Show sales chart'].map((s, i) => (
                  <TouchableOpacity key={i} style={[styles.suggestionChip, { backgroundColor: colors.glass, borderColor: colors.border }]} onPress={() => handleSend(s)}>
                    <BarChart2 size={14} color={COLORS.primary} />
                    <Text style={[styles.suggestionText, { color: colors.text }]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={styles.inputRow}>
              <TextInput style={[styles.input, { color: colors.text, backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#f1f5f9', borderColor: colors.border }]} placeholder="Ask your assistant..." placeholderTextColor={colors.textMuted} value={inputText} onChangeText={setInputText} multiline maxLength={500} />
              <TouchableOpacity style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]} onPress={handleSend} disabled={!inputText.trim()}><Send size={20} color="#fff" /></TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  safeArea: { flex: 1 },
  decorCircle: { position: 'absolute', borderRadius: 999 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1 },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  botIconWrapper: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: moderateScale(16), fontWeight: '800' },
  onlineStatus: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.success },
  onlineText: { fontSize: moderateScale(10), fontWeight: '700' },
  headerAction: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  backBtn: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 4 },
  container: { flex: 1 },
  chatContainer: { flex: 1 },
  chatContent: { padding: SPACING.md, paddingBottom: SPACING.xl },
  messageWrapper: { flexDirection: 'row', marginBottom: SPACING.md, maxWidth: '85%' },
  botMessageWrapper: { alignSelf: 'flex-start', gap: 8 },
  userMessageWrapper: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  msgAvatar: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  messageBubble: { padding: SPACING.md, borderRadius: 24, borderAround: 1, borderWidth: 1 },
  botBubble: { borderTopLeftRadius: 4 },
  userBubble: { backgroundColor: COLORS.primary, borderColor: 'transparent', borderTopRightRadius: 4 },
  messageText: { fontSize: moderateScale(14), lineHeight: 20 },
  userMessageText: { color: '#fff', fontWeight: '500' },
  chartWrapper: { marginTop: 12, borderRadius: 16, padding: 8, alignItems: 'center', borderWidth: 1 },
  chart: { marginVertical: 8, borderRadius: 16 },
  timestamp: { fontSize: moderateScale(9), marginTop: 4, alignSelf: 'flex-end', fontWeight: '700' },
  typingBubble: { paddingHorizontal: 20, paddingVertical: 12 },
  inputArea: { padding: SPACING.md, borderTopWidth: 1 },
  suggestionsContainer: { marginBottom: 12 },
  suggestionChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.full, marginRight: 8, borderWidth: 1 },
  suggestionText: { fontSize: moderateScale(12), fontWeight: '700' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  input: { flex: 1, borderRadius: 24, paddingHorizontal: 20, paddingVertical: 12, fontSize: moderateScale(14), maxHeight: 100, borderWidth: 1 },
  sendBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  sendBtnDisabled: { backgroundColor: 'rgba(148, 163, 184, 0.2)' }
});

export default AIChatScreen;
