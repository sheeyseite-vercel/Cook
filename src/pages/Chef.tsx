import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Send, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Msg {
  role: 'user' | 'assistant';
  text: string;
}

const QUICK = ['اقترح عشاء سريعاً', 'ما بديل الكريمة؟', 'كيف أنضّج اللحم بسرعة؟', 'وصفة بدون غلوتين'];

export default function Chef() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'assistant', text: 'أهلاً بك! أنا شيفك الذكي. أخبرني بما لديك في المطبخ أو اسألني أي سؤال عن الطبخ.' },
  ]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, busy]);

  const send = async (raw: string) => {
    const t = raw.trim();
    if (!t || busy) return;
    const next: Msg[] = [...msgs, { role: 'user', text: t }];
    setMsgs(next);
    setText('');
    setBusy(true);
    try {
      // في تطبيق الهاتف يجب أن يكون العنوان كاملاً (VITE_API_BASE)، وعلى الويب يكفي المسار النسبي
      const base = (import.meta.env.VITE_API_BASE as string | undefined) ?? '';
      const res = await fetch(`${base}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, content: m.text })) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'تعذّر الحصول على رد');
      setMsgs([...next, { role: 'assistant', text: data.text }]);
    } catch (e) {
      setMsgs([...next, { role: 'assistant', text: (e as Error).message || 'حدث خطأ. حاول مرة أخرى.' }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex h-dvh flex-col bg-cream">
      <div className="flex items-center justify-between border-b border-line px-5 pb-3.5 pt-6">
        <Link to="/" aria-label="رجوع" className="flex h-11 w-11 items-center justify-center rounded-full border border-[#F0DFCC] bg-white">
          <ArrowRight size={20} />
        </Link>
        <div className="flex items-center gap-2.5">
          <span className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-basil">
            <Sparkles size={22} className="fill-white text-white" />
          </span>
          <div className="flex flex-col leading-snug">
            <span className="text-[17px] font-extrabold">الشيف الذكي</span>
            <span className="flex items-center gap-1.5 text-xs text-muted">
              <span className="h-2 w-2 rounded-full bg-basil" />
              جاهز للمساعدة
            </span>
          </div>
        </div>
        <span className="w-11" />
      </div>

      <div className="flex flex-1 flex-col gap-3.5 overflow-y-auto px-5 py-4">
        {msgs.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`max-w-[86%] whitespace-pre-wrap px-4 py-3 text-[15px] leading-7 ${
              m.role === 'user'
                ? 'self-end rounded-[6px_20px_20px_20px] bg-tomato text-white'
                : 'self-start rounded-[20px_6px_20px_20px] border border-line bg-white'
            }`}
          >
            {m.text}
          </motion.div>
        ))}
        {busy && (
          <div className="flex h-[46px] items-center gap-1.5 self-start rounded-[20px_6px_20px_20px] border border-line bg-white px-[18px]" aria-label="الشيف يكتب">
            {[0, 1, 2].map((d) => (
              <motion.span
                key={d}
                animate={{ y: [0, -5, 0], opacity: [0.35, 1, 0.35] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: d * 0.15 }}
                className="h-2 w-2 rounded-full bg-muted"
              />
            ))}
          </div>
        )}
        <div ref={end} />
      </div>

      <div className="bg-cream px-4 pb-[calc(20px+env(safe-area-inset-bottom))] pt-1">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-3">
          {QUICK.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="h-[38px] shrink-0 rounded-full border border-[#F0DFCC] bg-white px-4 text-[13px] font-bold"
            >
              {q}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(text);
          }}
          className="flex items-center gap-2.5"
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="اسأل أي شيء عن الطبخ"
            aria-label="رسالتك"
            maxLength={600}
            className="h-[52px] min-w-0 flex-1 rounded-full border border-[#F0DFCC] bg-white px-4 text-[15px] outline-none focus:border-tomato"
          />
          <button
            type="submit"
            disabled={busy || !text.trim()}
            aria-label="إرسال"
            className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-tomato text-white disabled:opacity-50"
          >
            <Send size={22} className="-scale-x-100" />
          </button>
        </form>
      </div>
    </div>
  );
}
