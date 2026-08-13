"use client";

import { useState } from "react";
import { Car } from "lucide-react";
import { ImageLightbox } from "@/components/marketing/ImageLightbox";

interface Props {
  photos: { url: string }[];
  alt: string;
}

// Previously: a static main image plus a row of thumbnails that did
// nothing when clicked, and no way to see a photo larger than the fixed
// 320px box. Now: thumbnails actually swap the main photo, and clicking
// the main photo opens the same full-size lightbox used on vehicle listings.
export function SourcingListingGallery({ photos, alt }: Props) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (photos.length === 0) {
    return (
      <div className="v-card-img" style={{ height: 320, borderRadius: 14, marginBottom: 16 }}>
        <Car size={64} strokeWidth={1.25} />
      </div>
    );
  }

  return (
    <>
      <div className="v-card-img" style={{ height: 320, borderRadius: 14, marginBottom: 16 }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- pasted external auction-photo URL */}
        <img
          src={photos[index].url}
          alt={alt}
          onClick={() => setLightboxOpen(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "zoom-in" }}
        />
      </div>
      {photos.length > 1 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 24, overflowX: "auto" }}>
          {photos.map((photo, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- pasted external auction-photo URL
            <img
              key={i}
              src={photo.url}
              alt=""
              onClick={() => setIndex(i)}
              style={{
                width: 90,
                height: 68,
                objectFit: "cover",
                borderRadius: 8,
                flexShrink: 0,
                cursor: "pointer",
                border: i === index ? "2px solid var(--blue)" : "2px solid transparent",
              }}
            />
          ))}
        </div>
      )}

      {lightboxOpen && (
        <ImageLightbox
          urls={photos.map((p) => p.url)}
          index={index}
          alt={alt}
          onClose={() => setLightboxOpen(false)}
          onIndexChange={setIndex}
        />
      )}
    </>
  );
}
