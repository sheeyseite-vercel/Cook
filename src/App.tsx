import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Route, Routes, useLocation } from 'react-router-dom';
import { BottomNav } from './components/BottomNav';
import Home from './pages/Home';
import RecipePage from './pages/Recipe';
import Cooking from './pages/Cooking';
import Chef from './pages/Chef';
import Fridge from './pages/Fridge';
import Planner from './pages/Planner';
import Favorites from './pages/Favorites';

function Page({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="min-h-dvh"
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();
  const p = location.pathname;
  const hideNav = p.startsWith('/cook') || p.startsWith('/chef') || p.startsWith('/recipe');

  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-[480px] overflow-x-hidden bg-cream shadow-2xl">
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Page><Home /></Page>} />
          <Route path="/recipe/:id" element={<Page><RecipePage /></Page>} />
          <Route path="/cook/:id" element={<Page><Cooking /></Page>} />
          <Route path="/chef" element={<Page><Chef /></Page>} />
          <Route path="/discover" element={<Page><Fridge /></Page>} />
          <Route path="/plan" element={<Page><Planner /></Page>} />
          <Route path="/favorites" element={<Page><Favorites /></Page>} />
          <Route path="*" element={<Page><Home /></Page>} />
        </Routes>
      </AnimatePresence>
      {!hideNav && <BottomNav />}
    </div>
  );
}
