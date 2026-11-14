import { NavLink } from 'react-router-dom';
import { CalendarDays, Heart, Home, Search, Sparkles } from 'lucide-react';

const base = 'flex flex-col items-center justify-center gap-1 text-[11px]';

export function BottomNav() {
  const item = ({ isActive }: { isActive: boolean }) =>
    `${base} ${isActive ? 'font-extrabold text-tomato-dark' : 'font-semibold text-muted'}`;

  return (
    <nav
      aria-label="التنقل الرئيسي"
      className="fixed bottom-0 left-1/2 z-30 grid h-[84px] w-full max-w-[480px] -translate-x-1/2 grid-cols-5 border-t border-line bg-white pb-[env(safe-area-inset-bottom)]"
    >
      <NavLink to="/" end className={item}>
        <Home size={24} />
        <span>الرئيسية</span>
      </NavLink>
      <NavLink to="/discover" className={item}>
        <Search size={24} />
        <span>اكتشف</span>
      </NavLink>
      <NavLink to="/chef" className={`${base} relative justify-end font-extrabold text-ink`}>
        <span className="absolute -top-6 flex h-[58px] w-[58px] items-center justify-center rounded-full border-4 border-cream bg-saffron">
          <Sparkles size={26} className="fill-ink text-ink" />
        </span>
        <span className="mb-3.5">الشيف</span>
      </NavLink>
      <NavLink to="/plan" className={item}>
        <CalendarDays size={24} />
        <span>المخطط</span>
      </NavLink>
      <NavLink to="/favorites" className={item}>
        <Heart size={24} />
        <span>المفضلة</span>
      </NavLink>
    </nav>
  );
}
