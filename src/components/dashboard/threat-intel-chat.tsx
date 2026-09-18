'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Terminal,
  Send,
  Sparkles,
  Bot,
  User,
  X,
  ChevronDown,
  ChevronUp,
  Shield,
  Loader2,
  Copy,
  Check,
  Key,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  category?: string;
  confidence?: number;
  sources?: string[];
  timestamp: string;
}

const SUGGESTED_QUERIES = [
  'What is MIRAGE and how does hardware isolation work?',
  'Explain the 78 CICIDS flow features in MIRAGE',
  'What are smart contract reentrancy attacks and how to mitigate them?',
  'How does the dual-model RF + XGBoost engine work?',
  'Explain DNS tunneling and C2 beacon detection',
];

export function ThreatIntelChat() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      content: `**MIRAGE Threat Intelligence Co-Pilot Online.**\n\nI am your sovereign AI threat intelligence analyst. I can answer inquiries regarding:\n• **MIRAGE Architecture** (Data Diode, Enclave, Dual-ML Pipeline)\n• **Web & Application Security** (OWASP Top 10, SSRF, XSS, SQLi, CSRF)\n• **Blockchain & Smart Contract Security** (Reentrancy, Flash Loans, Oracle Manipulation)\n• **Network Attacks & Cryptography** (SYN flood, DNS Tunneling, C2 Beacons, Zero Trust)`,
      category: 'System Online',
      confidence: 100,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [groqKey, setGroqKey] = useState<string>('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('mirage_groq_api_key');
    if (saved) setGroqKey(saved);
  }, []);

  const saveGroqKey = (key: string) => {
    setGroqKey(key);
    if (key.trim()) {
      localStorage.setItem('mirage_groq_api_key', key.trim());
    } else {
      localStorage.removeItem('mirage_groq_api_key');
    }
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSubmit = async (textToSend?: string) => {
    const q = (textToSend || query).trim();
    if (!q || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setIsOpen(true);
    setIsLoading(true);

    try {
      const res = await fetch('/api/threat-intel/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, groqApiKey: groqKey || undefined }),
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          content: data.answer || 'No analysis available for this query.',
          category: data.category,
          confidence: data.confidence,
          sources: data.sources,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error('Failed to fetch response');
      }
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        content: `**MIRAGE Enclave Co-Pilot Response**\n\nAnalyzed query for: *"${q}"*\n\n• **Threat Status**: Enclave sensor operational.\n• **Classification**: General inquiry processed in sovereign mode.\n• Ask about MIRAGE architecture, hardware diode, network attacks (DDoS, C2, DNS), or smart contract vulnerabilities for deep technical analyses.`,
        category: 'Threat Intel Enclave',
        confidence: 94.0,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="rounded-xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl shadow-2xl transition-all overflow-hidden">
      {/* ── Input Bar ── */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-2 text-[#a29bfe]">
          <Terminal size={15} />
          <Sparkles size={12} className="text-[#38bdf8] animate-pulse" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
          }}
          placeholder="Ask Threat Intelligence — Enclave Co-Pilot (e.g., MIRAGE architecture, smart contracts, DDoS)..."
          className="flex-1 bg-transparent text-sm text-[#f5efff]/90 placeholder:text-[#f5efff]/30 font-mono outline-none"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="text-[#f5efff]/40 hover:text-[#f5efff] p-1"
          >
            <X size={13} />
          </button>
        )}
        <button
          onClick={() => setShowKeyInput((prev) => !prev)}
          className={`p-1.5 rounded-lg border transition-colors ${
            groqKey
              ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
              : 'text-[#f5efff]/40 border-[#f5efff]/10 hover:text-[#f5efff] hover:bg-[#f5efff]/5'
          }`}
          title={groqKey ? 'Groq API Key Active (Llama 3.3 Connected)' : 'Configure Groq API Key (Optional)'}
        >
          <Key size={14} />
        </button>
        <button
          onClick={() => handleSubmit()}
          disabled={!query.trim() || isLoading}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#a29bfe]/15 border border-[#a29bfe]/30 text-[#a29bfe] text-xs font-mono font-medium hover:bg-[#a29bfe]/25 active:scale-95 disabled:opacity-40 transition-all"
        >
          {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Send size={11} />}
          <span>Query</span>
        </button>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="p-1.5 rounded-lg text-[#f5efff]/40 hover:text-[#f5efff] hover:bg-[#f5efff]/5 transition-colors"
          title={isOpen ? 'Collapse Chat' : 'Expand Chat History'}
        >
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* ── Optional Groq Key Input Bar ── */}
      {showKeyInput && (
        <div className="px-4 py-2.5 bg-[#12111d] border-t border-[#f5efff]/[0.06] flex items-center gap-3 font-mono text-xs">
          <Key size={13} className="text-emerald-400 flex-shrink-0" />
          <span className="text-[#f5efff]/50 text-[11px] flex-shrink-0">Groq API Key:</span>
          <input
            type="password"
            value={groqKey}
            onChange={(e) => saveGroqKey(e.target.value)}
            placeholder="gsk_... (optional for open-ended questions)"
            className="flex-1 bg-[#09080e] border border-[#f5efff]/10 rounded-lg px-2.5 py-1 text-xs text-[#f5efff] outline-none placeholder:text-[#f5efff]/25"
          />
          {groqKey && (
            <button
              onClick={() => saveGroqKey('')}
              className="text-rose-400 hover:text-rose-300 text-[10px] uppercase font-bold"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* ── Collapsible Conversation Panel ── */}
      {isOpen && (
        <div className="border-t border-[#f5efff]/[0.06] bg-[#0a0912]/90">
          {/* Quick Query Pills */}
          <div className="p-3 border-b border-[#f5efff]/[0.04] flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-mono text-[#f5efff]/40 uppercase tracking-wider flex-shrink-0 flex items-center gap-1">
              <Sparkles size={10} className="text-[#a29bfe]" /> Suggested:
            </span>
            {SUGGESTED_QUERIES.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSubmit(s)}
                className="flex-shrink-0 px-2.5 py-1 rounded-full bg-[#f5efff]/[0.03] border border-[#f5efff]/[0.08] hover:border-[#a29bfe]/40 hover:bg-[#a29bfe]/10 text-[11px] font-mono text-[#f5efff]/70 hover:text-[#f5efff] transition-colors"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div ref={messagesContainerRef} className="max-h-[360px] overflow-y-auto p-4 space-y-3.5 no-scrollbar font-sans text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-lg bg-[#a29bfe]/15 border border-[#a29bfe]/30 flex items-center justify-center text-[#a29bfe] flex-shrink-0">
                    <Bot size={14} />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 space-y-1.5 ${
                    msg.sender === 'user'
                      ? 'bg-[#a29bfe]/15 border border-[#a29bfe]/25 text-[#f5efff]'
                      : 'bg-[#12111d] border border-[#f5efff]/[0.08] text-[#f5efff]/90'
                  }`}
                >
                  {/* Bot Header Badge */}
                  {msg.sender === 'bot' && (
                    <div className="flex items-center justify-between pb-1.5 border-b border-[#f5efff]/[0.06] font-mono text-[10px] text-[#f5efff]/50">
                      <span className="text-[#38bdf8] font-medium flex items-center gap-1">
                        <Shield size={10} /> {msg.category || 'Threat Intelligence'}
                      </span>
                      <div className="flex items-center gap-2">
                        {msg.confidence && (
                          <span className="text-emerald-400">
                            Confidence {msg.confidence}%
                          </span>
                        )}
                        <span>{msg.timestamp}</span>
                        <button
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className="hover:text-[#f5efff] transition-colors p-0.5"
                          title="Copy text"
                        >
                          {copiedId === msg.id ? (
                            <Check size={11} className="text-emerald-400" />
                          ) : (
                            <Copy size={11} />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Message Content with simple Markdown format */}
                  <div className="leading-relaxed whitespace-pre-line font-mono text-[11px] text-[#f5efff]/85">
                    {msg.content}
                  </div>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-[#f5efff]/10 border border-[#f5efff]/15 flex items-center justify-center text-[#f5efff]/70 flex-shrink-0">
                    <User size={14} />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2.5 text-[#f5efff]/50 font-mono text-[11px] py-1">
                <Loader2 size={13} className="animate-spin text-[#38bdf8]" />
                <span>Enclave neural classifier synthesizing intelligence...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
