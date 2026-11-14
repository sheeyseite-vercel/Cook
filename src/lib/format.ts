import type { Ingredient } from '../types';

export const fmtQty = (q: number) => String(Math.round(q * 10) / 10);

export function fmtIngredient(i: Ingredient, scale = 1) {
  if (!i.q) return 'حسب الرغبة';
  return `${fmtQty(i.q * scale)} ${i.u}`.trim();
}

export const mmss = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

/** توحيد الحروف العربية للمطابقة */
export const norm = (s: string) =>
  s
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[ً-ْ]/g, '')
    .trim();

export const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const SLOTS = [
  { id: 'breakfast', label: 'الفطور' },
  { id: 'lunch', label: 'الغداء' },
  { id: 'dinner', label: 'العشاء' },
] as const;
