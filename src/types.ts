export type Art = 'couscous' | 'shakshuka' | 'harira' | 'makroud' | 'bourek' | 'chicken';

export type CategoryId = 'main' | 'soup' | 'dessert' | 'starter' | 'breakfast';

export interface Ingredient {
  /** الاسم */
  n: string;
  /** الكمية لعدد الأشخاص الأصلي في الوصفة. صفر تعني: حسب الرغبة */
  q: number;
  /** الوحدة */
  u: string;
}

export interface Step {
  title: string;
  text: string;
  /** مدة المؤقت بالثواني (اختياري) */
  seconds?: number;
}

export interface Recipe {
  id: string;
  title: string;
  cat: CategoryId;
  origin: string;
  minutes: number;
  level: 'سهلة' | 'متوسطة' | 'صعبة';
  servings: number;
  rating: number;
  /** رسم بديل يظهر إذا لم توجد صورة حقيقية في public/images/recipes */
  art: Art;
  ingredients: Ingredient[];
  steps: Step[];
}

export type Slot = 'breakfast' | 'lunch' | 'dinner';
