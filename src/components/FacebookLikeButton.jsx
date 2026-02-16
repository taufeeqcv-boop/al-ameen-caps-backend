import { useState, useEffect } from "react";

const DESKTOP_URL =
  "https://www.facebook.com/plugins/like.php?href=https%3A%2F%2Fwww.facebook.com%2Fprofile.php%3Fid%3D61587066161054";
const MOBILE_DEEP_LINK = "fb://profile/61587066161054";

export default function FacebookLikeButton() {
  const [fbLink, setFbLink] = useState(DESKTOP_URL);

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      setFbLink(MOBILE_DEEP_LINK);
    }
  }, []);

  return (
    <div id="aac-automation-container">
      <a
        href={fbLink}
        target="_blank"
        rel="noopener noreferrer"
        className="aac-fb-button"
      >
        Like Al Ameen Caps
      </a>
    </div>
  );
}
