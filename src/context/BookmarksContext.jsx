import { createContext, useContext, useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

const BookmarksContext = createContext();

export function BookmarksProvider({ children }) {
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const MAX_BOOKMARKS = 10;

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("bookmarkedMangaIds")) || [];
    setBookmarkedIds(stored);
  }, []);

  const toggleBookmark = useCallback((id) => {
    setBookmarkedIds((prev) => {
      const isBookmarked = prev.includes(id);
      
      if (isBookmarked) {
        // Remove bookmark
        const newList = prev.filter((bookmarkId) => bookmarkId !== id);
        localStorage.setItem("bookmarkedMangaIds", JSON.stringify(newList));
        
        // Custom toast for removal
        toast.success(
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-white">Removed from bookmarks</p>
              <p className="text-sm text-gray-300">Manga removed from your library</p>
            </div>
          </div>,
          {
            duration: 3000,
            style: {
              background: '#1a1a2e',
              border: '1px solid #2a2a4e',
              borderRadius: '12px',
              padding: '16px',
              color: 'white',
            },
          }
        );
        return newList;
      } else {
        // Add bookmark - check limit first
        if (prev.length >= MAX_BOOKMARKS) {
          // Custom toast for limit reached
          toast.error(
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-white">Bookmark limit reached</p>
                <p className="text-sm text-gray-300">You can only save up to {MAX_BOOKMARKS} manga. Remove some to add more.</p>
              </div>
            </div>,
            {
              duration: 4000,
              style: {
                background: '#1a1a2e',
                border: '1px solid #f59e0b',
                borderRadius: '12px',
                padding: '16px',
                color: 'white',
              },
            }
          );
          return prev; // Don't add, return current list
        }
        
        // Add new bookmark
        const newList = [...prev, id];
        localStorage.setItem("bookmarkedMangaIds", JSON.stringify(newList));
        
        // Custom toast for addition
        toast.success(
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-white">Added to bookmarks</p>
              <p className="text-sm text-gray-300">{newList.length}/{MAX_BOOKMARKS} manga saved</p>
            </div>
          </div>,
          {
            duration: 3000,
            style: {
              background: '#1a1a2e',
              border: '1px solid #10b981',
              borderRadius: '12px',
              padding: '16px',
              color: 'white',
            },
          }
        );
        return newList;
      }
    });
  }, [MAX_BOOKMARKS]);

  const isBookmarked = useCallback((id) => {
    return bookmarkedIds.includes(id);
  }, [bookmarkedIds]);

  const getBookmarkCount = useCallback(() => {
    return bookmarkedIds.length;
  }, [bookmarkedIds]);

  const canAddMore = useCallback(() => {
    return bookmarkedIds.length < MAX_BOOKMARKS;
  }, [bookmarkedIds.length]);

  const getMaxBookmarks = useCallback(() => {
    return MAX_BOOKMARKS;
  }, []);

  return (
    <BookmarksContext.Provider
      value={{
        bookmarkedIds,
        toggleBookmark,
        isBookmarked,
        getBookmarkCount,
        canAddMore,
        getMaxBookmarks,
      }}
    >
      {children}
    </BookmarksContext.Provider>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarksContext);
  if (!context) {
    throw new Error("useBookmarks must be used within a BookmarksProvider");
  }
  return context;
}


