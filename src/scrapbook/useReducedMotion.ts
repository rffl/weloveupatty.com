import { useEffect, useState } from "react";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function readReducedMotion(): boolean {
  return window.matchMedia(reducedMotionQuery).matches;
}

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(readReducedMotion);

  useEffect(() => {
    const media = window.matchMedia(reducedMotionQuery);
    const update = () => setReducedMotion(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reducedMotion;
}
