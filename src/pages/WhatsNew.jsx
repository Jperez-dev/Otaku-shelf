import { useEffect, useState } from "react";
import { apiManga } from "../utils/axiosConfig";
import MangaCard from "../components/MangaCard";

export default function WhatsNew() {
  const [loading, setLoading] = useState(true);
  const [mangaList, setMangaList] = useState([]);
  const [page, setPage] = useState(0);
  const pageSize = 30;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchLatestManga = async () => {
      try {
        // First, get popular manga (same as home page "what's new" section)
        const popularRes = await apiManga.get(
          "/manga?limit=40&order[followedCount]=desc&includes[]=cover_art&includes[]=author"
        );
        const popularManga = popularRes.data.data;

        // Filter for recent updates (last 14 days)
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 14);

        const recentManga = popularManga
          .filter(
            (m) =>
              new Date(m.attributes?.updatedAt || m.attributes?.createdAt) >=
              cutoff
          )
          .sort(
            (a, b) =>
              new Date(b.attributes.updatedAt) -
              new Date(a.attributes.updatedAt)
          );

        // For pagination, get more manga based on latest updates
        if (page > 0) {
          const offset = page * pageSize;
          const latestRes = await apiManga.get(
            `/manga?limit=${pageSize}&offset=${offset}&order[updatedAt]=desc&includes[]=cover_art&includes[]=author`
          );
          const latestManga = latestRes.data.data;

          // Combine recent popular with latest updates
          const combinedList = page === 0 ? recentManga : latestManga;
          if (isMounted) setMangaList(combinedList);
        } else {
          // First page shows the recent popular manga
          if (isMounted) setMangaList(recentManga);
        }
      } catch (error) {
        // Failed to fetch latest manga
        if (isMounted) setMangaList([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLatestManga();
    return () => {
      isMounted = false;
    };
  }, [page]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-[var(--color-text)] mb-4">
        Latest Updates
      </h2>
      {loading ? (
        <div className="text-center text-gray-400">Loading...</div>
      ) : (
        <MangaCard mangaList={mangaList} />
      )}
      <div className="flex justify-center gap-3 mt-6">
        <button
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          className="px-4 py-2 rounded-lg border border-[#c77dff] text-[var(--color-prev)] disabled:opacity-50"
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
