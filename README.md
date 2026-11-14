# نكهة

تطبيق وصفات طبخ بالعربية (RTL) يعمل مباشرة بدون حساب. المفضلة وقائمة التسوق وخطة الأسبوع تُحفظ على جهاز المستخدم.

## التقنيات
React + TypeScript + Vite، Tailwind، Framer Motion، Dexie (IndexedDB)، ودالة Vercel للمساعد الذكي.

## التشغيل
```bash
npm install
npm run dev
```

## المساعد الذكي
أضف `ANTHROPIC_API_KEY` في إعدادات مشروع Vercel (Environment Variables) ثم أعد النشر. المفتاح لا يوضع في الكود. للتجربة المحلية استعمل `vercel dev` مع ملف `.env.local`.

## الصور الحقيقية للوصفات
ضع صورة لكل وصفة في `public/images/recipes/` باسم معرّف الوصفة، مثل `couscous.webp` أو `makroud.jpg`. المعرّفات في `src/data/recipes.ts`. إن لم توجد صورة يظهر رسم بديل. استعمل صوراً تملك حقوقها أو مجانية الترخيص (Unsplash، Pexels).

## تحويله إلى تطبيق هاتف لاحقاً
أضف Capacitor (`@capacitor/core` و`@capacitor/cli`) ثم `npx cap add android` و`npx cap add ios`.

## إضافة وصفة
أضف عنصراً جديداً في `src/data/recipes.ts` بنفس شكل الوصفات الموجودة.
