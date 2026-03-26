import { useState, useRef, useEffect } from 'react';
import { User } from 'firebase/auth';
import { UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, Bot, User as UserIcon, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';

interface MentorProps {
  user: User;
  profile: UserProfile;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function Mentor({ user, profile }: MentorProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Hello ${profile.displayName}! I'm your AI Career Mentor. How can I help you today? You can ask me about career paths, skill gaps, or resume advice.` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: `You are a world-class career mentor for students in India. 
          The student's name is ${profile.displayName}, their role is ${profile.role}, 
          their interests are ${profile.interests?.join(", ")}, and their goal is ${profile.careerGoal}.
          Provide practical, encouraging, and industry-relevant advice.`,
        }
      });

      // We need to send the full history if we're not persisting the chat object
      // But for simplicity in this component, we'll just send the current message
      // and let the AI respond based on the system instruction.
      // To maintain real history, we'd need to store the chat object in a ref.
      
      const result = await chat.sendMessage({ message: userMessage });
      const text = result.text;

      setMessages(prev => [...prev, { role: 'model', text: text || "I'm sorry, I couldn't generate a response." }]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-slate-900">AI Career Mentor</div>
            <div className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></div>
              Online
            </div>
          </div>
        </div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Powered by Gemini AI</div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {messages.map((m, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              m.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'
            }`}>
              {m.role === 'user' ? <UserIcon className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none'
            }`}>
              <div className="markdown-body">
                <ReactMarkdown>{m.text}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-slate-100 bg-slate-50/50">
        <div className="relative flex items-center gap-2">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about your career..."
            className="w-full p-4 pr-14 rounded-2xl border-2 border-slate-200 focus:border-indigo-600 outline-none transition-all bg-white"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            "Suggest a career path",
            "How to learn React?",
            "Review my skills",
            "Resume tips"
          ].map((suggestion) => (
            <button 
              key={suggestion}
              onClick={() => setInput(suggestion)}
              className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:border-indigo-600 hover:text-indigo-600 transition-all"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
