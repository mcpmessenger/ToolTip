import React, { useRef, useState } from 'react';

interface ImagePreviewTooltipProps {
  children: React.ReactNode;
  imageSrc: string;
  alt?: string;
}

const ImagePreviewTooltip: React.FC<ImagePreviewTooltipProps> = ({ children, imageSrc, alt = 'Preview' }) => {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [placeAbove, setPlaceAbove] = useState(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);

  const recomputePosition = () => {
    const MAX_W = 360; // px
    const MAX_H = 220; // px
    const MARGIN = 10; // px
    const rect = anchorRef.current?.getBoundingClientRect();
    if (!rect) return;
    const spaceBelow = window.innerHeight - rect.bottom;
    const shouldPlaceAbove = spaceBelow < MAX_H + MARGIN;
    setPlaceAbove(shouldPlaceAbove);
    const centerX = rect.left + rect.width / 2;
    const left = Math.max(8, Math.min(centerX - MAX_W / 2, window.innerWidth - MAX_W - 8));
    const top = shouldPlaceAbove ? Math.max(8, rect.top - MAX_H - MARGIN) : Math.min(window.innerHeight - MAX_H - 8, rect.bottom + MARGIN);
    setPos({ top, left });
  };

  return (
    <div
      ref={anchorRef}
      className="relative inline-block"
      onMouseEnter={() => { setShow(true); recomputePosition(); }}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && pos && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ top: pos.top, left: pos.left }}
        >
          <div className="rounded-lg overflow-hidden border border-gray-800 shadow-xl bg-black/70 backdrop-blur">
            <img
              src={imageSrc}
              alt={alt}
              className="block max-w-[360px] max-h-[220px] object-cover"
              onLoad={recomputePosition}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagePreviewTooltip;


