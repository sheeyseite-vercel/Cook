import { motion } from 'framer-motion';
import { Clock, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Recipe } from '../types';
import { RecipeImage } from './RecipeImage';

export function RecipeCard({ recipe, index = 0 }: { recipe: Recipe; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.4 }}
      className="w-[164px] shrink-0"
    >
      <Link
        to={`/recipe/${recipe.id}`}
        className="block rounded-[22px] border border-line bg-white p-2 transition-transform active:scale-[0.97]"
      >
        <RecipeImage id={recipe.id} title={recipe.title} art={recipe.art} className="h-[118px] rounded-2xl" artSize={104} />
        <div className="px-1.5 pb-1 pt-2">
          <div className="truncate text-[15px] font-bold">{recipe.title}</div>
          <div className="mt-1 flex items-center gap-1 text-xs text-muted">
            <Clock size={14} />
            <span>{recipe.minutes} د</span>
            <Star size={14} className="ms-2 fill-saffron text-saffron" />
            <span>{recipe.rating}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
