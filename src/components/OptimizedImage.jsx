/**
 * OptimizedImage – same look, faster load.
 * Uses WebP when available (same path, .webp), explicit dimensions to avoid CLS,
 * and a short blur transition until loaded so the page doesn’t feel blank.
 */

import { useState } from "react";

/** Derive WebP URL from PNG/JPG path (e.g. /images/heritage/foo.png → /images/heritage/foo.webp). */
function webpUrl(src) {
  if (typeof src !== "string") return null;
  return src.replace(/\.(png|jpg|jpeg)$/i, ".webp");
}

/** True if src is a path we generate WebP for (collection or heritage). */
function canUseWebP(src) {
  return (
    typeof src === "string" &&
    /\.(png|jpg|jpeg)$/i.test(src) &&
    (src.includes("/collection/") || src.includes("/images/heritage/") || src.includes("alameencaps.com/collection") || src.includes("alameencaps.com/images/heritage"))
  );
}

export default function OptimizedImage({
  src,
  alt,
  className = "",
  imgClassName = "",
  width,
  height,
  loading = "lazy",
  onError,
  ...rest
}) {
  const [loaded, setLoaded] = useState(false);
  const usePicture = canUseWebP(src);
  const webp = usePicture ? webpUrl(src) : null;

  const style = {};
  if (width != null) style.width = typeof width === "number" ? `${width}px` : width;
  if (height != null) style.height = typeof height === "number" ? `${height}px` : height;

  const imgProps = {
    alt,
    loading,
    width: width != null ? (typeof width === "number" ? width : undefined) : undefined,
    height: height != null ? (typeof height === "number" ? height : undefined) : undefined,
    className: `w-full h-full object-cover object-center transition-[filter,opacity] duration-300 ${loaded ? "opacity-100 blur-0" : "opacity-90 blur-[6px]"} ${imgClassName}`.trim(),
    onLoad: () => setLoaded(true),
    onError,
    ...rest,
  };

  if (usePicture && webp) {
    return (
      <picture className={className} style={Object.keys(style).length ? style : undefined}>
        <source type="image/webp" srcSet={webp} />
        <img src={src} decoding="async" {...imgProps} />
      </picture>
    );
  }

  return (
    <img
      src={src}
      decoding="async"
      className={`${className} ${imgProps.className}`.trim()}
      style={Object.keys(style).length ? style : undefined}
      {...imgProps}
    />
  );
}
