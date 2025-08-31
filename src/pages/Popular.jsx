import { useEffect, useState } from "react";
import { fetchPopular } from "../services/mangaService";
import MangaCard from "../components/MangaCard";

export default function Popular() {
  const [loading, setLoading] = useState(true);
  const [mangaList, setMangaList] = useState([]);
  const [page, setPage] = useState(0);
  const pageSize = 30;

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchPopular(pageSize, page * pageSize)
      .then((list) => {
        if (isMounted) setMangaList(list);
      })
      .finally(() => isMounted && setLoading(false));
    return () => {
      isMounted = false;
    };
  }, [page]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-white mb-4">Popular Manga</h2>
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
