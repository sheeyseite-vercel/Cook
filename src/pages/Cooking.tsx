import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, ListChecks, Mic, Pause, Play, X } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { byId } from '../data/recipes';
import { mmss } from '../lib/format';

const R = 88;
const C = 2 * Math.PI * R;

export default function Cooking() {
  const { id } = useParams();
  const nav = useNavigate();
  const recipe = byId(id);
  const [i, setI] = useState(0);
  const [left, setLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [total, setTotal] = useState(0);
  const [listening, setListening] = useState(false);
  const wake = useRef<WakeLockSentinel | null>(null);

  const step = recipe?.steps[i];

  // منع انطفاء الشاشة أثناء الطبخ
  useEffect(() => {
    let alive = true;
    const req = async () => {
      try {
        const w = await navigator.wakeLock?.request('screen');
        if (alive) wake.current = w ?? null;
      } catch {
        /* غير مدعوم */
      }
    };
    req();
    return () => {
      alive = false;
      wake.current?.release().catch(() => {});
    };
  }, []);

  // تهيئة المؤقت عند تغيير الخطوة
  useEffect(() => {
    const s = step?.seconds ?? 0;
    setTotal(s);
    setLeft(s);
    setRunning(false);
  }, [i, step]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          setRunning(false);
          navigator.vibrate?.([200, 100, 200]);
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  const count = recipe?.steps.length ?? 0;
  const next = () => (i < count - 1 ? setI(i + 1) : nav(`/recipe/${recipe?.id}`));
  const prev = () => setI((v) => Math.max(0, v - 1));

  // أوامر صوتية: «التالي» و«السابق»
  const nextRef = useRef(next);
  const prevRef = useRef(prev);
  nextRef.current = next;
  prevRef.current = prev;
  const recog = useRef<any>(null);

  const toggleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    if (listening) {
      recog.current?.stop();
      setListening(false);
      return;
    }
    const r = new SR();
    r.lang = 'ar-DZ';
    r.continuous = true;
    r.onresult = (e: any) => {
      const text = e.results[e.results.length - 1][0].transcript;
      if (/التالي|التالية|كمل|نكمل/.test(text)) nextRef.current();
      else if (/السابق|السابقة|ارجع|رجوع/.test(text)) prevRef.current();
    };
    r.onend = () => setListening(false);
    r.start();
    recog.current = r;
    setListening(true);
  };
  useEffect(() => () => recog.current?.stop(), []);

  if (!recipe || !step) {
    return (
      <div className="p-8 text-center">
        <Link to="/" className="font-bold text-tomato-dark">العودة للرئيسية</Link>
      </div>
    );
  }

  const progress = total ? left / total : 0;
  const voiceOk = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  return (
    <div className="relative flex min-h-dvh flex-col bg-night text-[#FFF3E6]">
      <div className="flex items-center justify-between px-5 pt-7">
        <Link to={`/recipe/${recipe.id}`} aria-label="إنهاء الطبخ" className="flex h-11 w-11 items-center justify-center rounded-full bg-night-2">
          <X size={20} />
        </Link>
        <div className="flex flex-col items-center leading-tight">
          <span className="text-[15px] font-extrabold">
            الخطوة {i + 1} من {count}
          </span>
          <span className="max-w-[200px] truncate text-xs text-[#C9B2A0]">{recipe.title}</span>
        </div>
        <Link to={`/recipe/${recipe.id}`} aria-label="كل الخطوات" className="flex h-11 w-11 items-center justify-center rounded-full bg-night-2">
          <ListChecks size={20} />
        </Link>
      </div>

      <div className="flex gap-1.5 px-5 pt-[18px]">
        {recipe.steps.map((_, k) => (
          <span key={k} className={`h-[5px] flex-1 rounded-full transition-colors ${k <= i ? 'bg-[#FF6B4F]' : 'bg-night-3'}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.22 }}
          className="px-5 pt-6"
        >
          <h1 className="font-display text-[34px] leading-tight text-white">{step.title}</h1>
          <p className="mt-2.5 text-[19px] leading-[1.9] text-[#F3E2D0]">{step.text}</p>
        </motion.div>
      </AnimatePresence>

      {total > 0 && (
        <div className="mt-6 flex flex-col items-center">
          <div className="relative h-[196px] w-[196px]">
            <svg width="196" height="196" viewBox="0 0 200 200" aria-hidden="true">
              <circle cx="100" cy="100" r={R} fill="none" stroke="#3A2A22" strokeWidth="12" />
              <circle
                cx="100"
                cy="100"
                r={R}
                fill="none"
                stroke="#FF6B4F"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - progress)}
                transform="rotate(-90 100 100)"
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
              <span dir="ltr" className="text-[50px] font-extrabold tabular-nums">
                {mmss(left)}
              </span>
              <span className="mt-1 text-[13px] text-[#C9B2A0]">{left === 0 ? 'انتهى الوقت' : 'المتبقي من هذه الخطوة'}</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={() => setLeft((l) => Math.max(0, l - 60))}
              className="h-11 rounded-full border border-[#4A372D] px-[18px] text-sm font-bold"
            >
              − 1 د
            </button>
            <button
              onClick={() => (left === 0 ? (setLeft(total), setRunning(true)) : setRunning((r) => !r))}
              aria-label={running ? 'إيقاف المؤقت مؤقتاً' : 'تشغيل المؤقت'}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF3E6] text-night"
            >
              {running ? <Pause size={26} className="fill-night" /> : <Play size={26} className="fill-night" />}
            </button>
            <button onClick={() => setLeft((l) => l + 60)} className="h-11 rounded-full border border-[#4A372D] px-[18px] text-sm font-bold">
              + 1 د
            </button>
          </div>
        </div>
      )}

      <div className="mt-auto px-5 pb-[calc(26px+env(safe-area-inset-bottom))] pt-6">
        {voiceOk && (
          <div className="mb-3 text-center text-[13px] text-[#C9B2A0]">
            {listening ? 'أستمع إليك… قل «التالي» أو «السابق»' : 'اضغط الميكروفون وتحكّم بصوتك'}
          </div>
        )}
        <div className="flex items-center gap-3">
          <button
            onClick={prev}
            disabled={i === 0}
            aria-label="الخطوة السابقة"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-night-2 disabled:opacity-40"
          >
            <ChevronRight size={22} />
          </button>
          {voiceOk && (
            <div className="relative h-14 w-14 shrink-0">
              {listening && <span className="absolute inset-0 animate-ping rounded-full border-2 border-[#FF6B4F]" />}
              <button
                onClick={toggleVoice}
                aria-label="التحكم الصوتي"
                className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#FF6B4F] bg-night"
              >
                <Mic size={24} className="text-[#FF6B4F]" />
              </button>
            </div>
          )}
          <button
            onClick={next}
            className="flex h-14 flex-1 items-center justify-center gap-2.5 rounded-full bg-[#FF6B4F] text-[17px] font-extrabold text-night"
          >
            {i === count - 1 ? 'تمّ الطبخ' : 'الخطوة التالية'}
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
