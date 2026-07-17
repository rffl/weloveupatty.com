import { useId } from "react";
import type { CSSProperties } from "react";

import { Decoration } from "../components/Decoration";
import { OpenableNote } from "../components/OpenableNote";
import { PhotoFrame } from "../components/PhotoFrame";
import type { Contribution } from "../content/types";
import type {
  LayoutRecipe,
  PiecePlacement,
  ResponsiveMode,
} from "./types";

type ContributionLayoutProps = {
  readonly contribution: Contribution;
  readonly recipe: LayoutRecipe;
  readonly mode: ResponsiveMode;
  readonly eagerPhotos?: boolean;
};

type PieceStyle = CSSProperties & {
  "--piece-rotation": string;
  "--rotation": string;
  "--piece-z": number;
};

function pieceStyle(placement: PiecePlacement): PieceStyle {
  const rotation = `${placement.rotate ?? 0}deg`;

  return {
    top: placement.top,
    right: placement.right,
    bottom: placement.bottom,
    left: placement.left,
    width: placement.width,
    height: placement.height,
    "--piece-rotation": rotation,
    "--rotation": rotation,
    "--piece-z": placement.z ?? 1,
  };
}

const surfaceClasses = {
  paper: "paper-surface",
  light: "paper-surface paper-surface--light",
  graph: "paper-surface paper-surface--graph",
  kraft: "paper-surface paper-surface--kraft",
  black: "paper-surface paper-surface--black",
} as const;

export function ContributionLayout({
  contribution,
  recipe,
  mode,
  eagerPhotos = false,
}: ContributionLayoutProps) {
  const nameId = useId();

  return (
    <article
      aria-labelledby={nameId}
      className={`contribution-layout ${surfaceClasses[recipe.surface]}`}
      data-accent={contribution.accent}
      data-layout={recipe.id}
    >
      <div
        className="contribution-piece contribution-piece--name"
        style={pieceStyle(recipe.namePlacement[mode])}
      >
        <span className="contribution-name__from">from</span>
        <h2 className="contribution-name" id={nameId}>
          {contribution.friendName}
        </h2>
      </div>

      {recipe.photos.map((piece, index) => {
        const photo =
          contribution.photos[piece.photoIndex] ?? contribution.photos[0];

        return (
          <div
            className="contribution-piece contribution-piece--photo"
            key={`${contribution.id}-photo-${index}`}
            style={pieceStyle(piece.placement[mode])}
          >
            <PhotoFrame
              eager={eagerPhotos}
              photo={photo}
              variant={piece.variant}
            />
          </div>
        );
      })}

      <div
        className="contribution-piece contribution-piece--message"
        style={pieceStyle(recipe.message.placement[mode])}
      >
        <OpenableNote
          detail={contribution.melbourneDetail}
          message={contribution.message}
          title={contribution.friendName}
          variant={recipe.message.variant}
        />
      </div>

      {recipe.decorations.map((piece, index) => (
        <Decoration
          className="contribution-piece contribution-piece--decoration"
          key={`${contribution.id}-decoration-${index}`}
          kind={piece.kind}
          label={piece.label}
          style={pieceStyle(piece.placement[mode])}
        />
      ))}
    </article>
  );
}
