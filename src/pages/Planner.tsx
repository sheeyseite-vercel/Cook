import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Plus, Shuffle, Trash2, X } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, addToShop } from '../db';
import { byId, recipes } from '../data/recipes';
import { dateKey, fmtQty, SLOTS } from '../lib/format';
import type { Slot } from '../types';
import { RecipeImage } from '../components/RecipeImage';

const DAY = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const MONTH = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

/** أيام الأسبوع الحالي ابتداءً من السبت */
function weekDays() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  start.setDate(start.getDate() - ((start.getDay() + 1) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export default function Planner() {
  const days = useMemo(weekDays, []);
  const todayKey = dateKey(new Date());
  const [sel, setSel] = useState(() => (days.some((d) => dateKey(d) === todayKey) ? todayKey : dateKey(days[0])));
  const [picking, setPicking] = useState<Slot | null>(null);
  const [msg, setMsg] = useState('');

  const plan = useLiveQuery(() => db.plan.toArray(), []) ?? [];
  const shop = useLiveQuery(() => db.shop.toArray(), []) ?? [];

  const flash = (t: string) => {
    setMsg(t);
    setTimeout(() => setMsg(''), 2200);
  };

  const setSlot = async (slot: Slot, recipeId: string) => {
    await db.plan.where('[date+slot]').equals([sel, slot]).delete();
    await db.plan.add({ date: sel, slot, recipeId });
    setPicking(null);
  };

  const clearSlot = (slot: Slot) => db.plan.where('[date+slot]').equals([sel, slot]).delete();

  const autoFill = async () => {
    const keys = days.map(dateKey);
    await db.plan.where('date').anyOf(keys).delete();
    const pool = (cats: string[]) => recipes.filter((r) => cats.includes(r.cat));
    const pick = <T,>(a: T[], i: number) => a[i % a.length];
    const rows = keys.flatMap((date, i) => [
      { date, slot: 'breakfast' as Slot, recipeId: pick(pool(['breakfast', 'starter']), i).id },
      { date, slot: 'lunch' as Slot, recipeId: pick(pool(['main']), i).id },
      { date, slot: 'dinner' as Slot, recipeId: pick(pool(['soup', 'main', 'starter']), i + 1).id },
    ]);
    await db.plan.bulkAdd(rows);
    flash('تم ملء الأسبوع');
  };

  const weekToShop = async () => {
    const keys = new Set(days.map(dateKey));
    let n = 0;
    for (const p of plan.filter((p) => keys.has(p.date))) {
      const r = byId(p.recipeId);
      if (!r) continue;
      for (const i of r.ingredients) {
        await addToShop(i.n, i.u, i.q);
        n++;
      }
    }
    flash(n ? 'أُضيفت مكوّنات الأسبوع إلى القائمة' : 'لا توجد وجبات مخططة بعد');
  };

  const first = days[0];
  const last = days[6];

  return (
    <div className="pb-28">
      <header className="px-5 pt-7">
        <h1 className="font-display text-[32px] leading-tight">خطة الأسبوع</h1>
        <p className="text-[15px] text-muted">
          من {DAY[first.getDay()]} {first.getDate()} إلى {DAY[last.getDay()]} {last.getDate()} {MONTH[last.getMonth()]}
        </p>
      </header>

      <div className="flex gap-1.5 px-5 pt-3.5">
        {days.map((d) => {
          const k = dateKey(d);
          const has = plan.some((p) => p.date === k);
          const on = k === sel;
          return (
            <button
              key={k}
              onClick={() => setSel(k)}
              className={`flex h-[68px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-[18px] ${
                on ? 'bg-tomato text-white' : 'border border-[#F0DFCC] bg-white'
              }`}
            >
              <span className={`text-[11px] font-semibold ${on ? '' : 'text-muted'}`}>{DAY[d.getDay()].slice(0, 4)}</span>
              <span className="text-[17px] font-extrabold">{d.getDate()}</span>
              <span className={`h-[5px] w-[5px] rounded-full ${has ? (on ? 'bg-white' : 'bg-basil') : 'bg-transparent'}`} />
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 px-5 pt-3.5">
        {SLOTS.map((s) => {
          const item = plan.find((p) => p.date === sel && p.slot === s.id);
          const r = item && byId(item.recipeId);
          return (
            <motion.div layout key={s.id} className="flex items-center gap-3 rounded-[20px] border border-line bg-white p-2.5">
              {r ? (
                <>
                  <RecipeImage id={r.id} title={r.title} art={r.art} className="h-14 w-14 shrink-0 rounded-[14px]" artSize={44} />
                  <div className="flex min-w-0 flex-col leading-snug">
                    <span className="text-xs font-bold text-muted">{s.label}</span>
                    <span className="truncate text-[15px] font-extrabold">{r.title}</span>
                  </div>
                  <span className="ms-auto text-xs text-muted">{r.minutes} د</span>
                  <button onClick={() => clearSlot(s.id)} aria-label="إزالة" className="p-1.5 text-muted">
                    <Trash2 size={18} />
                  </button>
                </>
              ) : (
                <button onClick={() => setPicking(s.id)} className="flex h-14 w-full items-center gap-3 text-start">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] border-2 border-dashed border-[#E3CDB8] text-muted">
                    <Plus size={22} />
                  </span>
                  <span className="flex flex-col leading-snug">
                    <span className="text-xs font-bold text-muted">{s.label}</span>
                    <span className="text-[15px] font-bold text-tomato-dark">اختر وصفة</span>
                  </span>
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="flex gap-2.5 px-5 pt-3">
        <button onClick={autoFill} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-basil text-[15px] font-extrabold text-white">
          <Shuffle size={18} />
          املأ الأسبوع تلقائياً
        </button>
        <button onClick={weekToShop} className="h-12 rounded-full border border-[#F0DFCC] bg-white px-4 text-[15px] font-extrabold text-basil-dark">
          إلى التسوق
        </button>
      </div>

      <div className="flex items-baseline justify-between px-5 pt-5">
        <h2 className="text-lg font-extrabold">قائمة التسوق</h2>
        {shop.length > 0 && (
          <button onClick={() => db.shop.clear()} className="text-[13px] font-bold text-tomato-dark">
            مسح الكل
          </button>
        )}
      </div>

      <div className="mx-5 mt-2.5 rounded-[22px] border border-line bg-white px-4 py-1">
        {shop.length === 0 && <p className="py-4 text-sm text-muted">القائمة فارغة. أضف مكوّنات من أي وصفة أو من خطة الأسبوع.</p>}
        {shop.map((s, idx) => (
          <div key={s.id} className={`flex items-center gap-3 py-2.5 ${idx < shop.length - 1 ? 'border-b border-[#F7EADB]' : ''}`}>
            <button
              onClick={() => db.shop.update(s.id!, { done: !s.done })}
              aria-label={s.done ? 'إلغاء الشراء' : 'تم الشراء'}
              className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full ${
                s.done ? 'bg-basil' : 'border-2 border-[#E3CDB8]'
              }`}
            >
              {s.done && <Check size={13} strokeWidth={3} className="text-white" />}
            </button>
            <span className={`text-[15px] font-semibold ${s.done ? 'text-muted line-through' : ''}`}>{s.name}</span>
            <span className="ms-auto text-sm tabular-nums text-muted">{s.qty ? `${fmtQty(s.qty)} ${s.unit}` : 'حسب الرغبة'}</span>
            <button onClick={() => db.shop.delete(s.id!)} aria-label="حذف" className="p-1 text-muted">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {picking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-end justify-center bg-black/40"
            onClick={() => setPicking(null)}
          >
            <motion.div
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[70dvh] w-full max-w-[480px] overflow-y-auto rounded-t-[28px] bg-white p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-extrabold">اختر وصفة</h3>
                <button onClick={() => setPicking(null)} aria-label="إغلاق" className="p-1">
                  <X size={20} />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {recipes.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSlot(picking, r.id)}
                    className="flex items-center gap-3 rounded-2xl border border-line p-2 text-start"
                  >
                    <RecipeImage id={r.id} title={r.title} art={r.art} className="h-12 w-12 shrink-0 rounded-xl" artSize={40} />
                    <span className="font-bold">{r.title}</span>
                    <span className="ms-auto text-xs text-muted">{r.minutes} د</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {msg && (
        <div className="fixed bottom-28 left-1/2 z-50 -translate-x-1/2 rounded-full bg-night px-4 py-2 text-sm font-bold text-white">{msg}</div>
      )}
    </div>
  );
}
