import { useState } from "react";

// 9 chat/connection themed Unsplash photos — freely accessible, no API key needed.
// To swap any photo, replace the photo ID (the long string after /photo/) with any
// other Unsplash photo ID. Size & crop params are handled by the URL.
const COLLAGE_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=400&fit=crop&auto=format&q=80",
    alt: "Person on laptop chatting",
  },
  {
    src: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=400&fit=crop&auto=format&q=80",
    alt: "Team collaborating",
  },
  {
    src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=400&fit=crop&auto=format&q=80",
    alt: "Friends laughing with phones",
  },
  {
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=400&fit=crop&auto=format&q=80",
    alt: "People working together",
  },
  {
    src: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&h=400&fit=crop&auto=format&q=80",
    alt: "Group of friends",
  },
  {
    src: "https://images.unsplash.com/photo-1484807352052-23338990c6c6?w=400&h=400&fit=crop&auto=format&q=80",
    alt: "Person on phone smiling",
  },
  {
    src: "https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=400&fit=crop&auto=format&q=80",
    alt: "Two people chatting",
  },
  {
    src: "https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=400&h=400&fit=crop&auto=format&q=80",
    alt: "Person messaging on phone",
  },
  {
    src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&auto=format&q=80",
    alt: "Professional woman smiling",
  },
];

const AuthImagePattern = ({ title, subtitle }) => {
  const [loadedMap, setLoadedMap] = useState({});

  const handleLoad = (i) => setLoadedMap((prev) => ({ ...prev, [i]: true }));

  return (
    <div className="hidden lg:flex flex-col items-center justify-center bg-base-200 p-10 relative overflow-hidden">

      {/* Soft background glow behind the grid */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-base-200 to-secondary/5 pointer-events-none" />

      <div className="relative max-w-md w-full flex flex-col items-center gap-8">

        {/* ── Collage grid ── */}
        <div className="grid grid-cols-3 gap-2 w-full rounded-3xl overflow-hidden shadow-2xl ring-1 ring-base-300">
          {COLLAGE_IMAGES.map((img, i) => (
            <div
              key={i}
              className="relative aspect-square overflow-hidden group bg-base-300"
            >
              {/* Skeleton shimmer while image loads */}
              {!loadedMap[i] && (
                <div className="absolute inset-0 animate-pulse bg-base-300" />
              )}

              <img
                src={img.src}
                alt={img.alt}
                onLoad={() => handleLoad(i)}
                loading="lazy"
                className={`w-full h-full object-cover transition-all duration-500
                  group-hover:scale-110 group-hover:brightness-105
                  ${loadedMap[i] ? "opacity-100" : "opacity-0"}`}
              />

              {/* Primary tint overlay — fades out on hover */}
              <div className="absolute inset-0 bg-primary/15 group-hover:bg-primary/0 transition-colors duration-300" />

              {/* Subtle inner shadow for depth between tiles */}
              <div className="absolute inset-0 shadow-inner pointer-events-none" />
            </div>
          ))}
        </div>

        {/* ── Text ── */}
        <div className="text-center px-2">
          <h2 className="text-2xl font-bold mb-2 text-base-content">{title}</h2>
          <p className="text-base-content/60 text-sm leading-relaxed">{subtitle}</p>
        </div>

        {/* ── Decorative dots (echoes original pattern subtly) ── */}
        <div className="flex items-center gap-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`rounded-full bg-primary/40 transition-all duration-300 ${
                i === 1 ? "w-4 h-2" : "w-2 h-2"
              }`}
            />
          ))}
        </div>

      </div>
    </div>
  );
};

export default AuthImagePattern;