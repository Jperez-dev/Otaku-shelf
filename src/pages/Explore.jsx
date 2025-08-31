import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchExplore } from "../services/mangaService";
import MangaCard from "../components/MangaCard";

export default function Explore() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialQ = params.get("q") || "";
  const [query, setQuery] = useState(initialQ);
  const [loading, setLoading] = useState(true);
  const [mangaList, setMangaList] = useState([]);
  const [page, setPage] = useState(0);
  const pageSize = 24;

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchExplore({ query: initialQ, limit: pageSize, offset: page * pageSize })
      .then((list) => {
        if (isMounted) setMangaList(list);
      })
      .finally(() => isMounted && setLoading(false));
    return () => {
      isMounted = false;
    };
  }, [initialQ, page]);

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title..."
          className="w-full sm:w-80 px-3 py-2 bg-[#2a2a4e] border border-[#3a3a5e] rounded-lg text-white placeholder-gray-400"
        />
        <button
          onClick={() => {
            setPage(0);
            navigate(query ? `/explore?q=${encodeURIComponent(query)}` : "/explore");
          }}
          className="px-4 py-2 rounded-lg bg-[#c77dff] hover:bg-[#7209b7] text-white"
        >
          Search
        </button>
      </div>
      {loading ? (
        <div className="text-center text-gray-400">Loading...</div>
      ) : (
        <MangaCard mangaList={mangaList} />
      )}
      <div className="flex justify-center gap-3 mt-6">
        <button
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          className="px-4 py-2 rounded-lg border border-[#2a2a4e] text-gray-200 disabled:opacity-50"
        >
          Prev
        </button>
        <button
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 rounded-lg bg-[#c77dff] hover:bg-[#7209b7] text-white"
        >
          Next
        </button>
      </div>
    </div>
  );
}
