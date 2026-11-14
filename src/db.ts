import Dexie, { type Table } from 'dexie';
import type { Slot } from './types';

export interface Fav {
  id: string;
}

export interface ShopItem {
  id?: number;
  name: string;
  unit: string;
  qty: number;
  done: boolean;
}

export interface PlanItem {
  id?: number;
  /** بصيغة YYYY-MM-DD */
  date: string;
  slot: Slot;
  recipeId: string;
}

class AppDB extends Dexie {
  favs!: Table<Fav, string>;
  shop!: Table<ShopItem, number>;
  plan!: Table<PlanItem, number>;

  constructor() {
    super('nakha');
    this.version(1).stores({
      favs: 'id',
      shop: '++id, name',
      plan: '++id, date, [date+slot]',
    });
  }
}

export const db = new AppDB();

/** إضافة مكوّن إلى قائمة التسوق أو زيادة كميته إن كان موجوداً ولم يُشترَ بعد */
export async function addToShop(name: string, unit: string, qty: number) {
  const existing = await db.shop
    .where('name')
    .equals(name)
    .filter((s) => s.unit === unit && !s.done)
    .first();
  if (existing && existing.id !== undefined) {
    await db.shop.update(existing.id, { qty: existing.qty + qty });
  } else {
    await db.shop.add({ name, unit, qty, done: false });
  }
}
