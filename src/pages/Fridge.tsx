import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { recipes } from '../data/recipes';
import { norm } from '../lib/format';
import { RecipeImage } from '../components/RecipeImage';

const KEY = 'nakha:fridge';
const START = ['دجاج', 'بطاطا', 'بصل', 'طماطم', 'ثوم'];
// مكوّنات أساسية لا تُحسب في نسبة التطابق
const BASIC = ['ملح', 'فلفل اسود', 'زيت زيتون', 'ماء'];

function load(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (Array.isArray(v)) return v;
  } catch {
    /* تجاهل */
  }
  return START;
}

export default function Fridge() {
  const [items, setItems] = useState<string[]>(load);
  const [text, setText] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* تجاهل */
    }
  }, [items]);

  const add = () => {
    const t = text.trim();
    if (t && !items.some((i) => norm(i) === norm(t))) setItems([...items, t]);
    setText('');
  };

  const results = useMemo(() => {
    const have = items.map(norm);
    return recipes
      .map((r) => {
        const need = r.ingredients.filter((i) => !BASIC.includes(norm(i.n)));
        const hit = need.filter((i) => have.some((h) => norm(i.n).includes(h) || h.includes(norm(i.n))));
        const miss = need.filter((i) => !hit.includes(i));
        return { r, pct: need.length ? Math.round((hit.length / need.length) * 100) : 0, hit: hit.length, total: need.length, miss };
      })
      .filter((x) => x.hit > 0)
      .sort((a, b) => b.pct - a.pct);
  }, [items]);

  return (
    <div className="pb-28">
      <header className="px-5 pt-7">
        <h1 className="font-display text-[32px] leading-tight">ماذا في ثلاجتي؟</h1>
        <p className="text-[15px] text-muted">أضف ما لديك، وسنقترح عليك ما تطبخه الآن.</p>
      </header>

      <div className="mx-5 mt-4 rounded-3xl border border-line bg-white p-4">
        <div className="text-sm font-extrabold text-muted">مكوّناتك · {items.length}</div>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {items.map((i) => (
            <motion.button
              layout
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={i}
              onClick={() => setItems(items.filter((x) => x !== i))}
              aria-label={`حذف ${i}`}
              className="flex h-9 items-center gap-1.5 rounded-full bg-basil-mist px-3 text-sm font-bold text-basil-dark"
            >
              {i}
              <X size={13} strokeWidth={3} />
            </motion.button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            add();
          }}
          className="mt-3 flex gap-2"
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="أضف مكوّناً مثل: بيض"
            aria-label="مكوّن جديد"
            className="h-11 min-w-0 flex-1 rounded-full border border-[#F0DFCC] px-4 text-[15px] outline-none focus:border-tomato"
          />
          <button type="submit" aria-label="إضافة" className="flex h-11 w-11 items-center justify-center rounded-full bg-tomato text-white">
            <Plus size={20} strokeWidth={3} />
          </button>
        </form>
      </div>

      <div className="flex items-baseline justify-between px-5 pt-[18px]">
        <h2 className="text-[19px] font-extrabold">{results.length} وصفة مناسبة</h2>
        <span className="text-[13px] font-bold text-tomato-dark">الأنسب أولاً</span>
      </div>

      <div className="flex flex-col gap-2.5 px-5 pt-3">
        {results.map(({ r, pct, hit, total, miss }, idx) => (
          <motion.div key={r.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
            <Link to={`/recipe/${r.id}`} className="flex items-center gap-3 rounded-[22px] border border-line bg-white p-2.5">
              <RecipeImage id={r.id} title={r.title} art={r.art} className="h-[72px] w-[72px] shrink-0 rounded-2xl" artSize={58} />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-base font-extrabold">{r.title}</span>
                  <span className={`text-[15px] font-extrabold ${pct >= 80 ? 'text-basil-dark' : 'text-muted'}`}>{pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-line">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6 }}
                    className={`h-1.5 rounded-full ${pct >= 80 ? 'bg-basil' : 'bg-saffron'}`}
                  />
                </div>
                <span className="truncate text-xs font-bold text-muted">
                  {miss.length === 0 ? 'كل المكوّنات متوفرة' : `${hit} من ${total} · ينقصك: ${miss.slice(0, 3).map((m) => m.n).join('، ')}`}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
        {!results.length && <p className="pt-4 text-muted">أضف بعض المكوّنات لتظهر الوصفات المناسبة.</p>}
      </div>
    </div>
  );
}
