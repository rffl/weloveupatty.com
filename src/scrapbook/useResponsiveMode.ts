import { useEffect, useState } from "react";

import type { ResponsiveMode } from "../layouts/types";

export const desktopMediaQuery = "(min-width: 900px)";

function readMode(): ResponsiveMode {
  return window.matchMedia(desktopMediaQuery).matches ? "desktop" : "mobile";
}

export function useResponsiveMode(): ResponsiveMode {
  const [mode, setMode] = useState<ResponsiveMode>(readMode);

  useEffect(() => {
    const media = window.matchMedia(desktopMediaQuery);
    const update = () => setMode(media.matches ? "desktop" : "mobile");

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return mode;
}
