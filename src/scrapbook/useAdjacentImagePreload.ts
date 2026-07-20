import { useEffect } from "react";

import type { ScrapbookPage } from "./pageModel";

const requestedSources = new Set<string>();
const inFlightImages = new Map<string, HTMLImageElement>();

function preloadImage(source: string) {
  if (requestedSources.has(source)) {
    return;
  }

  requestedSources.add(source);

  const image = new Image();
  const releaseImage = () => {
    inFlightImages.delete(source);
  };

  image.decoding = "async";

  if ("fetchPriority" in image) {
    image.fetchPriority = "low";
  }

  image.addEventListener("load", releaseImage, { once: true });
  image.addEventListener("error", releaseImage, { once: true });
  inFlightImages.set(source, image);
  image.src = source;
}

export function useAdjacentImagePreload(
  pages: readonly ScrapbookPage[],
  activePageIndex: number,
  radius: number,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled || pages.length === 0) {
      return;
    }

    const safeRadius = Math.max(0, Math.floor(radius));
    const firstIndex = Math.max(0, activePageIndex - safeRadius);
    const lastIndex = Math.min(
      pages.length - 1,
      activePageIndex + safeRadius,
    );
    const nearbySources = new Set<string>();

    for (let index = firstIndex; index <= lastIndex; index += 1) {
      const page = pages[index];

      if (page?.kind !== "contribution") {
        continue;
      }

      page.contribution.photos.forEach((photo) => {
        if (photo.src) {
          nearbySources.add(photo.src);
        }
      });
    }

    nearbySources.forEach(preloadImage);
  }, [activePageIndex, enabled, pages, radius]);
}
