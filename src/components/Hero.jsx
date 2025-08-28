import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiManga } from "../utils/axiosConfig";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const [manga, setManga] = useState("");
  const [mangaStat, setMangaStat] = useState([]);
  // const [latestChapter, setLatestChapter] = useState(null);
  const mangaId = "b0b721ff-c388-4486-aa0f-c2b0bb321512"; //FRIEREN
  // const mangaId = "32d76d19-8a05-4db0-9fc2-e0b0648fe9d0";
  const navigate = useNavigate();

  useEffect(() => {
    const getHeroDetails = async () => {
      try {
        const res = await apiManga.get(
          `/manga/${mangaId}?includes[]=cover_art&includes[]=author`
        );
        setManga(res.data.data);
      } catch (error) {
        if (error.response?.status === 403) {
          toast.error(
            "⚠️ Access blocked: CORS or API issue. Limit page refresh. Try refreshing again after a couple of minutes"
          );
        } else if (error.response?.status === 429) {
          toast.error("🚫 Too many requests. Please slow down.");
        } else {
          toast.error("❌ Something went wrong while fetching manga.");
        }
        console.log("API error:", error);
      }
    };

    const getStat = async () => {
      try {
        const res = await apiManga.get(`/statistics/manga/${mangaId}`);
        setMangaStat(res.data.statistics[mangaId]);
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
        console.log("API error:", error);
      }
    };

    // const getLatestEnglishChapter = async () => {
    //   try {
    //     // 1️⃣ Check manga.latestUploadedChapter first
    //     const mangaRes = await apiManga.get(
    //       `/manga/${mangaId}?includes[]=cover_art&includes[]=author`
    //     );
    //     const latestId =
    //       mangaRes.data.data?.attributes?.latestUploadedChapter || null;

    //     if (latestId) {
    //       const chapRes = await apiManga.get(`/chapter/${latestId}`);
    //       const chapter = chapRes.data.data;

    //       if (chapter?.attributes?.translatedLanguage === "en") {
    //         setLatestChapter(chapter);
    //         return; // ✅ Done
    //       }
    //     }

    //     // 2️⃣ Fallback → fetch latest English-only
    //     const res = await apiManga.get(
    //       `/chapter?manga=${mangaId}&limit=1&offset=0&translatedLanguage[]=en&order[readableAt]=desc`
    //     );
    //     const latest = res.data.data[0];
    //     if (latest) setLatestChapter(latest);
    //   } catch (error) {
    //     console.log("Error fetching latest chapter:", error);
    //   }
    // };

    getHeroDetails();
    getStat();
    // getLatestEnglishChapter();
  }, []);

  if (!manga || !mangaStat || !mangaStat.rating?.average) {
    return (
      <div className="w-full h-80 bg-[#1a1a2e] rounded-2xl flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-[#c77dff] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#f2e9ff] text-lg">Loading featured manga...</p>
        </div>
      </div>
    );
  }

  // Title and description
  const title = manga.attributes.title.en || "Untitled";
  const authorRel = manga.relationships?.find((r) => r.type === "author");
  const author = authorRel?.attributes?.name || "No Author";
  const coverRel = manga.relationships?.find((rel) => rel.type === "cover_art");
  // const coverFile = coverRel?.attributes?.fileName;
  const coverUrl = "https://w.wallhaven.cc/full/2y/wallhaven-2yjg26.jpg";
  const latestChapterId = manga?.attributes?.latestUploadedChapter || "";

  // ✅ Always points to English latest now
  // const latestChapterId = latestChapter?.id || "";

  function formatFollows(num) {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(0) + "k";
    return num.toString();
  }

  return (
    <section className="w-full mb-8">
      <div className="relative bg-[#1a1a2e] rounded-2xl overflow-hidden shadow-2xl border border-[#2a2a4e]">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src={coverUrl}
            alt="Hero Manga Cover"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a2e] via-[#1a1a2e]/80 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center p-8 lg:p-12 min-h-[400px]">
          {/* Left - Cover */}
          <div className="flex-shrink-0 mb-6 lg:mb-0 lg:mr-8">
            <div className="relative group">
              <div className="w-48 h-72 lg:w-56 lg:h-80 rounded-xl overflow-hidden shadow-2xl border-2 border-[#c77dff]/20 group-hover:border-[#c77dff]/40 transition-all duration-300">
                <img
                  src={coverUrl}
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-[#c77dff] to-[#7209b7] text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                Featured
              </div>
            </div>
          </div>

          {/* Right - Info */}
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl lg:text-5xl font-bold text-[#f2e9ff] leading-tight">
                {title}
              </h1>
              <p className="text-xl text-[#c77dff] font-medium">by {author}</p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2 bg-[#2a2a4e] px-4 py-2 rounded-full">
                <div className="flex items-center space-x-1">
                  <svg
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-[#f2e9ff] font-semibold">
                    {mangaStat.rating.average.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-[#2a2a4e] px-4 py-2 rounded-full">
                <svg
                  className="w-5 h-5 text-[#c77dff]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span className="text-[#f2e9ff] font-semibold">
                  {formatFollows(mangaStat.follows)}
                </span>
              </div>

              <div className="bg-gradient-to-r from-[#c77dff] to-[#7209b7] px-4 py-2 rounded-full">
                <span className="text-white font-semibold text-sm">
                  Trending Now
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={() => navigate(`/manga/${mangaId}`)}
                className="bg-gradient-to-r from-[#c77dff] to-[#7209b7] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-[#c77dff]/25 transition-all duration-300 transform hover:scale-105"
              >
                View Details
              </button>
              <button
                onClick={() =>
                  latestChapterId && navigate(`/read/${latestChapterId}`)
                }
                disabled={!latestChapterId}
                className="bg-transparent border-2 border-[#c77dff] text-[#c77dff] px-8 py-3 rounded-full font-semibold hover:bg-[#c77dff] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Read Latest
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
