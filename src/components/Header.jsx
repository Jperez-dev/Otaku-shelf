import { Link } from "react-router-dom";

export default function Header({ isDark, toggleDarkMode }) {
  return (
    <header className="w-full p-3">
      <div>
        <h1 className="text-2xl font-bold">MangaPlus</h1>
      </div>
    </header>
  );
}
