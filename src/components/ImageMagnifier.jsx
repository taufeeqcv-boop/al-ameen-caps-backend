import React, { useState, useRef, useCallback, useEffect } from "react";

const LENS_SIZE = 140;
const ZOOM_LEVEL = 2;

/**
 * Wraps a product image with object-contain (full product visible) and
 * a hover-to-zoom lens on desktop. Mobile: static image only.
 */
export default function ImageMagnifier({ src, alt, className = "", imgClassName = "" }) {
  const containerRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ w: 400, h: 400 });

  const updateSize = useCallback(() => {
    if (containerRef.current) {
      const { offsetWidth: w, offsetHeight: h } = containerRef.current;
      setSize((s) => (s.w !== w || s.h !== h ? { w, h } : s));
    }
  }, []);

  useEffect(() => {
    updateSize();
    const ro = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(updateSize)
      : null;
    if (ro && containerRef.current) ro.observe(containerRef.current);
    return () => ro?.disconnect?.();
  }, [updateSize]);

  const handleMouseMove = useCallback(
    (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMouse({ x, y });
    },
    []
  );

  const handleMouseEnter = useCallback(() => setHovering(true), []);
  const handleMouseLeave = useCallback(() => setHovering(false), []);

  const lensLeft = Math.max(0, Math.min(mouse.x - LENS_SIZE / 2, size.w - LENS_SIZE));
  const lensTop = Math.max(0, Math.min(mouse.y - LENS_SIZE / 2, size.h - LENS_SIZE));
  const bgW = size.w * ZOOM_LEVEL;
  const bgH = size.h * ZOOM_LEVEL;
  const bgX = -(mouse.x * ZOOM_LEVEL - LENS_SIZE / 2);
  const bgY = -(mouse.y * ZOOM_LEVEL - LENS_SIZE / 2);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src={src}
        alt={alt}
        loading="eager"
        width={600}
        height={600}
        className={`w-full h-full object-contain ${imgClassName}`}
        draggable={false}
      />
      {hovering && src && (
        <div
          className="hidden md:block absolute pointer-events-none rounded-full border-2 border-white/80 shadow-xl overflow-hidden"
          style={{
            width: LENS_SIZE,
            height: LENS_SIZE,
            left: lensLeft,
            top: lensTop,
          }}
        >
          <div
            className="absolute bg-no-repeat"
            style={{
              backgroundImage: `url(${src})`,
              backgroundSize: `${bgW}px ${bgH}px`,
              backgroundPosition: `${bgX}px ${bgY}px`,
              width: LENS_SIZE,
              height: LENS_SIZE,
              left: 0,
              top: 0,
            }}
          />
        </div>
      )}
    </div>
  );
}
