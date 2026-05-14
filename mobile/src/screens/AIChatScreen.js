import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Bot, User, BarChart2, PieChart, Sparkles, ChevronDown } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { scale, moderateScale, verticalScale } from '../utils/responsive';
import { askAI } from '../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const AIChatScreen = () => {
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

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: queryText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await askAI(queryText);
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: res.data.text,
        chartType: res.data.chartType,
        chartData: res.data.chartData,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('AI Error:', error);
      const errorMsg = {
        id: Date.now().toString(),
        type: 'bot',
        text: "Sorry, I'm having trouble connecting to the business brain. Please check your connection and try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isTyping]);

  const renderChart = (type, data) => {
    const chartConfig = {
      backgroundColor: '#ffffff',
      backgroundGradientFrom: '#ffffff',
      backgroundGradientTo: '#ffffff',
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
      style: { borderRadius: 16 },
      propsForDots: { r: "4", strokeWidth: "2", stroke: "#fff" },
    };

    if (type === 'line') {
      return (
        <LineChart
          data={data}
          width={width * 0.75}
          height={180}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      );
    } else if (type === 'bar') {
      return (
        <BarChart
          data={data}
          width={width * 0.75}
          height={180}
          chartConfig={chartConfig}
          style={styles.chart}
          fromZero
        />
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <View style={styles.botIconWrapper}>
            <Bot size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Business Assistant</Text>
            <View style={styles.onlineStatus}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online & Learning</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.headerAction}>
          <Sparkles size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageWrapper,
                msg.type === 'user' ? styles.userMessageWrapper : styles.botMessageWrapper
              ]}
            >
              {msg.type === 'bot' && (
                <View style={styles.msgAvatar}>
                  <Bot size={14} color={COLORS.primary} />
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  msg.type === 'user' ? styles.userBubble : styles.botBubble,
                  SHADOW.small
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    msg.type === 'user' ? styles.userMessageText : styles.botMessageText
                  ]}
                >
                  {msg.text}
                </Text>

                {msg.chartData && (
                  <View style={styles.chartWrapper}>
                    {renderChart(msg.chartType, msg.chartData)}
                  </View>
                )}

                <Text style={[
                  styles.timestamp,
                  msg.type === 'user' ? styles.userTimestamp : styles.botTimestamp
                ]}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          ))}

          {isTyping && (
            <View style={styles.botMessageWrapper}>
              <View style={styles.msgAvatar}>
                <Bot size={14} color={COLORS.primary} />
              </View>
              <View style={[styles.messageBubble, styles.botBubble, styles.typingBubble]}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputArea, { paddingBottom: insets.bottom > 0 ? insets.bottom : SPACING.md }]}>
          <View style={styles.suggestionsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={styles.suggestionChip}
                onPress={() => handleSend("Profit analysis")}
              >
                <BarChart2 size={14} color={COLORS.primary} />
                <Text style={styles.suggestionText}>Profit Analysis</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.suggestionChip}
                onPress={() => handleSend("Who are my top customers?")}
              >
                <User size={14} color={COLORS.primary} />
                <Text style={styles.suggestionText}>Top Customers</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.suggestionChip}
                onPress={() => handleSend("Show my sales chart")}
              >
                <BarChart2 size={14} color={COLORS.primary} />
                <Text style={styles.suggestionText}>Sales Chart</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.suggestionChip}
                onPress={() => handleSend("Expense analysis")}
              >
                <PieChart size={14} color={COLORS.primary} />
                <Text style={styles.suggestionText}>Expense Analysis</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Ask anything about your business..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                !inputText.trim() && styles.sendBtnDisabled
              ]}
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <Send size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  botIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: COLORS.textMain,
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  onlineText: {
    fontSize: moderateScale(10),
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  headerAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    maxWidth: '85%',
  },
  botMessageWrapper: {
    alignSelf: 'flex-start',
    gap: 8,
  },
  userMessageWrapper: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  msgAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  messageBubble: {
    padding: SPACING.md,
    borderRadius: 20,
  },
  botBubble: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: moderateScale(14),
    lineHeight: 20,
  },
  botMessageText: {
    color: COLORS.textMain,
  },
  userMessageText: {
    color: '#fff',
  },
  chartWrapper: {
    marginTop: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 12,
  },
  timestamp: {
    fontSize: moderateScale(9),
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  botTimestamp: {
    color: COLORS.textMuted,
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.7)',
  },
  typingBubble: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  inputArea: {
    backgroundColor: '#fff',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  suggestionsContainer: {
    marginBottom: 12,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  suggestionText: {
    fontSize: moderateScale(12),
    color: COLORS.textMain,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: moderateScale(14),
    maxHeight: 100,
    color: COLORS.textMain,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#cbd5e1',
  }
});

export default AIChatScreen;
