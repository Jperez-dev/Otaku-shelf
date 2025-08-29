import { apiManga } from "../utils/axiosConfig";

// Build cover image URL from a manga object with relationships
export function getCoverUrl(manga) {
  const mangaId = manga.id;
  const coverRel = manga.relationships?.find((rel) => rel.type === "cover_art");
  const fileName = coverRel?.attributes?.fileName;
  return fileName
    ? `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.256.jpg`
    : "";
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
  if (!mangaIds || mangaIds.length === 0) {
    console.log('fetchStatisticsBatch: No manga IDs provided');
    return {};
  }
  
  try {
    const params = mangaIds
      .map((id) => `manga[]=${encodeURIComponent(id)}`)
      .join("&");
    console.log('fetchStatisticsBatch: Making request with params:', params);
    const res = await apiManga.get(`/statistics/manga?${params}`);
    
    console.log('fetchStatisticsBatch: Response received:', res.data);
    
    // Add defensive checks for the response structure
    if (!res.data) {
      console.warn('fetchStatisticsBatch: No response data');
      return {};
    }
    
    if (!res.data.statistics) {
      console.warn('fetchStatisticsBatch: No statistics in response:', res.data);
      return {};
    }
    
    console.log('fetchStatisticsBatch: Statistics found:', Object.keys(res.data.statistics).length, 'entries');
    return res.data.statistics || {};
  } catch (error) {
    console.error('fetchStatisticsBatch: Failed to fetch statistics batch:', error);
    console.error('fetchStatisticsBatch: Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
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
