"use client";

import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  urls: string[];
  index: number;
  alt: string;
  onClose: () => void;
  onIndexChange: (i: number) => void;
}

// Full-size photo viewer — the vehicle detail modal and sourcing listing
// pages both showed a small fixed-height image with no way to actually see
// it at real size. Shared here since both places have the same gap.
export function ImageLightbox({ urls, index, alt, onClose, onIndexChange }: Props) {
  const go = (delta: number) => onIndexChange((index + delta + urls.length) % urls.length);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, urls.length]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 400,
        background: "rgba(6,10,14,.94)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "rgba(255,255,255,.1)",
          color: "#fff",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <X size={20} strokeWidth={2} />
      </button>

      {urls.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            go(-1);
          }}
          aria-label="Previous photo"
          style={{
            position: "absolute",
            left: 16,
            top: "50%",
            transform: "translateY(-50%)",
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "rgba(255,255,255,.1)",
            color: "#fff",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <ChevronLeft size={22} strokeWidth={2} />
        </button>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element -- external Supabase Storage / pasted auction-photo URL */}
      <img
        src={urls[index]}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "92vw", maxHeight: "86vh", objectFit: "contain", borderRadius: 8, display: "block" }}
      />

      {urls.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            aria-label="Next photo"
            style={{
              position: "absolute",
              right: 16,
              top: "50%",
              transform: "translateY(-50%)",
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "rgba(255,255,255,.1)",
              color: "#fff",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <ChevronRight size={22} strokeWidth={2} />
          </button>
          <div
            style={{
              position: "absolute",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              color: "#C0D0E0",
              fontSize: 13,
              fontWeight: 600,
              background: "rgba(255,255,255,.08)",
              borderRadius: 20,
              padding: "6px 14px",
            }}
          >
            {index + 1} / {urls.length}
          </div>
        </>
      )}
    </div>
  );
}
