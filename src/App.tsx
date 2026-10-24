import { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './hooks/useAuth';
import { RevealProvider, useReveal } from './hooks/useReveal';
import { usePhase } from './hooks/usePhase';
import { startTintLoop } from './lib/tint';
import Background from './components/Background';
import TintSync from './components/TintSync';
import Home from './pages/Home';
import Login from './pages/Login';
import Parents from './pages/Parents';

function Shell() {
  const loc = useLocation();
  const { data } = useReveal();
  const { phase } = usePhase();

  useEffect(() => {
    startTintLoop();
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [loc.pathname]);

  return (
    <>
      <Background phase={phase} result={data.result} />
      <TintSync />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={loc.pathname}
          className="page"
          initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
          transition={{ duration: 0.35 }}
        >
          <Routes location={loc}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/parents" element={<Parents />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.main>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <RevealProvider>
          <Shell />
        </RevealProvider>
      </AuthProvider>
    </HashRouter>
  );
}
