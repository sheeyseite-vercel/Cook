import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Heart, Minus, Play, Plus, ShoppingBasket } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { byId } from '../data/recipes';
import { addToShop } from '../db';
import { useFavorites } from '../hooks';
import { fmtIngredient, mmss } from '../lib/format';
import { RecipeImage } from '../components/RecipeImage';

export default function RecipePage() {
  const { id } = useParams();
  const nav = useNavigate();
  const recipe = byId(id);
  const { ids, toggle } = useFavorites();
  const [people, setPeople] = useState(recipe?.servings ?? 4);
  const [tab, setTab] = useState<'ing' | 'steps'>('ing');
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [added, setAdded] = useState(false);

  if (!recipe) {
    return (
      <div className="p-8 text-center">
        <p>الوصفة غير موجودة.</p>
        <Link to="/" className="font-bold text-tomato-dark">العودة للرئيسية</Link>
      </div>
    );
  }

  const scale = people / recipe.servings;
  const fav = ids.has(recipe.id);

  const addAll = async () => {
    for (const i of recipe.ingredients) {
      if (i.q) await addToShop(i.n, i.u, Math.round(i.q * scale * 10) / 10);
      else await addToShop(i.n, i.u, 0);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <div className="relative min-h-dvh bg-peach">
      <RecipeImage
        id={recipe.id}
        title={recipe.title}
        art={recipe.art}
        eager
        artSize={240}
        className="absolute inset-x-0 top-0 h-[310px]"
      />
      <button
        onClick={() => nav(-1)}
        aria-label="رجوع"
        className="absolute right-5 top-6 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white"
      >
        <ArrowRight size={22} />
      </button>
      <button
        onClick={() => toggle(recipe.id)}
        aria-label={fav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
        className="absolute left-5 top-6 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white"
      >
        <motion.span key={String(fav)} initial={{ scale: 0.6 }} animate={{ scale: [0.6, 1.3, 1] }} transition={{ duration: 0.4 }}>
          <Heart size={22} className={fav ? 'fill-tomato text-tomato' : 'text-ink'} />
        </motion.span>
      </button>

      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 24, stiffness: 220 }}
        className="relative mt-[290px] min-h-[calc(100dvh-290px)] rounded-t-[32px] bg-white px-5 pb-32 pt-[22px]"
      >
        <h1 className="font-display text-[30px] leading-tight">{recipe.title}</h1>
        <div className="mt-1 text-sm text-muted">
          ★ <b className="text-ink">{recipe.rating}</b> · {recipe.origin}
        </div>

        <div className="mt-3.5 grid grid-cols-3 gap-2.5">
          {[
            ['الوقت', `${recipe.minutes} د`],
            ['الأشخاص', String(people)],
            ['الصعوبة', recipe.level],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-cream px-3 py-2.5 leading-tight">
              <div className="text-base font-extrabold">{v}</div>
              <div className="text-[11px] text-muted">{k}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-[22px] border-b border-line">
          {(
            [
              ['ing', 'المكوّنات'],
              ['steps', 'الخطوات'],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`-mb-px border-b-[3px] py-2 text-[15px] ${
                tab === k ? 'border-tomato font-extrabold text-tomato-dark' : 'border-transparent font-semibold text-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'ing' ? (
          <>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[15px] font-bold">عدد الأشخاص</span>
              <div className="flex items-center gap-3.5">
                <button
                  aria-label="تقليل العدد"
                  onClick={() => setPeople((p) => Math.max(1, p - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F0DFCC] bg-white"
                >
                  <Minus size={18} />
                </button>
                <span className="min-w-5 text-center text-xl font-extrabold tabular-nums">{people}</span>
                <button
                  aria-label="زيادة العدد"
                  onClick={() => setPeople((p) => Math.min(20, p + 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-tomato text-white"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
            <ul className="mt-1.5">
              {recipe.ingredients.map((i, idx) => {
                const on = checked.has(idx);
                return (
                  <li key={i.n}>
                    <button
                      onClick={() =>
                        setChecked((s) => {
                          const n = new Set(s);
                          n.has(idx) ? n.delete(idx) : n.add(idx);
                          return n;
                        })
                      }
                      className="flex w-full items-center gap-3 border-b border-[#F7EADB] py-3 text-start"
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                          on ? 'bg-basil' : 'border-2 border-[#E3CDB8]'
                        }`}
                      >
                        {on && <Check size={14} strokeWidth={3} className="text-white" />}
                      </span>
                      <span className={`text-base font-semibold ${on ? 'text-muted line-through' : ''}`}>{i.n}</span>
                      <span className="ms-auto text-[15px] tabular-nums text-muted">{fmtIngredient(i, scale)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <ol className="mt-3 space-y-3">
            {recipe.steps.map((s, i) => (
              <li key={i} className="rounded-2xl bg-cream p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-extrabold">
                    {i + 1}. {s.title}
                  </span>
                  {s.seconds && <span className="text-xs tabular-nums text-muted">{mmss(s.seconds)}</span>}
                </div>
                <p className="mt-1 text-[15px] leading-7 text-ink/85">{s.text}</p>
              </li>
            ))}
          </ol>
        )}
      </motion.div>

      <div className="fixed bottom-0 left-1/2 z-20 flex w-full max-w-[480px] -translate-x-1/2 gap-3 border-t border-line bg-white px-5 pb-[calc(22px+env(safe-area-inset-bottom))] pt-3.5">
        <button
          onClick={addAll}
          aria-label="إضافة المكونات إلى قائمة التسوق"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#F0DFCC] bg-white"
        >
          {added ? <Check size={24} className="text-basil" /> : <ShoppingBasket size={24} className="text-basil" />}
        </button>
        <Link
          to={`/cook/${recipe.id}`}
          className="flex h-14 flex-1 items-center justify-center gap-2.5 rounded-full bg-tomato text-[17px] font-extrabold text-white"
        >
          <Play size={20} className="fill-white" />
          ابدأ الطبخ
        </Link>
      </div>
      {added && (
        <div className="fixed bottom-28 left-1/2 z-30 -translate-x-1/2 rounded-full bg-night px-4 py-2 text-sm font-bold text-white">
          أُضيفت المكوّنات إلى قائمة التسوق
        </div>
      )}
    </div>
  );
}
