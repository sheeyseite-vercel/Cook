import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { recipes } from '../data/recipes';
import { useFavorites } from '../hooks';
import { RecipeImage } from '../components/RecipeImage';

export default function Favorites() {
  const { ids } = useFavorites();
  const list = recipes.filter((r) => ids.has(r.id));

  return (
    <div className="px-5 pb-28 pt-7">
      <h1 className="font-display text-[32px] leading-tight">المفضلة</h1>
      <p className="text-[15px] text-muted">وصفاتك المحفوظة على هذا الجهاز.</p>

      {list.length ? (
        <div className="mt-4 grid grid-cols-2 gap-3.5">
          {list.map((r) => (
            <Link key={r.id} to={`/recipe/${r.id}`} className="rounded-[22px] border border-line bg-white p-2">
              <RecipeImage id={r.id} title={r.title} art={r.art} className="h-[118px] rounded-2xl" artSize={96} />
              <div className="truncate px-1.5 pb-1 pt-2 text-[15px] font-bold">{r.title}</div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center gap-3 text-center text-muted">
          <Heart size={44} className="text-tomato" />
          <p>لا توجد وصفات محفوظة بعد.</p>
          <p className="text-sm">اضغط القلب في أي وصفة لتجدها هنا.</p>
        </div>
      )}
    </div>
  );
}
