import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";

// Layout
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
  return (
    <div className="min-h-screen bg-bg text-text transition-colors duration-300">
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 pt-4">
        <Breadcrumb />

        <Suspense
          fallback={
            <div className="text-center py-8 text-gray-500">
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
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}
