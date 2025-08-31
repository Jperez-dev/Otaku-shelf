import { apiManga } from "../utils/axiosConfig";

// Build cover image URL from a manga object with relationships
export function getCoverUrl(manga) {
  if (!manga || !manga.id) {
    // Invalid manga object
    return getFallbackCoverUrl();
  }
  
  const mangaId = manga.id;
  const coverRel = manga.relationships?.find((rel) => rel.type === "cover_art");
  const fileName = coverRel?.attributes?.fileName;
  
  if (!fileName) {
    // No cover filename found
    return getFallbackCoverUrl();
  }
  
  const originalImageUrl = `https://uploads.mangadex.org/covers/${mangaId}/${fileName}`;
  
  // In development, try direct URL first, in production use Vercel function
  const isDevelopment = import.meta.env.DEV;
  
  if (isDevelopment) {
    // In development, return direct URL (may have CORS issues but will work for testing)
    return originalImageUrl;
  } else {
    // In production, use Vercel serverless function
    return `/api/image-proxy?url=${encodeURIComponent(originalImageUrl)}`;
  }
}

// Generate a fallback placeholder URL for failed cover images
export function getFallbackCoverUrl(title = "No Cover") {
  // Use a base64 encoded 1x1 pixel image as the ultimate fallback
  // This ensures we never have network requests that can fail
  return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjM4NCIgdmlld0JveD0iMCAwIDI1NiAzODQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iMzg0IiBmaWxsPSIjMmEyYTRlIi8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjYzc3ZGZmIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiPk5vIENvdmVyPC90ZXh0Pgo8L3N2Zz4K";
}

// Generate a fallback placeholder with title (tries external service first, then inline SVG)
export function getFallbackCoverUrlWithTitle(title = "No Cover") {
  const encodedTitle = encodeURIComponent(title.slice(0, 20));
  return `https://placehold.co/256x384/2a2a4e/c77dff/png?text=${encodedTitle}`;
}

// Extract first available title
export function getMangaTitle(manga) {
  return (
    manga?.attributes?.title?.en ||
    (manga?.attributes?.title && Object.values(manga.attributes.title)[0]) ||
    "Untitled"
  );
}

// Batch statistics for many manga ids
export async function fetchStatisticsBatch(mangaIds) {
  if (!mangaIds || mangaIds.length === 0) return {};
  
  try {
    const params = mangaIds
      .map((id) => `manga[]=${encodeURIComponent(id)}`)
      .join("&");
    // Requesting stats for manga batch
    
    const res = await apiManga.get(`/statistics/manga?${params}`);
    // Stats response received
    
    return res.data?.statistics || {};
  } catch (error) {
    // Failed to fetch statistics batch
    // Return empty stats for each manga ID to avoid undefined errors
    const emptyStats = {};
    mangaIds.forEach(id => {
      emptyStats[id] = {};
    });
    return emptyStats;
  }
}

export async function fetchPopular(limit = 20, offset = 0) {
  try {
    const res = await apiManga.get(
      `/manga?limit=${limit}&offset=${offset}&order[followedCount]=desc&includes[]=cover_art&includes[]=author`
    );
    const list = res.data?.data || [];
    
    if (list.length === 0) {
      return [];
    }
    
    const ids = list.map((m) => m.id);
    const stats = await fetchStatisticsBatch(ids);
    return list.map((m) => ({ ...m, stats: stats[m.id] || {} }));
  } catch (error) {
    // Failed to fetch popular manga
    return [];
  }
}

export async function fetchExplore({
  query = "",
  limit = 24,
  offset = 0,
} = {}) {
  const searchParam = query ? `&title=${encodeURIComponent(query)}` : "";
  const res = await apiManga.get(
    `/manga?limit=${limit}&offset=${offset}${searchParam}&order[title]=asc&includes[]=cover_art&includes[]=author`
  );
  return res.data?.data || [];
}

export async function fetchWhatsNew(limit = 12, recentDays = 14, offset = 0) {
  const res = await apiManga.get(
    `/manga?limit=${limit}&offset=${offset}&order[followedCount]=desc&includes[]=cover_art&includes[]=author`
  );
  const list = res.data?.data || [];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - recentDays);
  return list
    .filter(
      (m) =>
        new Date(m.attributes?.updatedAt || m.attributes?.createdAt) >= cutoff
    )
    .sort(
      (a, b) =>
        new Date(b.attributes.updatedAt) - new Date(a.attributes.updatedAt)
    )
    .slice(0, limit);
}

export async function fetchByIds(ids = []) {
  if (!ids || ids.length === 0) return [];
  const idsParams = ids
    .map((id) => `ids[]=${encodeURIComponent(id)}`)
    .join("&");
  const res = await apiManga.get(
    `/manga?${idsParams}&includes[]=cover_art&includes[]=author`
  );
  return res.data?.data || [];
}

export async function fetchMangaDetail(id) {
  try {
    const res = await apiManga.get(
      `/manga/${id}?includes[]=cover_art&includes[]=author&includes[]=artist`
    );
    const manga = res.data?.data;
    
    let stats = {};
    try {
      const statsRes = await apiManga.get(`/statistics/manga/${id}`);
      stats = statsRes.data?.statistics?.[id] || {};
    } catch (statsError) {
      // Failed to fetch statistics for manga
      stats = {};
    }
    
    return { manga, stats };
  } catch (error) {
    // Failed to fetch manga detail
    throw error;
  }
}

export async function fetchChapters({
  mangaId,
  limit = 25,
  offset = 0,
  languages = ["en"],
  allowFallbackAnyLanguage = false,
  orderBy = "chapter",
}) {
  const orderKey = orderBy === "readableAt" ? "readableAt" : "chapter";
  const buildUrl = (langParams) =>
    `/chapter?manga=${mangaId}&limit=${limit * 2}&offset=${offset}${langParams}&order[${orderKey}]=desc`; // Back to descending order
  const langQuery = (arr) =>
    arr.map((l) => `&translatedLanguage[]=${encodeURIComponent(l)}`).join("");

  // Attempt with requested languages (default English only)
  let res = await apiManga.get(buildUrl(langQuery(languages)));
  let data = res.data?.data || [];
  const total = res.data?.total ?? data.length;
  
  // Remove duplicates by chapter number (keep first occurrence, prefer English)
  const uniqueChapters = new Map();
  data.forEach((chapter) => {
    const chapterNum = chapter.attributes?.chapter;
    if (chapterNum) {
      const existingChapter = uniqueChapters.get(chapterNum);
      const isEnglish = chapter.attributes?.translatedLanguage?.toLowerCase() === 'en';
      const existingIsEnglish = existingChapter?.attributes?.translatedLanguage?.toLowerCase() === 'en';
      
      // Keep this chapter if:
      // 1. No existing chapter with this number, OR
      // 2. This is English and existing is not, OR
      // 3. Both same language preference but this is newer
      if (!existingChapter || 
          (isEnglish && !existingIsEnglish) ||
          (isEnglish === existingIsEnglish && 
           new Date(chapter.attributes?.readableAt || 0) > new Date(existingChapter.attributes?.readableAt || 0))) {
        uniqueChapters.set(chapterNum, chapter);
      }
    }
  });
  
  // Convert back to array and sort by chapter number (descending - latest first)
  const filteredData = Array.from(uniqueChapters.values())
    .sort((a, b) => {
      const chapterA = parseFloat(a.attributes?.chapter || 0);
      const chapterB = parseFloat(b.attributes?.chapter || 0);
      return chapterB - chapterA; // Descending order
    })
    .slice(0, limit); // Apply original limit after deduplication

  if (filteredData.length > 0 || !allowFallbackAnyLanguage)
    return { list: filteredData, total };

  // Optional fallback: any language with same deduplication logic
  res = await apiManga.get(buildUrl(""));
  data = res.data?.data || [];
  
  // Apply same deduplication for fallback
  const fallbackUniqueChapters = new Map();
  data.forEach((chapter) => {
    const chapterNum = chapter.attributes?.chapter;
    if (chapterNum && !fallbackUniqueChapters.has(chapterNum)) {
      fallbackUniqueChapters.set(chapterNum, chapter);
    }
  });
  
  const fallbackFilteredData = Array.from(fallbackUniqueChapters.values())
    .sort((a, b) => {
      const chapterA = parseFloat(a.attributes?.chapter || 0);
      const chapterB = parseFloat(b.attributes?.chapter || 0);
      return chapterB - chapterA; // Descending order
    })
    .slice(0, limit);
  
  return { list: fallbackFilteredData, total: res.data?.total ?? fallbackFilteredData.length };
}

export async function fetchRelatedByAuthor({ authorId, excludeId, limit = 6 }) {
  if (!authorId) return [];
  const res = await apiManga.get(
    `/manga?limit=${limit + 1}&authors[]=${encodeURIComponent(
      authorId
    )}&order[followedCount]=desc&includes[]=cover_art&includes[]=author`
  );
  const list = res.data?.data || [];
  return list.filter((m) => m.id !== excludeId).slice(0, limit);
}

// Fetch page image URLs for a chapter
export async function fetchChapterPages(chapterId, useDataSaver = true) {
  const atHome = await apiManga.get(`/at-home/server/${chapterId}`);
  const baseUrl = atHome.data?.baseUrl;
  const chapter = atHome.data?.chapter;
  if (!baseUrl || !chapter) return [];
  const files = useDataSaver ? chapter.dataSaver : chapter.data;
  
  const isDevelopment = import.meta.env.DEV;
  
  return files.map((file) => {
    const originalImageUrl = `${baseUrl}/${useDataSaver ? "data-saver" : "data"}/${chapter.hash}/${file}`;
    
    if (isDevelopment) {
      // In development, return direct URL
      return originalImageUrl;
    } else {
      // In production, use Vercel serverless function
      return `/api/image-proxy?url=${encodeURIComponent(originalImageUrl)}`;
    }
  });
}