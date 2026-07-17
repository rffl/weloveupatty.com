import { useEffect, useState } from "react";

import type { ContributionPhoto } from "../content/types";

export type PhotoFrameVariant =
  | "polaroid"
  | "snapshot"
  | "photobooth"
  | "film"
  | "postcard";

type PhotoFrameProps = {
  readonly photo: ContributionPhoto;
  readonly variant?: PhotoFrameVariant;
  readonly className?: string;
  readonly eager?: boolean;
};

export function PhotoFrame({
  photo,
  variant = "polaroid",
  className = "",
  eager = false,
}: PhotoFrameProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [photo.src]);

  const showImage = Boolean(photo.src) && !failed;

  return (
    <figure
      className={`photo-frame photo-frame--${variant} ${className}`.trim()}
    >
      <div className="photo-frame__image-wrap">
        {showImage ? (
          <img
            alt={photo.alt}
            decoding="async"
            loading={eager ? "eager" : "lazy"}
            onError={() => setFailed(true)}
            src={photo.src ?? undefined}
            style={{
              objectPosition: `center ${photo.focalPoint ?? "center"}`,
            }}
          />
        ) : (
          <div
            aria-label={photo.alt}
            className="photo-frame__placeholder"
            role="img"
          >
            <span aria-hidden="true" className="photo-frame__placeholder-star">
              ✦
            </span>
            <strong>Photo goes here</strong>
            <small>Suggested photo: {photo.alt}</small>
          </div>
        )}
      </div>

      {photo.caption ? <figcaption>{photo.caption}</figcaption> : null}
    </figure>
  );
}
