import { useEffect, useState } from "react";
import api from "../utils/axiosConfig";

export default function Hero() {
  const [manga, setManga] = useState("");
  const mangaId = "b0b721ff-c388-4486-aa0f-c2b0bb321512";
  useEffect(() => {
    const getHeroDetails = async () => {
      try {
        const res = await api.get(
          `/${mangaId}?includes[]=cover_art&includes[]=author`
        );
        setManga(res.data.data);
      } catch (error) {
        console.log("API error:", error);
      }
    };

    getHeroDetails();
  }, []);

  if (!manga) return <p className="text-center">Loading image...</p>;

  // Title and description
  const title = manga.attributes.title.en || "Untitled";
  const author = manga.relationships[0].attributes?.name || "No Author";
  const coverUrl = "https://w.wallhaven.cc/full/2y/wallhaven-2yjg26.jpg";
  return (
    <section className="w-full">
      <div className="w-full p-[2px] bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-xl">
        <div className="relative w-full max-w-xl aspect-video rounded-xl overflow-hidden">
          <img
            src={coverUrl}
            alt="Hero Manga Cover"
            className="absolute top-0 left-0 w-full h-full object-cover"
          />
          <div className="w-full absolute bottom-[3vw] left-[3vw]">
            <h1 className="text-red-500 text-[clamp(0.8rem,6vw,2rem)] font-bold font-[Libertinus_Mono]">
              {title}
            </h1>
            <h3 className="text-[clamp(0.5rem,4vw,1.2rem) font-[Roboto]">
              {author}
            </h3>
          </div>
        </div>
      </div>
    </section>
  );
}
