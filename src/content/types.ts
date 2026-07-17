export const layoutIds = [
  "map-foldout",
  "taped-polaroids",
  "folded-letter",
  "airmail-envelope",
  "torn-notebook",
  "photobooth-strip",
  "tram-ticket",
  "coffee-receipt",
  "postcard",
  "pressed-flower",
  "film-negative",
  "sticky-notes",
  "diary-entry",
  "event-ticket",
  "final-love-letter",
] as const;

export type ContributionLayout = (typeof layoutIds)[number];

export const accentIds = [
  "tram-blue",
  "postmark-red",
  "ticket-mustard",
  "eucalyptus",
] as const;

export type ContributionAccent = (typeof accentIds)[number];
export type PhotoFocalPoint = "top" | "center" | "bottom";

export type ContributionPhoto = {
  src: string | null;
  alt: string;
  caption?: string;
  focalPoint?: PhotoFocalPoint;
};

export type Contribution = {
  id: string;
  friendName: string;
  message: string;
  photos: readonly [ContributionPhoto, ...ContributionPhoto[]];
  layout: ContributionLayout;
  accent: ContributionAccent;
  melbourneDetail?: string;
  location?: string;
  year?: string;
};

export type ScrapbookContent = {
  title: string;
  subtitle: string;
  opening: {
    eyebrow: string;
    title: string;
    message: string;
  };
  closing: {
    title: string;
    message: string;
    signature: string;
  };
  contributions: readonly Contribution[];
};
