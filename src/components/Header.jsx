import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Header({ isDark, toggleDarkMode }) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = () => {
    const q = searchQuery.trim();
    navigate(q ? `/explore?q=${encodeURIComponent(q)}` : "/explore");
  };

  return (
    <header className="w-full bg-[#1a1a2e]/95 backdrop-blur-md border-b border-[#2a2a4e] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-[#c77dff] to-[#7209b7] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-[#c77dff]/25 transition-all duration-300">
                  <svg
                    className="w-6 h-6 text-white"
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
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-[8px] font-bold text-white">OS</span>
                </div>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#c77dff] to-[#7209b7] bg-clip-text text-transparent group-hover:from-[#d88fff] group-hover:to-[#8b2cc7] transition-all duration-300">
                Otaku Shelf
              </h1>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className="text-[#f2e9ff] hover:text-[#c77dff] transition-colors duration-300 font-medium"
              >
                Home
              </Link>
              <Link
                to="/whats-new"
                className="text-[#f2e9ff] hover:text-[#c77dff] transition-colors duration-300 font-medium"
              >
                Latest
              </Link>
              <Link
                to="/popular"
                className="text-[#f2e9ff] hover:text-[#c77dff] transition-colors duration-300 font-medium"
              >
                Popular
              </Link>
              <Link
                to="/bookmarks"
                className="text-[#f2e9ff] hover:text-[#c77dff] transition-colors duration-300 font-medium"
              >
                Bookmarks
              </Link>
            </nav>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8 hidden lg:block">
            <div
              className={`relative transition-all duration-300 ${
                isSearchFocused ? "transform scale-105" : ""
              }`}
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className={`w-5 h-5 transition-colors duration-300 ${
                    isSearchFocused ? "text-[#c77dff]" : "text-gray-400"
                  }`}
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
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearchSubmit();
                }}
                className={`w-full pl-10 pr-4 py-2 bg-[#2a2a4e] border rounded-full text-[#f2e9ff] placeholder-gray-400 focus:outline-none transition-all duration-300 ${
                  isSearchFocused
                    ? "border-[#c77dff] shadow-lg shadow-[#c77dff]/20"
                    : "border-[#3a3a5e] hover:border-[#4a4a6e]"
                }`}
                placeholder="Search manga..."
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Icon for Mobile */}
            <button onClick={handleSearchSubmit} className="lg:hidden p-2 text-[#f2e9ff] hover:text-[#c77dff] transition-colors duration-300">
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-[#f2e9ff] hover:text-[#c77dff] transition-colors duration-300"
            >
              {isDark ? (
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
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
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
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-[#f2e9ff] hover:text-[#c77dff] transition-colors duration-300"
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#2a2a4e] bg-[#1a1a2e]/95 backdrop-blur-md">
            <div className="px-4 py-2 space-y-1">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 text-[#f2e9ff] hover:text-[#c77dff] hover:bg-[#2a2a4e] rounded-lg transition-colors duration-300 font-medium"
              >
                Home
              </Link>
              <Link
                to="/whats-new"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 text-[#f2e9ff] hover:text-[#c77dff] hover:bg-[#2a2a4e] rounded-lg transition-colors duration-300 font-medium"
              >
                Latest
              </Link>
              <Link
                to="/popular"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 text-[#f2e9ff] hover:text-[#c77dff] hover:bg-[#2a2a4e] rounded-lg transition-colors duration-300 font-medium"
              >
                Popular
              </Link>
              <Link
                to="/bookmarks"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 text-[#f2e9ff] hover:text-[#c77dff] hover:bg-[#2a2a4e] rounded-lg transition-colors duration-300 font-medium"
              >
                Bookmarks
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
