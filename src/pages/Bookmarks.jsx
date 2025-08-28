import { useEffect, useState } from "react";
import { useBookmarks } from "../context/BookmarksContext";
import { apiManga } from "../utils/axiosConfig";
import MangaCard from "../components/MangaCard";

export default function Bookmarks() {
  const { bookmarkedIds, getBookmarkCount, getMaxBookmarks } = useBookmarks();
  const [loading, setLoading] = useState(true);
  const [mangaList, setMangaList] = useState([]);
  const [page, setPage] = useState(0);
  const pageSize = 30;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    const fetchBookmarks = async () => {
      try {
        if (bookmarkedIds.length === 0) {
          if (isMounted) setMangaList([]);
          return;
        }

        // Calculate pagination
        const startIndex = page * pageSize;
        const endIndex = startIndex + pageSize;
        const pageIds = bookmarkedIds.slice(startIndex, endIndex);

        if (pageIds.length === 0) {
          if (isMounted) setMangaList([]);
          return;
        }

        const idsParams = pageIds.map((id) => `ids[]=${id}`).join("&");
        const res = await apiManga.get(
          `/manga?${idsParams}&includes[]=cover_art&includes[]=author`
        );
        
        if (isMounted) setMangaList(res.data.data);
      } catch (error) {
        console.error("Failed to fetch bookmarks:", error);
        if (isMounted) setMangaList([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBookmarks();
    return () => {
      isMounted = false;
    };
  }, [bookmarkedIds, page]);

  const totalPages = Math.ceil(bookmarkedIds.length / pageSize);
  const bookmarkCount = getBookmarkCount();
  const maxBookmarks = getMaxBookmarks();

  if (bookmarkedIds.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400">
        <div className="max-w-md mx-auto">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">No bookmarks yet</h3>
          <p className="text-sm mb-4">Add some manga to your bookmarks from the home page to see them here.</p>
          <div className="bg-[#2a2a4e] rounded-lg p-3 text-xs">
            <p className="text-[#c77dff] font-semibold">Bookmark Limit: {bookmarkCount}/{maxBookmarks}</p>
            <p className="text-gray-400">You can save up to {maxBookmarks} manga in your library.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">Your Bookmarks</h2>
        <div className="bg-[#2a2a4e] rounded-lg px-3 py-1 text-sm">
          <span className="text-[#c77dff] font-semibold">{bookmarkCount}/{maxBookmarks}</span>
          <span className="text-gray-400 ml-1">bookmarks</span>
        </div>
      </div>
      {loading ? (
        <div className="text-center text-gray-400">Loading...</div>
      ) : (
        <>
          <MangaCard mangaList={mangaList} />
          {totalPages > 1 && (
            <div className="flex justify-center gap-3 mt-6">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-4 py-2 rounded-lg border border-[#2a2a4e] text-gray-200 disabled:opacity-50"
              >
                Prev
              </button>
              <span className="px-4 py-2 text-gray-300">
                Page {page + 1} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded-lg bg-[#c77dff] hover:bg-[#7209b7] text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
