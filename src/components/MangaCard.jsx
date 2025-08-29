import { Link } from "react-router-dom";
import { useBookmarks } from "../context/BookmarksContext";

export default function MangaCard({ mangaList }) {
  const {
    bookmarkedIds,
    toggleBookmark,
    isBookmarked,
    canAddMore,
    getBookmarkCount,
    getMaxBookmarks,
  } = useBookmarks();

  const handleBookmarkClick = (e, id) => {
    e.preventDefault();
    e.stopPropagation();

    if (isBookmarked(id)) {
      // Always allow removing bookmarks
      toggleBookmark(id);
    } else {
      // Check if we can add more bookmarks
      if (canAddMore()) {
        toggleBookmark(id);
      } else {
        // The toast error will be shown by the context
        return;
      }
    }
  };

  const bookmarkCount = getBookmarkCount();
  const maxBookmarks = getMaxBookmarks();

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 gap-4 2xl:grid-cols-6">
      {mangaList.map((manga) => {
        const title =
          manga.attributes.title.en || Object.values(manga.attributes.title)[0];
        const id = manga.id;
        const coverRel = manga.relationships.find(
          (rel) => rel.type === "cover_art"
        );
        const fileName = coverRel?.attributes?.fileName;
        const imageUrl = fileName
          ? `https://uploads.mangadex.org/covers/${id}/${fileName}`
          : "";
        console.log(imageUrl);

        const isCurrentlyBookmarked = isBookmarked(id);
        const canSave = canAddMore() || isCurrentlyBookmarked;

        return (
          <div
            key={id}
            className="bg-[#2a2a4e] rounded-2xl p-2 hover:bg-[#3a3a5e] transition-all duration-300 cursor-pointer group"
          >
            <Link to={`/manga/${id}`} className="block">
              <div className="aspect-[2/3] rounded-lg mb-2 overflow-hidden relative">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Bookmark Button */}
                <button
                  onClick={(e) => handleBookmarkClick(e, id)}
                  className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCurrentlyBookmarked
                      ? "bg-red-600 hover:bg-red-700 text-white shadow-lg"
                      : canSave
                      ? "bg-[#2a2a4e]/80 hover:bg-[#c77dff] text-[#c77dff] hover:text-white shadow-lg"
                      : "bg-gray-600/80 text-gray-400 cursor-not-allowed shadow-lg"
                  }`}
                  disabled={!canSave && !isCurrentlyBookmarked}
                >
                  <svg
                    className={`w-4 h-4 ${
                      isCurrentlyBookmarked ? "fill-current" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-2">
                <h4 className="text-white text-sm font-semibold truncate group-hover:text-[#c77dff] transition-colors duration-300">
                  {title}
                </h4>
                <p className="text-gray-400 text-xs truncate mt-1">
                  {manga.relationships?.find((r) => r.type === "author")
                    ?.attributes?.name || "Unknown"}
                </p>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
