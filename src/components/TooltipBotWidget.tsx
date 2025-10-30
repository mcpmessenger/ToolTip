import React, { useEffect, useMemo, useRef, useState } from 'react';

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

const mockReply = (input: string): string => {
  if (!input.trim()) return "Tell me about what you're browsing, and I'll emulate the assistant.";
  return `Demo assistant: I would analyze the page and respond about "${input}". Install the extension for the full experience.`;
};

export const TooltipBotWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
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
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setBusy(true);
    // Local smart behavior
    let reply = '';
    if (/^\s*(summarize|explain)\b/i.test(text)) {
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
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: reply }]);
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
    ? 'w-[360px] max-h-[72vh] flex flex-col rounded-xl bg-gray-950/90 border border-gray-800 shadow-2xl backdrop-blur text-gray-200'
    : 'w-[360px] max-h-[72vh] flex flex-col rounded-xl bg-white border border-gray-200 shadow-2xl text-gray-900';
  const headerClasses = isDark
    ? 'flex items-center justify-between px-4 py-3 border-b border-gray-800 cursor-move select-none'
    : 'flex items-center justify-between px-4 py-3 border-b border-gray-200 cursor-move select-none bg-white';
  const toolbarBtn = isDark
    ? 'text-xs px-2 py-1 rounded-md border border-gray-700 hover:bg-gray-900'
    : 'text-xs px-2 py-1 rounded-md border border-gray-300 hover:bg-gray-100';
  const inputClasses = isDark
    ? 'flex-1 bg-gray-900 border border-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-600 text-gray-100 placeholder:text-gray-400'
    : 'flex-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-900 placeholder:text-gray-500';

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
        <div ref={(el) => { containerRef.current = el; widgetRef.current = el; }} className={containerClasses}>
          <div className={headerClasses} onMouseDown={startDragFromHeader}>
            <div className="flex items-center gap-2 font-semibold">
              <img src="/glippy.png" alt="Glippy" className="w-6 h-6 rounded" />
              ToolTip Assistant (Demo)
            </div>
            <div className="flex items-center gap-2">
              <button
                title="Toggle theme"
                onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                className={isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}
              >
                {isDark ? '🌙' : '☀️'}
              </button>
              <button onClick={() => setOpen(false)} className={isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-800'}>✕</button>
            </div>
          </div>
          <div className={isDark ? 'px-3 py-2 border-b border-gray-800 flex items-center gap-2 flex-wrap' : 'px-3 py-2 border-b border-gray-200 flex items-center gap-2 flex-wrap bg-white'}>
            <button onClick={() => {
              const list = scanPageActions();
              const text = list.length ? `Detected ${list.length} actions. Top examples:\n` + list.slice(0, 8).map(a => `- ${a.type === 'link' ? 'Link' : 'Button'}: ${a.label}${a.href ? ` → ${a.href}` : ''}`).join('\n') : 'No actions detected.';
              setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: text }]);
            }} className={toolbarBtn}>Detect Actions</button>
            <button onClick={() => {
              const text = summarizePage() || 'No summary info available.';
              setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: text }]);
            }} className={toolbarBtn}>Summarize Page</button>
            <button onClick={() => setMessages([])} className={toolbarBtn}>Clear</button>
          </div>
          <div className="flex-1 overflow-auto p-3 space-y-2">
            {messages.length === 0 && (
              <div className={isDark ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}>
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
          <div className={isDark ? 'p-3 border-t border-gray-800 flex items-center gap-2' : 'p-3 border-t border-gray-200 flex items-center gap-2 bg-white'}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              placeholder={busy ? 'Thinking…' : 'Type a message'}
              disabled={busy}
              className={inputClasses}
            />
            <button
              onClick={handleSend}
              disabled={busy}
              className={isDark ? 'rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-3 py-2 text-sm text-white' : 'rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-3 py-2 text-sm text-white'}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TooltipBotWidget;


