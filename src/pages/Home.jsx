import { useEffect } from "react";
import Hero from "../components/Hero";
import MangaPostSection from "../components/MangaPostSection";

export default function Home() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  return (
    <div className="w-full p-4 xmd:grid xmd:grid-cols-10 gap-6 xmd:pr-0">
      <div className="space-y-6 md:col-span-6 custom-breakpoint-7">
        <Hero />
        <MangaPostSection section="what's new" />
        <MangaPostSection section="want to read" />
        <MangaPostSection section="explore" />
      </div>
      <MangaPostSection section="popular" />
    </div>
  );
}
