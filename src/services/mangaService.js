import { apiManga } from "../utils/axiosConfig";

// Build cover image URL from a manga object with relationships
export function getCoverUrl(manga) {
  const mangaId = manga.id;
  const coverRel = manga.relationships?.find((rel) => rel.type === "cover_art");
  const fileName = coverRel?.attributes?.fileName;
  
  // Debug logging for deployment issues
  if (!fileName) {
    console.warn('No cover filename found for manga:', mangaId);
  }
  
  return fileName
    ? `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.256.jpg`
    : getFallbackCoverUrl();
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
    const res = await apiManga.get(`/statistics/manga?${params}`);
    return res.data?.statistics || {};
  } catch (error) {
    console.error('Failed to fetch statistics batch:', error);
    return {};
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
    console.error('Failed to fetch popular manga:', error);
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
      console.warn('Failed to fetch statistics for manga:', id, statsError);
      stats = {};
    }
    
    return { manga, stats };
  } catch (error) {
    console.error('Failed to fetch manga detail:', error);
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
    `/chapter?manga=${mangaId}&limit=${limit}&offset=${offset}${langParams}&order[${orderKey}]=desc`;
  const langQuery = (arr) =>
    arr.map((l) => `&translatedLanguage[]=${encodeURIComponent(l)}`).join("");

  // Attempt with requested languages (default English only)
  let res = await apiManga.get(buildUrl(langQuery(languages)));
  let data = res.data?.data || [];
  const total = res.data?.total ?? data.length;
  if (data.length > 0 || !allowFallbackAnyLanguage)
    return { list: data, total };

  // Optional fallback: any language
  res = await apiManga.get(buildUrl(""));
  data = res.data?.data || [];
  return { list: data, total: res.data?.total ?? data.length };
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
  return files.map(
    (file) =>
      `${baseUrl}/${useDataSaver ? "data-saver" : "data"}/${
        chapter.hash
      }/${file}`
  );
}