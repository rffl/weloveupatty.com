import type { DecorationKind } from "../components/Decoration";
import type { NoteVariant } from "../components/OpenableNote";
import type { PhotoFrameVariant } from "../components/PhotoFrame";
import type { ContributionLayout } from "../content/types";

export type ResponsiveMode = "desktop" | "mobile";
export type PageSurface = "paper" | "light" | "graph" | "kraft" | "black";

export type PiecePlacement = Readonly<{
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  width: string;
  height?: string;
  rotate?: number;
  z?: number;
}>;

export type PhotoPlacement = PiecePlacement &
  Readonly<{
    height: string;
  }>;

export type ResponsivePlacement = Readonly<{
  desktop: PiecePlacement;
  mobile: PiecePlacement;
}>;

export type ResponsivePhotoPlacement = Readonly<{
  desktop: PhotoPlacement;
  mobile: PhotoPlacement;
}>;

export type PhotoPiece = Readonly<{
  photoIndex: number;
  variant: PhotoFrameVariant;
  captionLayer?: "lifted";
  placement: ResponsivePhotoPlacement;
}>;

export type MessagePiece = Readonly<{
  variant: NoteVariant;
  placement: ResponsivePlacement;
}>;

export type DecorationPiece = Readonly<{
  kind: DecorationKind;
  label?: string;
  placement: ResponsivePlacement;
}>;

export type LayoutRecipe = Readonly<{
  id: ContributionLayout;
  surface: PageSurface;
  namePlacement: ResponsivePlacement;
  photos: readonly [PhotoPiece, ...PhotoPiece[]];
  message: MessagePiece;
  decorations: readonly DecorationPiece[];
}>;
