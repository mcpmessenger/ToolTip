import React, { useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

type PageAction = {
  label: string;
  type: 'link' | 'button';
  href?: string;
  selector: string;
};

// UUID helper function for browser compatibility
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for browsers without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const mockReply = (input: string): string => {
  if (!input.trim()) return "Tell me about what you're browsing, and I'll emulate the assistant.";
  return `Demo assistant: I would analyze the page and respond about "${input}". Install the extension for the full experience.`;
};

export const TooltipBotWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [actions, setActions] = useState<PageAction[]>([]);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dragFromToggle, setDragFromToggle] = useState(false);
  const dragOffset = useRef<{x:number;y:number}>({x:0,y:0});
  const [pos, setPos] = useState<{x:number;y:number}>({ x: window.innerWidth - 76, y: window.innerHeight - 96 });
  const dragMoved = useRef(false);
  const [containerWidth, setContainerWidth] = useState<number>(Math.min(360, window.innerWidth - 16));

  const clampToViewport = () => {
    if (!widgetRef.current) return;
    const rect = widgetRef.current.getBoundingClientRect();
    const margin = 8;
    let newX = pos.x;
    let newY = pos.y;
    const maxX = window.innerWidth - rect.width - margin;
    if (newX > maxX) newX = Math.max(margin, maxX);
    if (newX < margin) newX = margin;
    const maxY = window.innerHeight - rect.height - margin;
    if (newY > maxY) newY = Math.max(margin, maxY);
    if (newY < margin) newY = margin;
    if (newX !== pos.x || newY !== pos.y) {
      setPos({ x: newX, y: newY });
    }
  };

  const scanPageActions = () => {
    const result: PageAction[] = [];
    const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'));
    anchors.forEach((a, idx) => {
      const text = (a.innerText || a.getAttribute('aria-label') || a.title || a.href || '').trim();
      if (!text) return;
      result.push({ label: text.slice(0, 80), type: 'link', href: a.href, selector: `a[href]:nth(${idx})` });
    });
    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('button'));
    buttons.forEach((b, idx) => {
      const text = (b.innerText || b.getAttribute('aria-label') || b.title || b.name || 'Button').trim();
      result.push({ label: text.slice(0, 80), type: 'button', selector: `button:nth(${idx})` });
    });
    setActions(result.slice(0, 50));
    return result;
  };

  const summarizePage = () => {
    const title = document.title || '';
    const meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const description = meta?.content || '';
    const h1 = Array.from(document.querySelectorAll('h1')).map(h => h.textContent?.trim()).filter(Boolean).join(' • ');
    const h2 = Array.from(document.querySelectorAll('h2')).map(h => h.textContent?.trim()).filter(Boolean).slice(0, 5).join(' • ');
    const parts = [title && `Title: ${title}`, description && `Description: ${description}`, h1 && `H1: ${h1}`, h2 && `H2: ${h2}`].filter(Boolean);
    return parts.join('\n');
  };

  const bestActionForQuery = (q: string) => {
    const query = q.toLowerCase();
    let best: {score: number; action: PageAction} | null = null;
    actions.forEach(a => {
      const label = a.label.toLowerCase();
      let score = 0;
      if (label.includes(query)) score += 5;
      score += Math.min(3, Math.floor(query.split(/\s+/).filter(w => w && label.includes(w)).length));
      if (!best || score > best.score) best = { score, action: a };
    });
    return best?.score && best.score >= 2 ? best.action : null;
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || busy) return;
    const userMsg: ChatMessage = { id: generateUUID(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setBusy(true);
    // Local smart behavior
    let reply = '';
    const lowerText = text.toLowerCase();
    
    // Check for installation-related queries
    if (/install|setup|get started|how to use|download/i.test(text) && /extension|tooltip|companion/i.test(text)) {
      reply = `📎 **How to Install ToolTip Companion Extension:**

**Step 1: Download the Extension**
- Visit the GitHub repository: https://github.com/mcpmessenger/Tooltip-Companion-Chrome-Extension
- Click the green "Code" button
- Select "Download ZIP" or clone the repository

**Step 2: Extract the Files**
- Unzip the downloaded file (if you downloaded as ZIP)
- Remember where you saved the extension folder

**Step 3: Load Extension in Chrome**
1. Open Chrome and navigate to \`chrome://extensions/\`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the extension folder you downloaded

**Step 4: Configure Backend (Optional)**
- Right-click the extension icon
- Select **Options**
- Enter your backend URL (default: http://localhost:3000)
- Optionally add your OpenAI API key for AI features

**Step 5: Start Using!**
- Visit any website
- Hover over links to see previews
- Click the clippy icon to open the AI chat assistant

Need help with backend setup? Check the GitHub repository for detailed instructions.`;
    } else if (/^\s*(summarize|explain)\b/i.test(text)) {
      reply = summarizePage() || 'No summary info available.';
    } else if (/^\s*(detect|scan)\b/i.test(text)) {
      const list = scanPageActions();
      reply = list.length ? `Detected ${list.length} actions. Examples:\n` + list.slice(0, 8).map(a => `- ${a.type === 'link' ? 'Link' : 'Button'}: ${a.label}${a.href ? ` → ${a.href}` : ''}`).join('\n') : 'No actions detected.';
    } else {
      const a = bestActionForQuery(text);
      if (a) {
        reply = a.type === 'link'
          ? `That looks like a link: "${a.label}". Clicking would navigate to: ${a.href}`
          : `That looks like a button: "${a.label}". Clicking would trigger a page action.`;
      } else {
        reply = mockReply(text);
      }
    }
    setTimeout(() => {
      setMessages(prev => [...prev, { id: generateUUID(), role: 'assistant', content: reply }]);
      setBusy(false);
    }, 400);
  };

  // Drag support (header and toggle)
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      dragMoved.current = true;
      const x = Math.max(0, Math.min(window.innerWidth - 60, e.clientX - dragOffset.current.x));
      const y = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragOffset.current.y));
      setPos({ x, y });
    };
    const onMouseUp = () => {
      if (dragging) {
        const wasToggle = dragFromToggle;
        const moved = dragMoved.current;
        setDragging(false);
        setDragFromToggle(false);
        // If mouse down started on toggle and mouse didn't move meaningfully, treat as click to open
        if (wasToggle && !moved) {
          setOpen(true);
        }
      }
      dragMoved.current = false;
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging]);

  // Ensure widget opens fully visible (especially on mobile) and stays clamped on resize
  useLayoutEffect(() => {
    if (open) {
      clampToViewport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, containerWidth]);

  useEffect(() => {
    const onResize = () => {
      setContainerWidth(Math.min(360, window.innerWidth - 16));
      if (open) clampToViewport();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const startDragFromToggle = (e: React.MouseEvent) => {
    if (!toggleRef.current) return;
    const rect = toggleRef.current.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setDragFromToggle(true);
    setDragging(true);
    dragMoved.current = false;
  };

  const startDragFromHeader = (e: React.MouseEvent) => {
    if (!widgetRef.current) return;
    const rect = widgetRef.current.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setDragFromToggle(false);
    setDragging(true);
  };

  const isDark = theme === 'dark';
  const containerClasses = isDark
    ? 'w-[360px] max-h-[72vh] flex flex-col rounded-2xl bg-gray-900 border border-gray-700 shadow-2xl text-gray-200 overflow-hidden'
    : 'w-[360px] max-h-[72vh] flex flex-col rounded-2xl bg-white border border-gray-200 shadow-2xl text-gray-900 overflow-hidden';
  const headerClasses = isDark
    ? 'flex items-center justify-between px-4 py-3 border-b border-gray-700 cursor-move select-none bg-gray-800 rounded-t-2xl'
    : 'flex items-center justify-between px-4 py-3 border-b border-gray-200 cursor-move select-none bg-white rounded-t-2xl';
  const cameraBtnClasses = isDark
    ? 'w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-white transition-colors'
    : 'w-10 h-10 rounded-full bg-purple-200 hover:bg-purple-300 flex items-center justify-center text-purple-700 transition-colors';
  const sendBtnClasses = isDark
    ? 'w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-white transition-colors disabled:opacity-50'
    : 'w-10 h-10 rounded-full bg-purple-200 hover:bg-purple-300 flex items-center justify-center text-purple-700 transition-colors disabled:opacity-50';
  const inputClasses = isDark
    ? 'flex-1 bg-gray-800 border-0 rounded-full px-4 py-2 text-sm focus:outline-none text-gray-100 placeholder:text-gray-500'
    : 'flex-1 bg-gray-100 border-0 rounded-full px-4 py-2 text-sm focus:outline-none text-gray-900 placeholder:text-gray-500';

  return (
    <div className="fixed z-[60]" style={{ left: pos.x, top: pos.y, fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif' }}>
      {!open && (
        <button
          ref={toggleRef}
          onMouseDown={startDragFromToggle}
          className="focus:outline-none"
          aria-label="Open ToolTip Assistant"
          style={{
            width: 56,
            height: 56,
            borderRadius: 0,
            background: `transparent url('/glippy.png') center/contain no-repeat`,
            border: 'none',
            boxShadow: 'none',
            backgroundColor: 'transparent'
          }}
        />
      )}
      {open && (
        <div ref={(el) => { containerRef.current = el; widgetRef.current = el; }} className={containerClasses} style={{ width: containerWidth }}>
          <div className={headerClasses} onMouseDown={startDragFromHeader}>
            <div className="flex items-center gap-2 font-semibold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              Tooltip Companion
            </div>
            <div className="flex items-center gap-2">
              <button
                title="Toggle theme"
                onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                className={isDark ? 'text-yellow-500 hover:text-yellow-400' : 'text-gray-600 hover:text-gray-900'}
              >
                {isDark ? '☀️' : '🌙'}
              </button>
              <button onClick={() => setOpen(false)} className={isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-800'}>✕</button>
            </div>
          </div>
          <div className={`flex-1 overflow-auto p-3 space-y-2 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
            {messages.length === 0 && (
              <div className={isDark ? 'text-sm text-gray-400' : 'text-sm text-gray-500'}>
                Ask something like: "What does this button do?" or "Summarize this page".
              </div>
            )}
            {messages.map(m => (
              <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <div className={'inline-block rounded-lg px-3 py-2 text-sm ' + (m.role === 'user' ? 'bg-blue-600 text-white' : (isDark ? 'bg-gray-900 text-gray-200 border border-gray-800' : 'bg-gray-100 text-gray-900 border border-gray-200'))}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>
          <div className={isDark ? 'p-3 border-t border-gray-700 flex items-center gap-2 bg-gray-900 rounded-b-2xl' : 'p-3 border-t border-gray-200 flex items-center gap-2 bg-white rounded-b-2xl'}>
            <button
              title="Attach image"
              className={cameraBtnClasses}
              onClick={() => {
                const ocrMessage = `✨ **What the ToolTip Companion Chrome Extension Delivers**

**Highlighted benefits**
• Instant, trustworthy link previews before you click  
• AI-powered summaries and follow-up actions in context  
• Smart screenshot capture with built-in OCR—no setup required  
• Privacy-first: processing runs through our managed backend

**How it works**
1. Hover over a link to trigger a live preview overlay  
2. Ask follow-up questions or request a summary right inside the tooltip  
3. Capture and translate on-page visuals with one click  
4. Save time by acting on insights without leaving the tab

Ready to try it? 👉 [Download the Chrome extension](https://chromewebstore.google.com/detail/behmdnonpdlamifmfpdmhgcgcljfiooj).`;
                setMessages(prev => [...prev, { id: generateUUID(), role: 'assistant', content: ocrMessage }]);
              }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 00-1 1v14a1 1 0 001 1h16a1 1 0 001-1V5a1 1 0 00-1-1h-3.382l-.724-1.447A1 1 0 0015 2H9zM12 8a4 4 0 100 8 4 4 0 000-8zm0 2a2 2 0 110 4 2 2 0 010-4zm-5 5a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
            </button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              placeholder={busy ? 'Thinking…' : 'Type a message...'}
              disabled={busy}
              className={inputClasses}
            />
            <button
              onClick={handleSend}
              disabled={busy || !input.trim()}
              className={sendBtnClasses}
              title="Send message"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TooltipBotWidget;


