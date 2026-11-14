import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { categories, recipes } from '../data/recipes';
import type { CategoryId } from '../types';
import { norm } from '../lib/format';
import { RecipeCard } from '../components/RecipeCard';
import { RecipeImage } from '../components/RecipeImage';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'صباح الخير';
  if (h < 18) return 'مساء النور';
  return 'مساء الخير';
}

export default function Home() {
  const [cat, setCat] = useState<CategoryId | 'all'>('all');
  const [q, setQ] = useState('');

  // وصفة اليوم تتغير يومياً
  const today = recipes[Math.floor(Date.now() / 86400000) % recipes.length];

  const list = useMemo(() => {
    const nq = norm(q);
    return recipes.filter(
      (r) =>
        (cat === 'all' || r.cat === cat) &&
        (!nq || norm(r.title).includes(nq) || r.ingredients.some((i) => norm(i.n).includes(nq))),
    );
  }, [cat, q]);

  return (
    <div className="pb-28">
      <header className="px-5 pt-7">
        <span className="text-sm text-muted">{greeting()}</span>
        <h1 className="font-display text-[32px] leading-tight">ماذا نطبخ اليوم؟</h1>
      </header>

      <div className="px-5 pt-4">
        <label className="flex h-[52px] items-center gap-2.5 rounded-full border border-[#F0DFCC] bg-white px-[18px]">
          <Search size={20} className="text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث عن وصفة أو مكوّن"
            aria-label="بحث"
            className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted"
          />
        </label>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pt-3.5">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={`h-10 shrink-0 rounded-full px-[18px] text-sm font-bold transition-colors ${
              cat === c.id ? 'bg-tomato text-white' : 'border border-[#F0DFCC] bg-white text-ink'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {!q && cat === 'all' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="px-5 pt-4">
          <Link
            to={`/recipe/${today.id}`}
            className="relative block h-[196px] overflow-hidden rounded-[28px] bg-tomato text-white"
          >
            <RecipeImage
              id={today.id}
              title={today.title}
              art={today.art}
              eager
              artSize={190}
              className="absolute inset-y-0 left-0 w-[52%] !bg-tomato"
            />
            <div className="absolute inset-y-0 right-0 flex w-[56%] flex-col items-start gap-2 p-5">
              <span className="rounded-xl bg-saffron px-3 py-0.5 text-xs font-extrabold text-ink">وصفة اليوم</span>
              <span className="font-display text-[26px] leading-tight">{today.title}</span>
              <span className="text-[13px] text-[#FFE3D6]">
                {today.minutes} دقيقة · {today.level}
              </span>
              <span className="mt-auto flex h-[38px] items-center rounded-full bg-saffron px-[18px] text-sm font-extrabold text-ink">
                اطبخها الآن
              </span>
            </div>
          </Link>
        </motion.div>
      )}

      <div className="flex items-baseline justify-between px-5 pt-[22px]">
        <h2 className="text-xl font-extrabold">{q || cat !== 'all' ? 'النتائج' : 'الأكثر شعبية'}</h2>
        <span className="text-sm text-muted">{list.length} وصفة</span>
      </div>

      {list.length ? (
        <div className="no-scrollbar flex gap-3.5 overflow-x-auto px-5 pt-3.5">
          {list.map((r, i) => (
            <RecipeCard key={r.id} recipe={r} index={i} />
          ))}
        </div>
      ) : (
        <p className="px-5 pt-6 text-muted">لا توجد وصفات مطابقة. جرّب كلمة أخرى.</p>
      )}
    </div>
  );
}
