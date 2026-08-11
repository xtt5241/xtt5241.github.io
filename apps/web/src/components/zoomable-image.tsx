"use client";

import Image from "next/image";
import { X, ZoomIn } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type ZoomableImageProps = {
  alt: string;
  eager: boolean;
  height: number;
  src: string;
  width: number;
};

export function ZoomableImage({ alt, eager, height, src, width }: ZoomableImageProps) {
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        aria-label={alt ? `放大查看：${alt}` : "放大查看文章图片"}
        className="prose-media__trigger"
        onClick={() => setOpen(true)}
        title="放大查看图片"
        type="button"
      >
        <Image
          alt={alt}
          className="prose-media__image"
          height={height}
          loading={eager ? "eager" : "lazy"}
          quality={90}
          sizes="(max-width: 760px) calc(100vw - 32px), 760px"
          src={src}
          width={width}
        />
        <span aria-hidden="true" className="prose-media__zoom-icon">
          <ZoomIn size={18} strokeWidth={1.8} />
        </span>
      </button>

      {open && createPortal(
        <div
          aria-label="图片预览"
          aria-modal="true"
          className="image-lightbox"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
          role="dialog"
        >
          <button
            aria-label="关闭图片预览"
            className="image-lightbox__close"
            onClick={() => setOpen(false)}
            ref={closeButtonRef}
            title="关闭"
            type="button"
          >
            <X size={24} strokeWidth={1.8} />
          </button>
          <Image
            alt={alt}
            className="image-lightbox__image"
            height={height}
            src={src}
            unoptimized
            width={width}
          />
        </div>,
        document.body,
      )}
    </>
  );
}
