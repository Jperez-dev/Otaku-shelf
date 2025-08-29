export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#2a1b3d] via-[#3d2a5c] to-[#2a1b3d] border-t border-purple-400/30 px-4 py-8">
      <div className="max-w-screen-lg mx-auto">
        <div className="text-center space-y-4">
          {/* Footer Info */}
          <div className="space-y-2">
            <p className="text-purple-200 text-sm font-bold drop-shadow-[1px_1px_2px_rgba(0,0,0,0.8)]">
              © 2025 Otaku Shelf. All rights reserved.
            </p>
            <p className="text-purple-200 text-sm flex items-center justify-center space-x-1 font-bold drop-shadow-[1px_1px_2px_rgba(0,0,0,0.8)]">
              <span>Built with</span>
              <span className="text-pink-400">❤️</span>
              <span>by Soma – MVP v1.0</span>
            </p>
            <p className="text-purple-200 text-sm font-bold drop-shadow-[1px_1px_2px_rgba(0,0,0,0.8)]">
              Manga data powered by{" "}
              <a
                href="https://mangadex.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-300 hover:text-pink-300 font-bold hover:underline transition-colors duration-200 drop-shadow-[1px_1px_2px_rgba(0,0,0,0.8)]"
              >
                MangaDex API
              </a>
            </p>

            <p className="text-purple-200/70 text-xs font-medium drop-shadow-[1px_1px_2px_rgba(0,0,0,0.8)] max-w-md mx-auto">
              All manga content, images, and metadata belong to their respective
              copyright holders. This project does not host or distribute any
              manga content directly.
            </p>

            <p className="text-purple-200/60 text-xs font-medium drop-shadow-[1px_1px_2px_rgba(0,0,0,0.8)] max-w-md mx-auto">
              This project is for personal and educational use only.
            </p>
          </div>
        </div>
      </div>

      {/* Subtle bottom accent - matches app's purple/pink theme */}
      <div className="mt-6 h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400"></div>
    </footer>
  );
}
