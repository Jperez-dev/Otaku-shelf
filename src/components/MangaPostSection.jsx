import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiManga } from "../utils/axiosConfig";
import MangaCard from "./MangaCard";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useBookmarks } from "../context/BookmarksContext";

// Popular List Component for Home Page
function PopularList({ mangaList }) {
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
    <div className="space-y-4">
      {mangaList.map((manga, index) => {
        const title =
          manga.attributes.title.en || Object.values(manga.attributes.title)[0];
        const id = manga.id;
        const coverRel = manga.relationships.find(
          (rel) => rel.type === "cover_art"
        );
        const fileName = coverRel?.attributes?.fileName;
        const imageUrl = fileName
          ? `https://uploads.mangadx.org/covers/${id}/${fileName}`
          : "";

        const authorName =
          manga.relationships[0].attributes.name || "No Author";

        const followerCount = manga.stats?.follows || "failed to load";

        const isCurrentlyBookmarked = isBookmarked(id);
        const canSave = canAddMore() || isCurrentlyBookmarked;

        return (
          <div
            key={id}
            className="flex items-center space-x-4 group hover:bg-black/5 p-3 rounded-lg transition-colors cursor-pointer"
          >
            {/* Rank Badge */}
            <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-sm">{index + 1}</span>
            </div>

            {/* Cover Image */}
            <Link
              to={`/manga/${id}`}
              className="flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden"
            >
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
            </Link>

            {/* Manga Info */}
            <div className="flex-1 min-w-0">
              <Link
                to={`/manga/${id}`}
                className="text-white font-semibold text-lg line-clamp-1 mb-1 group-hover:text-amber-300"
              >
                {title}
              </Link>
              <p className="text-gray-400 text-sm truncate mb-2 group-hover:text-white">
                {authorName}
              </p>
              <div className="flex items-center space-x-2 text-gray-300">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm">
                  {Number(followerCount || 0).toLocaleString()}
                </span>
              </div>
            </div>
            <button
              onClick={(e) => handleBookmarkClick(e, id)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                isCurrentlyBookmarked
                  ? "bg-red-600 border-red-500 text-white"
                  : canSave
                  ? "text-[#c77dff] border-[#c77dff] hover:bg-[#c77dff] hover:text-white"
                  : "text-gray-500 border-gray-500 cursor-not-allowed"
              }`}
              disabled={!canSave && !isCurrentlyBookmarked}
            >
              {isCurrentlyBookmarked ? "Saved" : "Save"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default function MangaPostSection({ section }) {
  const [mangaList, setMangaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchManga = async () => {
      try {
        let mangaData;

        if (section === "popular") {
          // Popular list + batch statistics
          const popularRes = await apiManga.get(
            "/manga?limit=20&order[followedCount]=desc&includes[]=cover_art&includes[]=author"
          );
          const mangaDataRaw = popularRes.data.data;
          const ids = mangaDataRaw.map((m) => m.id);
          const params = ids.map((id) => `manga[]=${id}`).join("&");
          const statsRes = await apiManga.get(`/statistics/manga?${params}`);
          const statsMap = statsRes.data?.statistics || {};
          mangaData = mangaDataRaw.map((m) => ({
            ...m,
            stats: statsMap[m.id] || {},
          }));
        } else if (section === "explore") {
          const res = await apiManga.get(
            "/manga?limit=9&order[title]=asc&includes[]=cover_art&includes[]=author"
          );
          mangaData = res.data.data;
        } else if (section === "what's new") {
          // Most followed + recently updated, include author for consistent cover/title language
          const res = await apiManga.get(
            "/manga?limit=40&order[followedCount]=desc&includes[]=cover_art&includes[]=author"
          );
          const list = res.data?.data || [];
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - 14);
          mangaData = list
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
        } else if (section === "want to read") {
          const stored =
            JSON.parse(localStorage.getItem("bookmarkedMangaIds")) || [];
          if (stored.length === 0) {
            setMangaList([]);
            setLoading(false);
            return;
          }

          const idsParams = stored.map((id) => `ids[]=${id}`).join("&");
          const res = await apiManga.get(
            `/manga?${idsParams}&includes[]=cover_art&includes[]=author`
          );
          mangaData = res.data.data.slice(0, 10); // Limit to 10 for home page
        }

        setMangaList(mangaData);
      } catch (error) {
        if (error.response?.status === 403) {
          toast.error(
            "⚠️ Access blocked: CORS or API issue. Limit page refresh. Try refreshing after a couple of minutes"
          );
        } else if (error.response?.status === 429) {
          toast.error("🚫 Too many requests. Please slow down.");
        } else {
          toast.error("❌ Something went wrong while fetching manga.");
        }
        console.error("Failed to fetch manga:", error);
        setMangaList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchManga();
  }, [section]);

  // Get section configuration
  const getSectionConfig = (section) => {
    switch (section) {
      case "what's new":
        return {
          title: "What's New",
          icon: (
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          ),
          bgColor: "bg-blue-600",
          buttonColor: "bg-blue-500 hover:bg-blue-600 text-white",
          description: "Latest manga updates",
        };
      case "explore":
        return {
          title: "Explore",
          icon: (
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          ),
          bgColor: "bg-green-600",
          buttonColor: "bg-green-500 hover:bg-green-600 text-white",
          description: "Discover new manga",
        };
      case "want to read":
        return {
          title: "Want to Read",
          icon: (
            <svg
              className="w-5 h-5 text-white"
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
          ),
          bgColor: "bg-purple-600",
          buttonColor: "bg-purple-500 hover:bg-purple-600 text-white",
          description: "Your reading list",
        };
      default:
        return {
          title: section,
          icon: (
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          ),
          bgColor: "bg-gray-600",
          buttonColor: "bg-gray-500 hover:bg-gray-600 text-white",
          description: "Browse collection",
        };
    }
  };

  // Loading state
  if (loading) {
    const config = getSectionConfig(section);
    return (
      <section className="my-12 md:col-span-3">
        <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-[#2a2a4e]">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 ${config.bgColor} rounded-xl flex items-center justify-center shadow-lg animate-pulse`}
              >
                <div className="w-5 h-5 bg-white/20 rounded"></div>
              </div>
              <div>
                <div className="w-32 h-6 bg-gray-600 rounded animate-pulse mb-1"></div>
                <div className="w-24 h-4 bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="w-20 h-8 bg-gray-600 rounded-lg animate-pulse"></div>
          </div>

          {/* Loading grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 2xl:grid-cols-6">
            {Array(9)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="bg-[#2a2a4e] rounded-xl p-1 animate-pulse"
                >
                  <div className="w-full aspect-[2/3] bg-gray-600 rounded-lg mb-2"></div>
                  <div className="p-2">
                    <div className="w-full h-4 bg-gray-700 rounded mb-1"></div>
                    <div className="w-2/3 h-3 bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>
    );
  }

  if (mangaList.length === 0) return null;

  if (section === "popular") {
    return (
      <section className="my-32 md:my-0 md:col-span-4 md:p-4 md:bg-gradient-to-b from-gray-800 to-[#120918] md:rounded-tl-lg md:rounded-bl-lg custom-breakpoint-3">
        {/* Header with flame icon and "View All" button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#ff0037] rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#f9fafb]">Hottest</h2>
          </div>
          <button
            onClick={() => navigate("/popular")}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-2 rounded-lg transition-colors md:p-2 lg:px-4 lg:py-2"
          >
            View All →
          </button>
        </div>

        {/* Popular manga container with gradient background */}
        <div className="bg-gradient-to-b from-[#ab0086] via-[#4f0094] to-[#120918] rounded-lg p-6 relative overflow-hidden md:p-2">
          <PopularList mangaList={mangaList} />
        </div>
      </section>
    );
  }

  const config = getSectionConfig(section);

  return (
    <section className="my-12 md:col-span-3">
      <div className="bg-[#1a1a2e] rounded-2xl p-4 sm:p-6 border border-[#2a2a4e] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div
              className={`w-12 h-12 ${config.bgColor} rounded-xl flex items-center justify-center shadow-lg`}
            >
              {config.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#f2e9ff] mb-1">
                {config.title}
              </h2>
              <p className="text-[#c77dff] text-sm">{config.description}</p>
            </div>
          </div>
          <button
            className={`${config.buttonColor} font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg transform hover:scale-105`}
            onClick={() => {
              if (section === "explore") navigate("/explore");
              else if (section === "what's new") navigate("/whats-new");
              else if (section === "popular") navigate("/popular");
              else if (section === "want to read") navigate("/bookmarks");
              else navigate("/explore");
            }}
          >
            View All →
          </button>
        </div>

        <MangaCard mangaList={mangaList} />
      </div>
    </section>
  );
}
