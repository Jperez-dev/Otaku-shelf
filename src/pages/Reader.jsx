import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchChapterPages } from "../services/mangaService";
import { apiManga } from "../utils/axiosConfig";
import toast from "react-hot-toast";

export default function Reader() {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chapterInfo, setChapterInfo] = useState(null);
  const [languageWarningShown, setLanguageWarningShown] = useState(false);

  // Scroll to top when component mounts or chapter ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [chapterId]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadChapter = async () => {
      try {
        // First, get chapter info to check language using our API proxy
        const chapterResponse = await apiManga.get(`/chapter/${chapterId}`);
        const chapterData = chapterResponse.data;

        if (!isMounted) return;

        if (!chapterData.data) {
          throw new Error("Chapter not found");
        }

        const chapter = chapterData.data;
        setChapterInfo(chapter);

        const translatedLanguage =
          chapter.attributes?.translatedLanguage?.toLowerCase();

        // Show language warning toast but don't block - let user decide
        if (translatedLanguage && translatedLanguage !== "en" && !languageWarningShown) {
          toast.error(
            `⚠️ This chapter is in ${translatedLanguage.toUpperCase()}, not English. You can still read it.`,
            {
              duration: 5000,
              position: 'top-center',
            }
          );
          setLanguageWarningShown(true);
        }

        // Try to fetch chapter pages
        const pageUrls = await fetchChapterPages(chapterId);
        if (isMounted) {
          if (pageUrls && pageUrls.length > 0) {
            setPages(pageUrls);
          } else {
            throw new Error("No pages found for this chapter");
          }
        }
      } catch (err) {
        // Error loading chapter
        if (isMounted) {
          // Check if it's a network/CORS error
          if (err.message.includes('Failed to fetch') || err.name === 'AxiosError') {
            setError({
              type: "network",
              message: "Failed to load chapter. This might be due to network issues or the chapter doesn't exist.",
              details: err.message,
              chapterInfo: chapterInfo,
            });
          } else {
            setError({
              type: "fetch",
              message: "Failed to load chapter. This might be due to missing translations or API issues.",
              details: err.message,
              chapterInfo: chapterInfo,
            });
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadChapter();
    return () => {
      isMounted = false;
    };
  }, [chapterId, languageWarningShown]);

  const handleContinueAnyway = async () => {
    setLoading(true);
    setError(null);

    try {
      const pageUrls = await fetchChapterPages(chapterId);
      if (pageUrls && pageUrls.length > 0) {
        setPages(pageUrls);
      } else {
        throw new Error("No pages found for this chapter");
      }
    } catch (err) {
      setError({
        type: "fetch",
        message: "Failed to load chapter. Please try again.",
        details: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c77dff] mx-auto mb-4"></div>
          <p className="text-lg">Loading chapter...</p>
          <p className="text-sm text-gray-400 mt-2">This may take a moment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-[#1a1a2e] rounded-2xl p-8 max-w-md w-full border border-[#2a2a4e] text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
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
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            {error.type === "language"
              ? "Language Not Available"
              : "Error Loading Chapter"}
          </h2>

          <p className="text-gray-300 mb-6">
            {error.message}
            {error.type === "language" && error.language && (
              <span className="block mt-2 text-sm">
                Available in:{" "}
                <span className="text-[#c77dff] font-semibold uppercase">
                  {error.language}
                </span>
              </span>
            )}
            {error.details && (
              <span className="block mt-2 text-xs text-gray-500">
                Details: {error.details}
              </span>
            )}
          </p>

          <div className="space-y-3">
            {error.type === "language" && (
              <button
                onClick={handleContinueAnyway}
                className="w-full bg-[#c77dff] hover:bg-[#7209b7] text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-300"
              >
                Continue Anyway
              </button>
            )}

            <button
              onClick={() => navigate(-1)}
              className="w-full bg-[#2a2a4e] hover:bg-[#3a3a5e] text-white font-semibold py-3 px-6 rounded-xl border border-[#c77dff] transition-colors duration-300"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-[#2a2a4e]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-[#2a2a4e] rounded-lg transition-colors duration-300"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-semibold">
                {chapterInfo?.attributes?.title ||
                  `Chapter ${chapterInfo?.attributes?.chapter || ""}`}
              </h1>
              <p className="text-sm text-gray-400">
                {chapterInfo?.attributes?.translatedLanguage?.toUpperCase() ||
                  "Unknown"}{" "}
                • {pages.length} pages
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">
              {pages.length > 0 ? "1" : "0"} / {pages.length}
            </span>
          </div>
        </div>
      </div>

      {/* Chapter Content */}
      <div className="max-w-4xl mx-auto p-2 sm:p-4">
        {pages.map((src, idx) => (
          <div key={idx} className="mb-2 sm:mb-4">
            <img
              src={src}
              alt={`Page ${idx + 1}`}
              className="w-full h-auto rounded-lg shadow-lg"
              loading={idx < 3 ? "eager" : "lazy"}
              onError={(e) => {
                // Failed to load image
                e.target.style.display = "none";
              }}
            />
          </div>
        ))}
      </div>

      {/* End of Chapter */}
      {pages.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-[#2a2a4e]">
            <h3 className="text-xl font-semibold text-white mb-2">
              End of Chapter
            </h3>
            <p className="text-gray-400 mb-4">
              You've reached the end of this chapter.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="bg-[#c77dff] hover:bg-[#7209b7] text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-300"
            >
              Back to Manga
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
