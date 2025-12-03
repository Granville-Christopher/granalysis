import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "../../utils/axios";
import { 
  MessageCircle, X, Send, GripVertical, Copy, RotateCcw, MoreVertical, 
  ThumbsUp, ThumbsDown, Search, Download, FileText, Code, Bold, Italic, 
  Hash, Sparkles, ChevronDown, Zap, AlertCircle,
  RefreshCw, Trash2, Edit2, Check
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { THEME_CONFIG, ThemeConfig, getGlassmorphismClass } from "../home/theme";

type Tier = 'free' | 'startup' | 'business' | 'enterprise';

type TrendPoint = { label: string; value: number };

type FileInsightsLite = {
  caption?: string;
  sales_trend?: TrendPoint[];
  forecast_trend?: TrendPoint[];
  daily_profit_trend?: TrendPoint[];
  top_3?: Array<{ product_name?: string; product?: string; total_sales?: number }>;
  total_sales?: number;
  total_orders?: number;
  profit_margin_pct?: number;
  total_profit?: number;
  sales_growth?: number;
};

type ChatMsg = { 
  id: string; 
  role: 'user' | 'assistant'; 
  html: string; 
  ts: number;
  tokens?: number;
  reaction?: 'up' | 'down' | null;
  originalText?: string; // For user messages to enable editing
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  userId?: number | string;
  userTier: Tier;
  fileId?: number;
  fileName?: string;
  fileInsights?: FileInsightsLite | undefined;
  hasOpenFile: boolean;
};

// Simple client-side "E2E-like" storage: encrypt chats locally; never send to server
async function generateOrGetKey(userId: string): Promise<CryptoKey> {
  const keyName = `chat_key_${userId}`;
  const existing = localStorage.getItem(keyName);
  if (existing) {
    const raw = Uint8Array.from(atob(existing), c => c.charCodeAt(0)).buffer;
    return await crypto.subtle.importKey('raw', raw, 'AES-GCM', true, ['encrypt', 'decrypt']);
  }
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  const raw = await crypto.subtle.exportKey('raw', key);
  const rawBytes = new Uint8Array(raw);
  let rawBin = '';
  for (let i = 0; i < rawBytes.length; i++) rawBin += String.fromCharCode(rawBytes[i]);
  localStorage.setItem(keyName, btoa(rawBin));
  return key;
}

async function encryptForUser(userId: string, data: any): Promise<string> {
  const key = await generateOrGetKey(userId);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(data));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
  const payload = new Uint8Array(iv.byteLength + ciphertext.byteLength);
  payload.set(iv, 0);
  payload.set(new Uint8Array(ciphertext), iv.byteLength);
  let bin = '';
  for (let i = 0; i < payload.length; i++) bin += String.fromCharCode(payload[i]);
  return btoa(bin);
}

async function decryptForUser(userId: string, encoded: string): Promise<any | null> {
  try {
    const key = await generateOrGetKey(userId);
    const raw = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
    const iv = raw.slice(0, 12);
    const data = raw.slice(12);
    const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
    return JSON.parse(new TextDecoder().decode(plaintext));
  } catch {
    return null;
  }
}

const ChatAssistant: React.FC<Props> = ({ isOpen, onClose, onOpen, userId, userTier, fileId, fileName, fileInsights, hasOpenFile }) => {
  const { isDark } = useTheme();
  const colors: ThemeConfig = isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const glass = getGlassmorphismClass(colors);

  // FAB position (draggable in right corner region)
  const [fabPos, setFabPos] = useState<{ right: number; bottom: number }>({ right: 24, bottom: 72 });
  const dragRef = useRef<{ startX: number; startY: number; startRight: number; startBottom: number } | null>(null);

  const canUseAssistant = userTier === 'business' || userTier === 'enterprise';

  // Chat state
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [conversations, setConversations] = useState<{ id: string; title: string; msgs: ChatMsg[] }[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [showFormatToolbar, setShowFormatToolbar] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ remaining?: number; resetAt?: number } | null>(null);
  const [totalTokensUsed, setTotalTokensUsed] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const userKey = String(userId ?? 'anon');

  // Load conversations
  useEffect(() => {
    const load = async () => {
      const enc = localStorage.getItem(`chat_convs_${userKey}`);
      if (enc) {
        const data = await decryptForUser(userKey, enc);
        if (Array.isArray(data)) {
          setConversations(data);
          if (data.length > 0 && !currentConversationId) {
            setCurrentConversationId(data[0].id);
            setMsgs(data[0].msgs);
          }
        }
      } else {
        // Create first conversation
        const firstConv = { id: crypto.randomUUID(), title: 'New Conversation', msgs: [] };
        setConversations([firstConv]);
        setCurrentConversationId(firstConv.id);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userKey]);

  // Save conversations
  useEffect(() => {
    const save = async () => {
      if (conversations.length) {
        const enc = await encryptForUser(userKey, conversations);
        localStorage.setItem(`chat_convs_${userKey}`, enc);
      }
    };
    if (conversations.length) save();
  }, [conversations, userKey]);

  // Update current conversation messages
  useEffect(() => {
    if (currentConversationId && msgs.length) {
      setConversations(prev => prev.map(conv => 
        conv.id === currentConversationId ? { ...conv, msgs } : conv
      ));
    }
  }, [msgs, currentConversationId]);

  // Auto-scroll
  useEffect(() => {
    if (autoScroll && listRef.current) {
      listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [msgs, isOpen, autoScroll]);

  // Inject custom scrollbar styles (matching InsightsPanel)
  useEffect(() => {
    const styleId = 'chat-assistant-scrollbar-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = `
      .chat-assistant-scrollable::-webkit-scrollbar {
        width: 6px;
      }
      .chat-assistant-scrollable::-webkit-scrollbar-track {
        background: ${colors.isDark ? 'rgba(11, 27, 59, 0.3)' : 'rgba(229, 231, 235, 0.3)'};
        border-radius: 10px;
      }
      .chat-assistant-scrollable::-webkit-scrollbar-thumb {
        background: ${colors.isDark ? 'rgba(59, 130, 246, 0.6)' : 'rgba(59, 130, 246, 0.4)'};
        border-radius: 10px;
      }
      .chat-assistant-scrollable::-webkit-scrollbar-thumb:hover {
        background: ${colors.isDark ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.6)'};
      }
    `;

    return () => {
      // Cleanup is handled by React's effect cleanup, but we keep the style element
      // as it might be used by other instances
    };
  }, [colors.isDark]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && inputRef.current) {
        e.preventDefault();
        const text = inputRef.current.value.trim();
        if (text) {
          setInput(text);
          setTimeout(() => handleSend(), 0);
        }
      } else if (e.key === 'Escape') {
        onClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, onClose]);

  // Format time
  const formatTime = (ts: number) => {
    const date = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const escapeHtml = useCallback((s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"), []);
  
  // Enhanced markdown renderer with code highlighting
  const renderMarkdown = useCallback((s: string) => {
    if (!s) return '';
    
    let escaped = escapeHtml(s);
    
    // Code blocks
    escaped = escaped.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre class="bg-gray-800 text-green-400 p-3 rounded-lg my-2 overflow-x-auto"><code>${escapeHtml(code.trim())}</code></pre>`;
    });
    
    // Inline code
    escaped = escaped.replace(/`([^`]+)`/g, '<code class="bg-gray-800 text-green-400 px-1.5 py-0.5 rounded text-sm">$1</code>');
    
    // Bold - handle both **text** and *text* (but not list markers)
    escaped = escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    // Single asterisk for bold (but not at start of line for lists)
    escaped = escaped.replace(/(?<!^|\n|>|\s)\*([^*\n]+?)\*(?!\*)/g, "<strong>$1</strong>");
    
    const lines = escaped.split('\n');
    const output: string[] = [];
    let inOrderedList = false;
    let inUnorderedList = false;
    let inParagraph = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const nextLine = i < lines.length - 1 ? lines[i + 1].trim() : '';
      
      const numberedMatch = line.match(/^(\d+)[.)]\s+(.+)$/);
      if (numberedMatch) {
        if (!inOrderedList) {
          if (inUnorderedList) output.push('</ul>');
          if (inParagraph) output.push('</p>');
          output.push('<ol class="list-decimal ml-6 mb-3 space-y-1">');
          inOrderedList = true;
          inUnorderedList = false;
          inParagraph = false;
        }
        let itemContent = numberedMatch[2];
        itemContent = itemContent.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        output.push(`<li>${itemContent}</li>`);
        continue;
      }
      
      const bulletMatch = line.match(/^([-*•])\s+(.+)$/);
      if (bulletMatch) {
        if (!inUnorderedList) {
          if (inOrderedList) output.push('</ol>');
          if (inParagraph) output.push('</p>');
          output.push('<ul class="list-disc ml-6 mb-3 space-y-1">');
          inUnorderedList = true;
          inOrderedList = false;
          inParagraph = false;
        }
        let itemContent = bulletMatch[2];
        itemContent = itemContent.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        output.push(`<li>${itemContent}</li>`);
        continue;
      }
      
      if (inOrderedList) { output.push('</ol>'); inOrderedList = false; }
      if (inUnorderedList) { output.push('</ul>'); inUnorderedList = false; }
      
      if (line === '') {
        if (inParagraph) { output.push('</p>'); inParagraph = false; }
        if (nextLine && nextLine !== '') output.push('<div class="mb-3"></div>');
        continue;
      }
      
      if (!inParagraph) {
        output.push('<p class="mb-3">');
        inParagraph = true;
      } else {
        output.push('<br>');
      }
      output.push(line);
    }
    
    if (inOrderedList) output.push('</ol>');
    if (inUnorderedList) output.push('</ul>');
    if (inParagraph) output.push('</p>');
    
    return output.join('');
  }, [escapeHtml]);
  
  const boldify = useCallback((s: string) => renderMarkdown(s), [renderMarkdown]);


  // Suggested questions based on file
  const suggestedQuestions = useMemo(() => {
    if (!hasOpenFile || !fileInsights) {
      return [
        "What is e-commerce?",
        "How do I calculate profit margin?",
        "What is customer lifetime value?",
        "Explain sales forecasting"
      ];
    }
    return [
      "Show me the highest sales month",
      "What's the top product?",
      "Calculate total profit",
      "Generate sales forecast",
      "Show me a sales chart",
      "What are the AI recommendations?",
      "Identify growth opportunities",
      "What risks should I be aware of?"
    ];
  }, [hasOpenFile, fileInsights]);

  const handleSend = useCallback((regenerateId?: string) => {
    const text = input.trim();
    if (!text && !regenerateId) return;
    
    const questionText = regenerateId 
      ? msgs.find(m => m.id === regenerateId)?.originalText || msgs.find(m => m.role === 'user' && msgs.indexOf(m) < msgs.findIndex(m2 => m2.id === regenerateId))?.originalText || ''
      : text;

    if (!questionText) return;

    if (!regenerateId) {
      const userMsg: ChatMsg = { 
        id: crypto.randomUUID(), 
        role: 'user', 
        html: boldify(escapeHtml(text)), 
        ts: Date.now(),
        originalText: text
      };
      setMsgs(m => [...m, userMsg]);
      setInput("");
    }

    const assistantMsgId = regenerateId || crypto.randomUUID();
    if (!regenerateId) {
      setMsgs(m => [...m, { 
        id: assistantMsgId, 
        role: 'assistant', 
        html: '<div class="flex items-center gap-2"><div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div><div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style="animation-delay:0.2s"></div><div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style="animation-delay:0.4s"></div></div>', 
        ts: Date.now() 
      }]);
    } else {
      setMsgs(m => m.map(msg => msg.id === assistantMsgId ? { ...msg, html: '<div class="flex items-center gap-2"><div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div><div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style="animation-delay:0.2s"></div><div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style="animation-delay:0.4s"></div></div>' } : msg));
    }
    
    setIsThinking(true);

    void (async () => {
      let tokensUsed = 0;
      
      try {
        let csrfToken = document.cookie.split('; ').find(c => c.startsWith('csrfToken='))?.split('=').slice(1).join('=');
        if (!csrfToken) {
          try {
            await Promise.race([
              api.get('/auth/csrf', { withCredentials: true }), // Already uses baseURL with /api/v1
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
            ]);
            csrfToken = document.cookie.split('; ').find(c => c.startsWith('csrfToken='))?.split('=').slice(1).join('=');
          } catch (e) {
            console.warn('[AI] CSRF token fetch failed:', e);
          }
        }

        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);
        
        const response = await fetch('/api/v1/ai/chat', {
          method: 'POST',
          headers,
          credentials: 'include',
          signal: controller.signal,
          body: JSON.stringify({
            question: questionText,
            fileId: hasOpenFile ? (typeof fileId === 'number' ? fileId : undefined) : undefined,
            stream: true,
          }),
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          if (response.status === 429) {
            setRateLimitInfo({ remaining: 0 });
            throw new Error('Rate limit exceeded. Please try again later.');
          }
          throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
        }

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let accumulatedText = '';
          let hasReceivedAnyData = false;
          let hasFunctionResults = false;

          if (!reader) throw new Error('Streaming not supported');

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.trim() && line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  
                  if (data.type === 'chunk' && data.text) {
                    hasReceivedAnyData = true;
                    const newText = accumulatedText + data.text;
                    accumulatedText = newText;
                    
                    // Check if the accumulated text contains HTML tags
                    const hasHtmlTags = /<[a-z][\s\S]*>/i.test(newText);
                    
                    let formattedHtml: string;
                    if (hasHtmlTags) {
                      // If it contains HTML, render it directly (don't escape or process as markdown)
                      formattedHtml = newText;
                    } else {
                      // Apply markdown formatting
                      formattedHtml = boldify(newText);
                    }
                    
                    setMsgs(m => m.map(msg => {
                      if (msg.id === assistantMsgId) {
                        return { ...msg, html: formattedHtml };
                      }
                      return msg;
                    }));
                  } else if (data.type === 'function_result') {
                    hasReceivedAnyData = true;
                    hasFunctionResults = true;
                    // Handle function results - could be SVG, text, or other data
                    let resultHtml = '';
                    if (data.result?.svg) {
                      resultHtml = `<div style="margin: 12px 0;">${data.result.svg}</div>`;
                    } else if (data.result) {
                      // Format function results in a user-friendly way
                      const result = data.result;
                      let formattedText = '';
                      
                      // Handle recommendations
                      if (result.recommendations && Array.isArray(result.recommendations)) {
                        formattedText = result.recommendations.join('\n\n');
                      }
                      // Handle opportunities
                      else if (result.opportunities && Array.isArray(result.opportunities)) {
                        formattedText = result.opportunities.join('\n\n');
                      }
                      // Handle risks
                      else if (result.risks && Array.isArray(result.risks)) {
                        formattedText = result.risks.join('\n\n');
                      }
                      // Handle anomalies
                      else if (result.anomalies && Array.isArray(result.anomalies)) {
                        formattedText = result.anomalies.join('\n\n');
                      }
                      // Handle other structured data
                      else if (typeof result === 'object') {
                        // Try to extract meaningful text from the object
                        const textFields = ['text', 'message', 'content', 'description', 'summary'];
                        for (const field of textFields) {
                          if (result[field]) {
                            formattedText = String(result[field]);
                            break;
                          }
                        }
                        // If no text field found, format as readable text
                        if (!formattedText) {
                          formattedText = JSON.stringify(result, null, 2);
                        }
                      } else {
                        formattedText = String(result);
                      }
                      
                      // Check if the text contains HTML tags (like <div>, <svg>, etc.)
                      const hasHtmlTags = /<[a-z][\s\S]*>/i.test(formattedText);
                      
                      let formattedHtml: string;
                      if (hasHtmlTags) {
                        // If it contains HTML, render it directly (don't escape)
                        // But still apply markdown formatting to any text parts
                        formattedHtml = formattedText;
                      } else {
                        // Apply markdown formatting (bold, lists, etc.) to the formatted text
                        formattedHtml = boldify(formattedText);
                      }
                      
                      const isDarkMode = document.documentElement.classList.contains('dark') || 
                                        window.matchMedia('(prefers-color-scheme: dark)').matches;
                      
                      // Only wrap in styled div if it's not already HTML
                      if (hasHtmlTags) {
                        resultHtml = formattedHtml; // Use HTML directly
                      } else {
                        resultHtml = `<div style="margin: 8px 0; padding: 12px; background: ${isDarkMode ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.05)'}; border-radius: 8px;">${formattedHtml}</div>`;
                      }
                    }
                    if (resultHtml) {
                      const newText = accumulatedText + resultHtml;
                      accumulatedText = newText;
                      setMsgs(m => m.map(msg => {
                        if (msg.id === assistantMsgId) {
                          return { ...msg, html: newText };
                        }
                        return msg;
                      }));
                    }
                  } else if (data.type === 'error') {
                    throw new Error(data.message || 'Backend error');
                  } else if (data.type === 'done') {
                    const finalTokens = data.tokens || 0;
                    tokensUsed = finalTokens;
                    setTotalTokensUsed(prev => prev + finalTokens);
                  }
                } catch (e) {
                  console.warn('[AI] Failed to parse stream data:', line, e);
                }
              }
            }
          }
          
          // If we got function results but no text, that's okay - show the results
          // Only error if we got absolutely nothing
          if (accumulatedText.length === 0 && !hasReceivedAnyData) {
            throw new Error('No data received from stream. The AI may not have generated a response. Please try again.');
          }
          
          // If we have function results but no text, add a message
          if (accumulatedText.length === 0 && hasFunctionResults) {
            accumulatedText = 'I processed your request but did not generate additional text. The results are shown above.';
          }
          
          const finalTokens = tokensUsed;
          setMsgs(m => m.map(msg => {
            if (msg.id === assistantMsgId) {
              return { ...msg, html: boldify(accumulatedText || 'No response generated. Please try rephrasing your question.'), tokens: finalTokens };
            }
            return msg;
          }));
      } catch (e: any) {
        console.error('[AI] Error:', e);
        const errorMsg = e?.message || 'Network error';
        if (errorMsg.includes('Rate limit')) {
          setRateLimitInfo({ remaining: 0 });
        }
        setMsgs(m => m.map(msg => 
          msg.id === assistantMsgId 
            ? { ...msg, html: boldify(`Sorry, I couldn't get an answer right now. (${errorMsg})`) }
            : msg
        ));
      } finally {
        setIsThinking(false);
      }
    })();
  }, [input, hasOpenFile, fileId, msgs, boldify, escapeHtml]);

  const copyMessage = (text: string) => {
    const temp = document.createElement('div');
    temp.innerHTML = text;
    const plainText = temp.textContent || temp.innerText || '';
    navigator.clipboard.writeText(plainText).then(() => {
      // Show toast (simple implementation)
      const toast = document.createElement('div');
      toast.textContent = 'Copied!';
      toast.className = 'fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg z-50';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    });
  };

  const deleteMessage = (id: string) => {
    setMsgs(m => m.filter(msg => msg.id !== id));
    setShowActionsMenu(null);
  };

  const editMessage = (id: string) => {
    const msg = msgs.find(m => m.id === id);
    if (msg && msg.role === 'user' && msg.originalText) {
      setEditingMsgId(id);
      setEditText(msg.originalText);
      setShowActionsMenu(null);
    }
  };

  const saveEdit = () => {
    if (editingMsgId && editText.trim()) {
      setMsgs(m => m.map(msg => 
        msg.id === editingMsgId 
          ? { ...msg, html: boldify(escapeHtml(editText.trim())), originalText: editText.trim() }
          : msg
      ));
      setEditingMsgId(null);
      setEditText("");
    }
  };

  const toggleReaction = (id: string, reaction: 'up' | 'down') => {
    setMsgs(m => m.map(msg => 
      msg.id === id 
        ? { ...msg, reaction: msg.reaction === reaction ? null : reaction }
        : msg
    ));
  };

  const newConversation = () => {
    const newConv = { id: crypto.randomUUID(), title: 'New Conversation', msgs: [] };
    setConversations(prev => [newConv, ...prev]);
    setCurrentConversationId(newConv.id);
    setMsgs([]);
  };


  const exportChat = () => {
    const content = msgs.map(m => {
      const temp = document.createElement('div');
      temp.innerHTML = m.html;
      const text = temp.textContent || temp.innerText || '';
      return `[${m.role.toUpperCase()}] ${new Date(m.ts).toLocaleString()}\n${text}\n\n`;
    }).join('---\n\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredMessages = useMemo(() => {
    if (!searchQuery) return msgs;
    const query = searchQuery.toLowerCase();
    return msgs.filter(m => {
      const temp = document.createElement('div');
      temp.innerHTML = m.html;
      const text = (temp.textContent || temp.innerText || '').toLowerCase();
      return text.includes(query) || (m.originalText && m.originalText.toLowerCase().includes(query));
    });
  }, [msgs, searchQuery]);

  const insertFormat = (tag: string) => {
    if (!inputRef.current) return;
    const start = inputRef.current.selectionStart || 0;
    const end = inputRef.current.selectionEnd || 0;
    const selected = input.substring(start, end);
    let replacement = '';
    
    if (tag === 'bold') replacement = `**${selected || 'bold text'}**`;
    else if (tag === 'italic') replacement = `*${selected || 'italic text'}*`;
    else if (tag === 'code') replacement = `\`${selected || 'code'}\``;
    else if (tag === 'heading') replacement = `## ${selected || 'Heading'}`;
    
    setInput(input.substring(0, start) + replacement + input.substring(end));
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 0);
    setShowFormatToolbar(false);
  };

  const onFabMouseDown = (e: React.MouseEvent) => {
    dragRef.current = { startX: e.clientX, startY: e.clientY, startRight: fabPos.right, startBottom: fabPos.bottom };
    window.addEventListener('mousemove', onFabMouseMove);
    window.addEventListener('mouseup', onFabMouseUp);
  };
  const onFabMouseMove = (e: MouseEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const newRight = Math.max(12, Math.min(dragRef.current.startRight - dx, window.innerWidth * 0.4));
    const newBottom = Math.max(12, Math.min(dragRef.current.startBottom - dy, window.innerHeight * 0.5));
    setFabPos({ right: newRight, bottom: newBottom });
  };
  const onFabMouseUp = () => {
    window.removeEventListener('mousemove', onFabMouseMove);
    window.removeEventListener('mouseup', onFabMouseUp);
    dragRef.current = null;
  };

  if (!canUseAssistant) return null;

  return (
    <>
      {!isOpen && (
        <button
          className="fixed z-40 rounded-full p-4 shadow-lg select-none"
          style={{
            right: fabPos.right,
            bottom: fabPos.bottom,
            background: colors.isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.15)',
            border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}`
          }}
          onMouseDown={onFabMouseDown}
          data-tutorial="ai-assistant"
          aria-label="Open AI chat assistant"
          onClick={(e) => { e.stopPropagation(); onOpen?.(); }}
        >
          <MessageCircle className="w-6 h-6" style={{ color: colors.accent }} />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <div
            className="absolute top-20 left-3 right-3 bottom-20 mx-0 md:ml-64 pointer-events-auto"
            style={{ top: '80px', bottom: '60px' }}
          >
            <div className={`${glass} rounded-2xl h-full flex flex-col`} style={{ boxShadow: colors.cardShadow }}>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <div className="flex items-center gap-3 flex-1">
                  <GripVertical className="w-4 h-4 opacity-60" />
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${colors.text}`}>AI Chat Assistant</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      {fileName && (
                        <span className={`${colors.textSecondary} text-xs flex items-center gap-1`}>
                          <FileText className="w-3 h-3" />
                          {fileName}
                        </span>
                      )}
                      {totalTokensUsed > 0 && (
                        <span className={`${colors.textSecondary} text-xs flex items-center gap-1`}>
                          <Zap className="w-3 h-3" />
                          {totalTokensUsed.toLocaleString()} tokens
                        </span>
                      )}
                      {rateLimitInfo && rateLimitInfo.remaining === 0 && (
                        <span className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Rate limited
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowSearch(!showSearch)} className="p-2 rounded-lg hover:bg-white/5" title="Search (Ctrl+F)">
                      <Search className="w-4 h-4" style={{ color: colors.isDark ? '#fff' : '#111827' }} />
                    </button>
                    <button onClick={exportChat} className="p-2 rounded-lg hover:bg-white/5" title="Export chat">
                      <Download className="w-4 h-4" style={{ color: colors.isDark ? '#fff' : '#111827' }} />
                    </button>
                    <button onClick={newConversation} className="p-2 rounded-lg hover:bg-white/5" title="New conversation">
                      <FileText className="w-4 h-4" style={{ color: colors.isDark ? '#fff' : '#111827' }} />
                    </button>
                    <button onClick={onClose} className="rounded-full p-2 hover:opacity-80" aria-label="Close">
                      <X className="w-5 h-5" style={{ color: colors.isDark ? '#fff' : '#111827' }} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              {showSearch && (
                <div className="px-4 py-2 border-b" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4" style={{ color: colors.textSecondary }} />
                    <input
                      type="text"
                      placeholder="Search messages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`flex-1 px-3 py-2 rounded-lg border outline-none text-sm ${colors.isDark
                        ? 'bg-white/5 border-white/10 text-white'
                        : 'bg-white border-gray-200 text-gray-900'}`}
                      autoFocus
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="p-1">
                        <X className="w-4 h-4" style={{ color: colors.textSecondary }} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Suggested Questions */}
              {msgs.length === 0 && (
                <div className="px-4 py-3 border-b" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4" style={{ color: colors.accent }} />
                    <span className={`text-sm font-semibold ${colors.text}`}>Suggested Questions</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.slice(0, 4).map((q, i) => (
                      <button
                        key={i}
                        onClick={() => { setInput(q); inputRef.current?.focus(); }}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${colors.isDark
                          ? 'bg-white/5 border-white/10 hover:bg-white/10'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                        style={{ color: colors.text }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              <div 
                ref={listRef} 
                className="chat-assistant-scrollable flex-1 overflow-y-auto px-0 py-10 space-y-3"
                style={{
                  paddingRight: '8px',
                  // Firefox scrollbar
                  scrollbarWidth: 'thin',
                  scrollbarColor: colors.isDark 
                    ? 'rgba(59, 130, 246, 0.6) rgba(11, 27, 59, 0.3)' 
                    : 'rgba(59, 130, 246, 0.4) rgba(229, 231, 235, 0.3)',
                }}
                onScroll={(e) => {
                  const target = e.target as HTMLDivElement;
                  const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 50;
                  if (isAtBottom !== autoScroll) setAutoScroll(isAtBottom);
                }}
              >
                {filteredMessages.map(m => (
                  <div 
                    key={m.id} 
                    className={`flex ${m.role === 'user' ? 'justify-end mx-40' : 'justify-start mx-40'} group`}
                    onMouseEnter={() => setHoveredMsgId(m.id)}
                    onMouseLeave={() => setHoveredMsgId(null)}
                  >
                    <div className="max-w-3xl relative">
                      {editingMsgId === m.id ? (
                        <div className={`px-3 py-2 rounded-xl ${colors.isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') { setEditingMsgId(null); setEditText(""); } }}
                            className={`w-full px-2 py-1 rounded border outline-none ${colors.isDark
                              ? 'bg-white/10 border-white/20 text-white'
                              : 'bg-white border-gray-300 text-gray-900'}`}
                            autoFocus
                          />
                          <div className="flex items-center gap-2 mt-2">
                            <button onClick={saveEdit} className="p-1.5 rounded hover:bg-white/10">
                              <Check className="w-4 h-4" style={{ color: colors.accent }} />
                            </button>
                            <button onClick={() => { setEditingMsgId(null); setEditText(""); }} className="p-1.5 rounded hover:bg-white/10">
                              <X className="w-4 h-4" style={{ color: colors.textSecondary }} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div
                            className={`inline-block px-3 py-2 rounded-xl ${m.role === 'user'
                              ? (colors.isDark ? 'bg-blue-500/20' : 'bg-blue-500/10')
                              : (colors.isDark ? 'bg-white/5' : 'bg-gray-50/0')}`}
                            style={{ border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.00)'}` }}
                            dangerouslySetInnerHTML={{ __html: m.html }}
                          />
                          <div className={`flex items-center gap-1 mt-1 ${m.role === 'user' ? 'justify-end' : 'justify-start'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                            <span className={`text-xs ${colors.textSecondary}`}>{formatTime(m.ts)}</span>
                            {m.tokens && (
                              <span className={`text-xs ${colors.textSecondary}`}>• {m.tokens.toLocaleString()} tokens</span>
                            )}
                          </div>
                        </>
                      )}
                      
                      {/* Message Actions */}
                      {hoveredMsgId === m.id && !editingMsgId && (
                        <div className={`absolute ${m.role === 'user' ? 'right-0' : 'left-0'} -top-8 flex items-center gap-1 bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1`}>
                          {m.role === 'assistant' && (
                            <>
                              <button onClick={() => handleSend(msgs.findIndex(msg => msg.id === m.id) > 0 ? msgs[msgs.findIndex(msg => msg.id === m.id) - 1]?.id : undefined)} className="p-1 hover:bg-white/10 rounded" title="Regenerate">
                                <RotateCcw className="w-3.5 h-3.5 text-white" />
                              </button>
                              <button onClick={() => toggleReaction(m.id, 'up')} className={`p-1 hover:bg-white/10 rounded ${m.reaction === 'up' ? 'bg-white/20' : ''}`} title="Helpful">
                                <ThumbsUp className={`w-3.5 h-3.5 ${m.reaction === 'up' ? 'text-green-400' : 'text-white'}`} />
                              </button>
                              <button onClick={() => toggleReaction(m.id, 'down')} className={`p-1 hover:bg-white/10 rounded ${m.reaction === 'down' ? 'bg-white/20' : ''}`} title="Not helpful">
                                <ThumbsDown className={`w-3.5 h-3.5 ${m.reaction === 'down' ? 'text-red-400' : 'text-white'}`} />
                              </button>
                            </>
                          )}
                          <button onClick={() => copyMessage(m.html)} className="p-1 hover:bg-white/10 rounded" title="Copy">
                            <Copy className="w-3.5 h-3.5 text-white" />
                          </button>
                          {m.role === 'user' && (
                            <>
                              <button onClick={() => editMessage(m.id)} className="p-1 hover:bg-white/10 rounded" title="Edit">
                                <Edit2 className="w-3.5 h-3.5 text-white" />
                              </button>
                              <button onClick={() => deleteMessage(m.id)} className="p-1 hover:bg-white/10 rounded" title="Delete">
                                <Trash2 className="w-3.5 h-3.5 text-white" />
                              </button>
                            </>
                          )}
                          <button onClick={() => setShowActionsMenu(showActionsMenu === m.id ? null : m.id)} className="p-1 hover:bg-white/10 rounded" title="More">
                            <MoreVertical className="w-3.5 h-3.5 text-white" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {!autoScroll && (
                  <button
                    onClick={() => {
                      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
                      setAutoScroll(true);
                    }}
                    className="fixed bottom-24 right-1/2 transform translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-10"
                  >
                    <ChevronDown className="w-4 h-4" />
                    Scroll to bottom
                  </button>
                )}
              </div>

              {/* Input Area */}
              <div className="px-40 pb-3 pt-2 border-t" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                {/* Format Toolbar */}
                {showFormatToolbar && (
                  <div className={`flex items-center gap-1 mb-2 p-2 rounded-lg ${colors.isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <button onClick={() => insertFormat('bold')} className="p-1.5 rounded hover:bg-white/10" title="Bold">
                      <Bold className="w-4 h-4" style={{ color: colors.text }} />
                    </button>
                    <button onClick={() => insertFormat('italic')} className="p-1.5 rounded hover:bg-white/10" title="Italic">
                      <Italic className="w-4 h-4" style={{ color: colors.text }} />
                    </button>
                    <button onClick={() => insertFormat('code')} className="p-1.5 rounded hover:bg-white/10" title="Code">
                      <Code className="w-4 h-4" style={{ color: colors.text }} />
                    </button>
                    <button onClick={() => insertFormat('heading')} className="p-1.5 rounded hover:bg-white/10" title="Heading">
                      <Hash className="w-4 h-4" style={{ color: colors.text }} />
                    </button>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowFormatToolbar(!showFormatToolbar)}
                    className={`p-2 rounded-lg ${showFormatToolbar ? 'bg-blue-500/20' : 'hover:bg-white/5'}`}
                    title="Formatting"
                  >
                    <Bold className="w-4 h-4" style={{ color: colors.textSecondary }} />
                  </button>
                  <input
                    ref={inputRef}
                    className={`flex-1 px-4 py-3 rounded-xl border outline-none ${colors.isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-gray-400'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'}`}
                    placeholder={hasOpenFile ? "Ask about this data... (Ctrl+Enter to send, Ctrl+K to focus)" : "Select a file or ask a general question..."}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { 
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={isThinking || !input.trim()}
                    className={`rounded-xl px-4 py-3 text-white font-semibold flex items-center gap-2 ${isThinking || !input.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{ background: colors.accent }}
                    aria-label="Send"
                  >
                    {isThinking ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Thinking...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send
                      </>
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2 opacity-80 text-xs">
                  <span className={colors.textSecondary}>
                    {hasOpenFile ? "Ask about your data, generate charts, or get recommendations" : "Ask general e-commerce questions or calculations"}
                  </span>
                  <span className={colors.textSecondary}>Ctrl+Enter to send • Esc to close</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatAssistant;