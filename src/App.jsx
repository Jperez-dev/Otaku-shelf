import { Routes, Route } from "react-router-dom";
import { Suspense, lazy, useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { BookmarksProvider } from "./context/BookmarksContext";

// Layout components
import Header from "./components/Header";
import Breadcrumb from "./components/Breadcrumb";
import Footer from "./components/Footer";

// Lazy-loaded pages
const Home = lazy(() => import("./pages/Home"));
const Explore = lazy(() => import("./pages/Explore"));
const Popular = lazy(() => import("./pages/Popular"));
const WhatsNew = lazy(() => import("./pages/WhatsNew"));
const MangaDetail = lazy(() => import("./pages/MangaDetail"));
const Bookmarks = lazy(() => import("./pages/Bookmarks"));
const Reader = lazy(() => import("./pages/Reader"));

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first, fallback to true if not found
    const savedTheme = localStorage.getItem("darkMode");
    return savedTheme !== null ? JSON.parse(savedTheme) : true;
  });

  useEffect(() => {
    // Apply dark class to html element
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Save to localStorage whenever isDark changes
    localStorage.setItem("darkMode", JSON.stringify(isDark));
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  return (
    <BookmarksProvider>
      <div className="min-h-screen w-full max-w-[120rem] mx-auto bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300 flex flex-col">
        <Toaster position="top" toastOptions={{ duration: 8000 }} />

        {/* Header - Fixed height */}
        <Header isDark={isDark} toggleDarkMode={toggleDarkMode} />

        {/* Main content area - This will grow to fill available space */}
        <main className="flex-1 w-full flex flex-col">
          <Breadcrumb />
          <div className="flex-1">
            <Suspense
              fallback={
                <div className="text-center py-8 text-muted">
                  Loading page...
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/popular" element={<Popular />} />
                <Route path="/whats-new" element={<WhatsNew />} />
                <Route path="/bookmarks" element={<Bookmarks />} />
                <Route path="/manga/:id" element={<MangaDetail />} />
                <Route path="/read/:chapterId" element={<Reader />} />
              </Routes>
            </Suspense>
          </div>
        </main>

        {/* Footer - Will stick to bottom */}
        <Footer />
      </div>
    </BookmarksProvider>
  );
}
