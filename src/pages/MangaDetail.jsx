import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Heart,
  Star,
  Share2,
  Play,
  Clock,
  Users,
  Tag,
  BookOpen,
} from "lucide-react";
import {
  fetchChapters,
  fetchMangaDetail,
  fetchRelatedByAuthor,
  getCoverUrl,
  getMangaTitle,
  getFallbackCoverUrl,
  getFallbackCoverUrlWithTitle,
} from "../services/mangaService";
import { useBookmarks } from "../context/BookmarksContext";

export default function MangaDetailPage() {
  const { id } = useParams();
  const {
    bookmarkedIds,
    toggleBookmark,
    isBookmarked,
    canAddMore,
    getBookmarkCount,
    getMaxBookmarks,
  } = useBookmarks();
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [manga, setManga] = useState(null);
  const [stats, setStats] = useState({});
  const [chapters, setChapters] = useState([]);
  const [related, setRelated] = useState([]);
  const [chapterLangLabel, setChapterLangLabel] = useState("EN");
  const [chapterPage, setChapterPage] = useState(0);
  const pageSize = 30;

  const bookmarkCount = getBookmarkCount();
  const maxBookmarks = getMaxBookmarks();

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setIsLoading(true);
      try {
        const [{ manga, stats }] = await Promise.all([fetchMangaDetail(id)]);
        if (!isMounted) return;
        setManga(manga);
        setStats(stats);
        // Fetch chapters with EN preference, with pagination and proper ordering by chapter
        const { list: firstBatch } = await fetchChapters({
          mangaId: id,
          limit: pageSize,
          offset: chapterPage * pageSize,
          orderBy: "chapter",
          languages: ["en"],
          allowFallbackAnyLanguage: true,
        });
        if (firstBatch.length === 0) {
          setChapters([]);
          setChapterLangLabel("—");
        } else {
          const allEn = firstBatch.every(
            (c) =>
              (c.attributes?.translatedLanguage || "").toLowerCase() === "en"
          );
          setChapterLangLabel(allEn ? "EN" : "Mixed");
          setChapters(firstBatch);
        }
        const authorRel = manga?.relationships?.find(
          (r) => r.type === "author"
        );
        if (authorRel?.id) {
          const rel = await fetchRelatedByAuthor({
            authorId: authorRel.id,
            excludeId: id,
            limit: 6,
          });
          if (isMounted) setRelated(rel);
        } else {
          setRelated([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [id, chapterPage]);

  const title = useMemo(() => (manga ? getMangaTitle(manga) : ""), [manga]);
  const coverImage = useMemo(() => (manga ? getCoverUrl(manga) : ""), [manga]);
  const authorName = useMemo(() => {
    const authorRel = manga?.relationships?.find((r) => r.type === "author");
    return authorRel?.attributes?.name || "Unknown";
  }, [manga]);

  if (isLoading || !manga) {
    return (
      <div className="min-h-screen bg-[#0f0f23] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c77dff]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f23] text-white">
      {/* Hero Section */}
      <div className="relative">
        {/* Background Blur */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center filter blur-sm scale-110"
            style={{
              backgroundImage: `url(${coverImage})`,
              backgroundPosition: "center top",
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-[#0f0f23]"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Cover Image */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="relative group">
                  <img
                    src={coverImage}
                    alt={title}
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    className="w-full max-w-sm mx-auto rounded-2xl shadow-2xl transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      console.warn('Main cover image failed to load for:', title);
                      // Prevent infinite loops by checking if we're already showing a fallback
                      if (!e.target.src.includes('data:image') && !e.target.src.includes('placehold.co')) {
                        // First try placehold.co service
                        e.target.src = getFallbackCoverUrlWithTitle(title);
                      } else if (e.target.src.includes('placehold.co')) {
                        // If external service fails, use inline SVG (guaranteed to work)
                        e.target.src = getFallbackCoverUrl();
                      }
                      // If already using inline SVG, do nothing to prevent infinite loop
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => {
                      if (chapters.length > 0) {
                        navigate(`/read/${chapters[0].id}`);
                      }
                    }}
                    disabled={chapters.length === 0}
                    className={`w-full py-3 px-6 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 transform hover:scale-105 shadow-lg ${
                      chapters.length > 0
                        ? "bg-gradient-to-r from-[#c77dff] to-[#7209b7] hover:from-[#7209b7] hover:to-[#c77dff] text-white"
                        : "bg-gray-600 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <Play className="w-5 h-5" />
                    <span>
                      {chapters.length > 0
                        ? "Start Reading"
                        : "No Chapters Available"}
                    </span>
                  </button>

                  <button
                    onClick={() => toggleBookmark(id)}
                    className={`w-full py-3 px-6 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 ${
                      isBookmarked(id)
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : canAddMore() || isBookmarked(id)
                        ? "bg-[#2a2a4e] hover:bg-[#3a3a5e] text-[#c77dff] border border-[#c77dff]"
                        : "bg-gray-600 text-gray-400 cursor-not-allowed"
                    }`}
                    disabled={!canAddMore() && !isBookmarked(id)}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isBookmarked(id) ? "fill-current" : ""
                      }`}
                    />
                    <span>
                      {isBookmarked(id) ? "Saved" : "Save to Library"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {/* Title & Basic Info */}
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">
                    {title}
                  </h1>
                  <p className="text-xl text-[#c77dff] mb-4">by {authorName}</p>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-yellow-400 font-semibold">
                        {Number(stats.rating?.average || 0).toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-[#c77dff]" />
                      <span>
                        {Number(stats.follows || 0).toLocaleString()} followers
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-[#c77dff]" />
                      <span>{Number(stats.comments || 0)} comments</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-[#c77dff]" />
                      <span>
                        Updated{" "}
                        {new Date(
                          manga.attributes?.updatedAt || Date.now()
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex flex-wrap gap-2">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {manga.attributes?.status || "Ongoing"}
                  </span>
                  <span className="bg-[#2a2a4e] text-[#c77dff] px-3 py-1 rounded-full text-sm font-semibold border border-[#c77dff]">
                    {manga.attributes?.contentRating || "Safe"}
                  </span>
                </div>

                {/* Genres */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                    <Tag className="w-5 h-5 text-[#c77dff]" />
                    <span>Genres</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(manga.attributes?.tags || []).map((tag) => {
                      const name =
                        tag?.attributes?.name?.en ||
                        (tag?.attributes?.name &&
                          Object.values(tag.attributes.name)[0]) ||
                        "Tag";
                      return (
                        <span
                          key={tag.id}
                          className="bg-gradient-to-r from-[#c77dff] to-[#7209b7] text-white px-3 py-1 rounded-full text-sm font-medium hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                        >
                          {name}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Author Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#1a1a2e] rounded-xl p-4 border border-[#2a2a4e]">
                    <h4 className="text-[#c77dff] font-semibold mb-1">
                      Author
                    </h4>
                    <p className="text-white">{authorName}</p>
                  </div>
                  <div className="bg-[#1a1a2e] rounded-xl p-4 border border-[#2a2a4e]">
                    <h4 className="text-[#c77dff] font-semibold mb-1">
                      Artist
                    </h4>
                    <p className="text-white">
                      {manga.relationships?.find((r) => r.type === "artist")
                        ?.attributes?.name || "Unknown"}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-[#1a1a2e] rounded-xl p-6 border border-[#2a2a4e]">
                  <h3 className="text-xl font-semibold mb-4 text-[#c77dff]">
                    Synopsis
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {manga.attributes?.description?.en ||
                      (manga.attributes?.description &&
                        Object.values(manga.attributes.description)[0]) ||
                      "No description available."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-[#1a1a2e] rounded-2xl border border-[#2a2a4e] overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-[#2a2a4e]">
            {["overview", "chapters", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-semibold capitalize transition-all duration-300 ${
                  activeTab === tab
                    ? "text-[#c77dff] border-b-2 border-[#c77dff] bg-[#2a2a4e]"
                    : "text-gray-400 hover:text-white hover:bg-[#2a2a4e]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-[#2a2a4e] rounded-xl p-4">
                  <h4 className="text-[#c77dff] font-semibold mb-2">
                    Publication
                  </h4>
                  <p className="text-white">{manga.attributes?.year || "—"}</p>
                </div>
                <div className="bg-[#2a2a4e] rounded-xl p-4">
                  <h4 className="text-[#c77dff] font-semibold mb-2">
                    Language
                  </h4>
                  <p className="text-white">EN</p>
                </div>
                <div className="bg-[#2a2a4e] rounded-xl p-4">
                  <h4 className="text-[#c77dff] font-semibold mb-2">
                    Content Rating
                  </h4>
                  <p className="text-white">
                    {manga.attributes?.contentRating || "Safe"}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "chapters" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-white">
                      Latest Chapters
                    </h3>
                    <span className="text-xs px-2 py-1 rounded-full border border-[#2a2a4e] text-gray-300">
                      Lang: {chapterLangLabel}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      disabled={chapterPage === 0}
                      onClick={() => setChapterPage((p) => Math.max(0, p - 1))}
                      className="px-3 py-2 rounded-lg border border-[#2a2a4e] text-gray-200 disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => setChapterPage((p) => p + 1)}
                      className="px-3 py-2 rounded-lg bg-[#c77dff] hover:bg-[#7209b7] text-white"
                    >
                      Next
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {chapters.length === 0 && (
                    <div className="bg-[#2a2a4e] rounded-xl p-6 text-center">
                      <div className="text-gray-400 mb-4">
                        <svg
                          className="w-12 h-12 mx-auto mb-4 opacity-50"
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
                        <p className="text-lg font-semibold">
                          No chapters available
                        </p>
                        <p className="text-sm">
                          This manga may not have any chapters uploaded yet or
                          they may not be available in your preferred language.
                        </p>
                      </div>
                      <button
                        onClick={() => setChapterPage(0)}
                        className="bg-[#c77dff] hover:bg-[#7209b7] text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-300"
                      >
                        Refresh Chapters
                      </button>
                    </div>
                  )}

                  {/* Language Warning */}
                  {chapters.length > 0 && chapterLangLabel !== "EN" && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                      <div className="flex items-center space-x-3">
                        <svg
                          className="w-5 h-5 text-yellow-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                        <div>
                          <p className="text-yellow-400 font-semibold">
                            Language Notice
                          </p>
                          <p className="text-yellow-300 text-sm">
                            Some chapters may not be available in English. You
                            can still read them, but the content will be in the
                            original language.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {chapters.map((chapter) => {
                    const chapterLanguage =
                      chapter.attributes?.translatedLanguage?.toLowerCase();
                    const isEnglish = chapterLanguage === "en";

                    return (
                      <div
                        key={chapter.id}
                        className="bg-[#2a2a4e] rounded-xl p-4 hover:bg-[#3a3a5e] transition-colors duration-300 cursor-pointer group"
                        onClick={() => navigate(`/read/${chapter.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-[#c77dff] rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {chapter.attributes?.chapter || "-"}
                              </span>
                            </div>
                            <div>
                              <h4 className="text-white font-semibold group-hover:text-[#c77dff] transition-colors duration-300">
                                {chapter.attributes?.title ||
                                  `Chapter ${
                                    chapter.attributes?.chapter || ""
                                  }`}
                              </h4>
                              <div className="flex items-center space-x-2 mt-1">
                                <p className="text-gray-400 text-sm">
                                  {new Date(
                                    chapter.attributes?.readableAt ||
                                      chapter.attributes?.createdAt ||
                                      Date.now()
                                  ).toLocaleDateString()}
                                </p>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    isEnglish
                                      ? "bg-green-500 text-white"
                                      : "bg-yellow-500 text-black"
                                  }`}
                                >
                                  {chapterLanguage?.toUpperCase() || "Unknown"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-gray-400 text-sm">
                            ID: {chapter.id.slice(0, 6)}…
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Reviews coming soon!</p>
                  <p className="text-sm">
                    Be the first to share your thoughts about this manga.
                  </p>
                </div>
                <button className="bg-[#c77dff] hover:bg-[#7209b7] text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-300 mt-4">
                  Write a Review
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Manga Section */}
      <div className="container mx-auto px-4 pb-8">
        <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-[#2a2a4e]">
          <h3 className="text-2xl font-bold text-white mb-6">
            You might also like
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {related.map((m) => {
              const title = getMangaTitle(m);
              const img = getCoverUrl(m);
              return (
                <div
                  key={m.id}
                  onClick={() => navigate(`/manga/${m.id}`)}
                  className="bg-[#2a2a4e] rounded-2xl p-2 hover:bg-[#3a3a5e] transition-colors duration-300 cursor-pointer group"
                >
                  <div className="aspect-[2/3] rounded-lg mb-2 overflow-hidden">
                    <img
                      src={img}
                      alt={title}
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.warn('Related manga cover failed to load for:', title);
                        // Prevent infinite loops by checking if we're already showing a fallback
                        if (!e.target.src.includes('data:image') && !e.target.src.includes('placehold.co')) {
                          // First try placehold.co service
                          e.target.src = getFallbackCoverUrlWithTitle(title);
                        } else if (e.target.src.includes('placehold.co')) {
                          // If external service fails, use inline SVG (guaranteed to work)
                          e.target.src = getFallbackCoverUrl();
                        }
                        // If already using inline SVG, do nothing to prevent infinite loop
                      }}
                    />
                  </div>
                  <h4 className="text-white text-sm font-semibold truncate group-hover:text-[#c77dff] transition-colors duration-300">
                    {title}
                  </h4>
                </div>
              );
            })}
            {related.length === 0 && (
              <div className="text-gray-400">No related manga found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
