import { Link, useLocation } from "react-router-dom";

export default function DynamicBreadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  return (
    <nav className="text-sm text-gray-500 mb-4 pt-4 pl-4">
      <Link to="/" className="hover:underline">
        Home
      </Link>
      {segments.map((seg, i) => {
        const path = "/" + segments.slice(0, i + 1).join("/");
        return (
          <span key={path}>
            <span className="mx-1">›</span>
            <Link to={path} className="hover:underline capitalize">
              {decodeURIComponent(seg)}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
