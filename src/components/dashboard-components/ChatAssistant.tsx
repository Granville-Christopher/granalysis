import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, X, Send, GripVertical, PieChart, LineChart } from "lucide-react";
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

type ChatMsg = { id: string; role: 'user' | 'assistant'; html: string; ts: number };

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
  // Convert ArrayBuffer to base64 without spread for compat
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
  // Uint8Array to base64 without spread for compat
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
  const [fabPos, setFabPos] = useState<{ right: number; bottom: number }>({ right: 24, bottom: 24 });
  const dragRef = useRef<{ startX: number; startY: number; startRight: number; startBottom: number } | null>(null);

  const canUseAssistant = userTier === 'business' || userTier === 'enterprise';

  // Chat state
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const userKey = String(userId ?? 'anon');

  useEffect(() => {
    // load encrypted history
    const load = async () => {
      const enc = localStorage.getItem(`chat_hist_${userKey}`);
      if (enc) {
        const data = await decryptForUser(userKey, enc);
        if (Array.isArray(data)) setMsgs(data);
      }
    };
    load();
  }, [userKey]);

  useEffect(() => {
    const save = async () => {
      const enc = await encryptForUser(userKey, msgs);
      localStorage.setItem(`chat_hist_${userKey}`, enc);
    };
    if (msgs.length) save();
  }, [msgs, userKey]);

  useEffect(() => {
    // autoscroll
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, isOpen]);

  const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  const boldify = (s: string) => {
    let t = escapeHtml(s);
    t = t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    t = t.replace(/\*(.+?)\*/g, "<strong>$1</strong>");
    return t;
  };

  const generateLineChartSvg = (points: TrendPoint[], label: string): string => {
    if (!points || points.length === 0) return '';
    const width = 360, height = 140, pad = 24;
    const values = points.map(p => Number(p.value) || 0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const stepX = (width - pad * 2) / Math.max(points.length - 1, 1);
    const toX = (i: number) => pad + i * stepX;
    const toY = (v: number) => pad + (height - pad * 2) * (1 - (v - min) / range);
    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(Number(p.value)).toFixed(1)}`).join(' ');
    const yTicks = 4;
    const ticks = Array.from({ length: yTicks + 1 }, (_, i) => min + (range * i) / yTicks);
    const tickLines = ticks.map((tv, i) => {
      const y = toY(tv);
      return `<line x1="${pad}" x2="${width - pad}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="rgba(128,128,128,0.25)" stroke-width="1"/>`;
    }).join('');
    const tickLabels = ticks.map((tv, i) => {
      const y = toY(tv);
      return `<text x="${pad - 6}" y="${(y + 4).toFixed(1)}" font-size="10" text-anchor="end" fill="currentColor">$${Math.round(tv).toLocaleString()}</text>`;
    }).join('');
    return `
<div style="display:inline-block;background:${isDark ? 'rgba(255,255,255,0.03)' : '#fff'};border:1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};border-radius:12px;padding:8px;">
  <div style="font-weight:600;margin-bottom:6px;color:currentColor">${escapeHtml(label)}</div>
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="color:${isDark ? '#e5e7eb' : '#111827'}">
    <rect x="0" y="0" width="${width}" height="${height}" fill="none"/>
    ${tickLines}
    ${tickLabels}
    <path d="${path}" fill="none" stroke="${isDark ? '#60a5fa' : '#2563eb'}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</div>`;
  };

  const answerFromInsights = useCallback((q: string): { html: string } | null => {
    if (!fileInsights) return null;
    const ql = q.toLowerCase();
    const wantChart = /(chart|plot|graph|visual|visualize)/i.test(q);
    const wantAllCharts = /(all charts|every chart|both charts|all graph|show all)/i.test(q);
    // Highest month sales
    if (ql.includes('highest') && (ql.includes('month') || ql.includes('day')) && (ql.includes('sale') || ql.includes('revenue'))) {
      const trend = (fileInsights.sales_trend ?? []).filter(p => typeof p.value === 'number');
      if (trend.length > 0) {
        const best = trend.reduce((a, b) => (b.value > a.value ? b : a));
        const base = boldify(`Best period by sales is **${best.label}** with **$${best.value.toLocaleString()}**.`);
        if (wantChart) {
          const svg = generateLineChartSvg(trend, 'Sales Trend');
          return { html: `${base}<div style="height:8px"></div>${svg}` };
        }
        return { html: base };
      }
    }
    // Total KPIs
    if (ql.includes('total sales')) {
      const v = fileInsights.total_sales ?? 0;
      return { html: boldify(`Total sales: **$${Number(v).toLocaleString()}**.`) };
    }
    if (ql.includes('total orders') || ql.includes('orders')) {
      const v = fileInsights.total_orders ?? 0;
      return { html: boldify(`Total orders: **${Number(v).toLocaleString()}**.`) };
    }
    if (ql.includes('total profit') || ql.includes('profit in this')) {
      const v = fileInsights.total_profit ?? 0;
      return { html: boldify(`Total profit: **$${Number(v).toLocaleString()}**.`) };
    }
    // Top product
    if (ql.includes('top product') || ql.includes('best product')) {
      const name = fileInsights?.top_3?.[0]?.product_name || fileInsights?.top_3?.[0]?.product;
      if (name) return { html: boldify(`Top product: **${name}**.`) };
    }
    // Chart requests
    if (wantAllCharts) {
      const charts: string[] = [];
      const sales = (fileInsights.sales_trend ?? []).filter(p => typeof p.value === 'number');
      if (sales.length > 1) charts.push(generateLineChartSvg(sales, 'Sales Trend'));
      const profit = (fileInsights.daily_profit_trend ?? []).filter(p => typeof p.value === 'number');
      if (profit.length > 1) charts.push(generateLineChartSvg(profit, 'Profit Trend'));
      if (charts.length > 0) {
        return { html: `${boldify('Here are the available charts:')}<div style="height:8px"></div>${charts.join('<div style="height:8px"></div>')}` };
      }
    } else if (wantChart) {
      const trend = (fileInsights.sales_trend ?? fileInsights.forecast_trend ?? []).filter(p => typeof p.value === 'number');
      if (trend.length > 1) {
        const svg = generateLineChartSvg(trend, 'Sales Trend');
        return { html: `${boldify('Here is the chart you requested:')}<div style="height:8px"></div>${svg}` };
      }
    }
    return null;
  }, [fileInsights]);

  const generalAnswer = useCallback((q: string): string => {
    const ql = q.toLowerCase();
    if (ql.includes('what is') && (ql.includes('platform') || ql.includes('granalysis'))) {
      return boldify("Granalysis helps businesses turn raw data into actionable insights with AI-powered analytics, forecasts, and recommendations.");
    }
    if (ql.includes('mean') && (ql.includes('formula') || ql.includes('how'))) {
      return boldify("Mean (average) formula: **mean = (x₁ + x₂ + ... + xₙ) / n**.");
    }
    if (ql.includes('how to') && (ql.includes('upload') || ql.includes('file'))) {
      return boldify("Go to the dashboard and click Upload. Supported: CSV/Excel. You’ll see insights generated automatically.");
    }
    // Fallback
    return boldify("Here’s what I can do: answer questions about your uploaded data (sales, orders, trends), generate quick charts, and advise on common e-commerce questions.");
  }, []);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    const userMsg: ChatMsg = { id: crypto.randomUUID(), role: 'user', html: boldify(escapeHtml(text)), ts: Date.now() };
    setMsgs(m => [...m, userMsg]);
    setInput("");

    setTimeout(async () => {
      // Always call backend AI (Gemini) for answers
      try {
        const res = await fetch('/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ question: text, fileId: hasOpenFile ? (typeof fileId === 'number' ? fileId : undefined) : undefined }),
        });
        if (res.ok) {
          const data = await res.json();
          const html = boldify(data?.answer || '');
          setMsgs(m => [...m, { id: crypto.randomUUID(), role: 'assistant', html, ts: Date.now() }]);
          return;
        }
        const textErr = await res.text();
        const html = boldify(`Sorry, I couldn't get an answer right now. (${textErr || 'AI error'})`);
        setMsgs(m => [...m, { id: crypto.randomUUID(), role: 'assistant', html, ts: Date.now() }]);
      } catch (e: any) {
        const html = boldify(`Sorry, I couldn't get an answer right now. (${e?.message || 'Network error'})`);
        setMsgs(m => [...m, { id: crypto.randomUUID(), role: 'assistant', html, ts: Date.now() }]);
      }
    }, 300);
  }, [input, hasOpenFile, fileId]);

  // Draggable FAB handlers
  const onFabMouseDown = (e: React.MouseEvent) => {
    dragRef.current = { startX: e.clientX, startY: e.clientY, startRight: fabPos.right, startBottom: fabPos.bottom };
    window.addEventListener('mousemove', onFabMouseMove);
    window.addEventListener('mouseup', onFabMouseUp);
  };
  const onFabMouseMove = (e: MouseEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    // Move within right corner quadrant (limit to 0..40% width, 0..50% height from bottom-right)
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
      {/* Floating FAB */}
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
          onClick={(e) => { e.stopPropagation(); onOpen?.(); }}
          aria-label="Open AI Assistant"
          onDoubleClick={(e) => { e.stopPropagation(); }}
        >
          <MessageCircle className="w-6 h-6" style={{ color: colors.accent }} />
        </button>
      )}

      {/* Overlay panel - covers insights section area, keep header/sidebar outside in dashboard layout */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 pointer-events-none"
          style={{}}
        >
          <div
            className="absolute top-16 left-0 right-0 bottom-12 md:bottom-6 mx-0 md:ml-64 pointer-events-auto"
          >
            <div className={`${glass} rounded-2xl h-full flex flex-col`} style={{ boxShadow: colors.cardShadow }}>
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 opacity-60" />
                  <h3 className={`text-lg font-semibold ${colors.text}`}>AI Chat Assistant</h3>
                  <span className={`${colors.textSecondary} text-xs ml-2`}>{fileName ? `File: ${fileName}` : 'No file selected'}</span>
                </div>
                <button onClick={onClose} className="rounded-full p-2 hover:opacity-80" aria-label="Close">
                  <X className="w-5 h-5" style={{ color: colors.isDark ? '#fff' : '#111827' }} />
                </button>
              </div>
              <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {msgs.map(m => (
                  <div key={m.id} className="max-w-3xl">
                    <div
                      className={`inline-block px-3 py-2 rounded-xl ${m.role === 'user'
                        ? (colors.isDark ? 'bg-blue-500/20' : 'bg-blue-500/10')
                        : (colors.isDark ? 'bg-white/5' : 'bg-gray-50')}`}
                      style={{ border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}
                      dangerouslySetInnerHTML={{ __html: m.html }}
                    />
                  </div>
                ))}
              </div>
              <div className="px-3 pb-3 pt-2 border-t" style={{ borderColor: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <div className="flex items-center gap-2">
                  <input
                    className={`flex-1 px-4 py-3 rounded-xl border outline-none ${colors.isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-gray-400'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'}`}
                    placeholder={hasOpenFile ? "Ask about this data, e.g., 'show highest sales month'..." : "Select a file or ask a general question..."}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                  />
                  <button
                    onClick={handleSend}
                    className="rounded-xl px-4 py-3 text-white font-semibold"
                    style={{ background: colors.accent }}
                    aria-label="Send"
                  >
                    <Send className="w-4 h-4 inline-block mr-1" /> Send
                  </button>
                </div>
                <div className="flex items-center gap-4 mt-2 opacity-80 text-xs">
                  <span className={colors.textSecondary}>Tips: ask “highest month sales”, “top product”, “total orders”.</span>
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


