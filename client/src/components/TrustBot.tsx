import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Loader2, Sparkles, MapPin, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

interface Message {
  role: 'user' | 'model';
  text: string;
  time?: string;
}

interface Props {
  userLocation?: { lat: number; lng: number };
  nearbyShops?: any[];
}

const QUICK_PROMPTS = [
  '🛒 Find nearby grocery stores',
  '💊 Trusted pharmacies near me',
  '🍛 Best food delivery?',
  '💻 Local electronics shops',
];

function getTime() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export default function TrustBot({ userLocation, nearbyShops }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: "Hi! I'm TrustBot 🤖 Your AI guide to trusted local commerce. How can I help you today?",
      time: getTime(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleOpen = () => {
    setIsOpen((v) => !v);
    setUnread(0);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', text, time: getTime() };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    const context = userLocation
      ? `User is located at lat ${userLocation.lat.toFixed(4)}, lng ${userLocation.lng.toFixed(4)}.`
      : 'User location unknown.';

    try {
      const { data } = await api.post('/chat', {
        message: text,
        history: messages.map((m) => ({ role: m.role, text: m.text })),
        context,
        shops: nearbyShops,
      });
      const botMsg: Message = { role: 'model', text: data.reply, time: getTime() };
      setMessages([...newHistory, botMsg]);
      if (!isOpen) setUnread((u) => u + 1);
    } catch (err: any) {
      console.error('TrustBot Connection Error:', err);
      setMessages([
        ...newHistory,
        {
          role: 'model',
          text: `⚠️ Connection Error: ${err.message || 'Server is unreachable'}. Please ensure your backend is running on port 5000 and check your internet connection.`,
          time: getTime(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const isDemoMode = messages.some(m => m.text.includes("processing a lot of requests") || m.text.includes("High-Demand mode"));

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl shadow-blue-500/40 flex items-center justify-center"
        aria-label="Open TrustBot"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Bot className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
        {!isOpen && <span className="absolute inset-0 rounded-full animate-ping bg-blue-500 opacity-30" />}
        {!isOpen && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unread}
          </span>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.94 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[540px] flex flex-col rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/30 border border-slate-200/50 dark:border-slate-700/50"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-4 flex items-center gap-3 flex-shrink-0">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-bold flex items-center gap-2">
                  TrustBot <Sparkles className="w-3 h-3" />
                </div>
                <div className="text-blue-100 text-[10px] flex items-center gap-1">
                  {isDemoMode ? (
                    <><Zap className="w-2 h-2 fill-yellow-400 text-yellow-400" /> Demo Mode Active</>
                  ) : (
                    <><Zap className="w-2 h-2 fill-green-400 text-green-400" /> Online & Verified</>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className={`w-2 h-2 rounded-full ${isDemoMode ? 'bg-yellow-400' : 'bg-green-400'} animate-pulse`} />
              </div>
            </div>

            {/* Location Badge */}
            {userLocation && (
              <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 flex-shrink-0">
                <MapPin className="w-3 h-3" />
                <span>Location context active</span>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900 p-4 space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}
                >
                  {msg.role === 'model' && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mb-4">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="flex flex-col gap-1 max-w-[78%]">
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                    {msg.time && (
                      <span className={`text-[10px] text-slate-400 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {msg.time}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex items-end gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1 items-center">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length <= 1 && (
              <div className="bg-white dark:bg-slate-900 px-4 pb-2 flex flex-wrap gap-2 flex-shrink-0">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-3 flex gap-2 flex-shrink-0">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                placeholder="Ask TrustBot anything…"
                className="flex-1 rounded-full border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                disabled={isLoading}
              />
              <Button
                onClick={() => sendMessage(input)}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="rounded-full bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
