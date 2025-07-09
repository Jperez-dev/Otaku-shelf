import { Routes, Route } from "react-router-dom";
import { Suspense, lazy, useState, useEffect } from "react";

// Layout components
import Header from "./components/Header";
import Breadcrumb from "./components/Breadcrumb";

// Lazy-loaded pages
const Home = lazy(() => import("./pages/Home"));
const Explore = lazy(() => import("./pages/Explore"));
const Popular = lazy(() => import("./pages/Popular"));
const WhatsNew = lazy(() => import("./pages/WhatsNew"));
const MangaDetail = lazy(() => import("./pages/MangaDetail"));
const Bookmarks = lazy(() => import("./pages/Bookmarks"));

export default function App() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Apply dark class to html element
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300">
      <Header isDark={isDark} toggleDarkMode={toggleDarkMode} />
      <main className="max-w-7xl mx-auto px-4 pt-4">
        <Breadcrumb />
        <Suspense
          fallback={
            <div className="text-center py-8 text-muted">Loading page...</div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/popular" element={<Popular />} />
            <Route path="/whats-new" element={<WhatsNew />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/manga/:id" element={<MangaDetail />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}
