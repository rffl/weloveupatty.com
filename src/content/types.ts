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

export const recipeDecorationLabelKeys = [
  "mapFoldoutDoodle",
  "foldedLetterStamp",
  "finalLoveLetterStamp",
  "tramTicketPass",
  "tramTicketDoodle",
  "stickyNotesDoodle",
  "coffeeReceiptOrder",
  "coffeeReceiptDoodle",
  "airmailEnvelopeStamp",
  "airmailEnvelopeRoute",
  "filmNegativeDoodle",
  "diaryEntryDoodle",
  "postcardStamp",
  "postcardDoodle",
  "tornNotebookDoodle",
  "eventTicketAdmission",
  "eventTicketStamp",
  "photoboothDoodle",
] as const;

export type RecipeDecorationLabelKey =
  (typeof recipeDecorationLabelKeys)[number];
export type RecipeDecorationLabels = Readonly<
  Record<RecipeDecorationLabelKey, string>
>;

export type ContributionPhoto = {
  readonly src: string | null;
  readonly alt: string;
  readonly caption?: string;
  readonly focalPoint?: PhotoFocalPoint;
};

export type Contribution = {
  readonly id: string;
  readonly friendName: string;
  readonly message: string;
  readonly photos: readonly [ContributionPhoto, ...ContributionPhoto[]];
  readonly layout: ContributionLayout;
  readonly accent: ContributionAccent;
  readonly melbourneDetail?: string;
  readonly location?: string;
  readonly year?: string;
};

export type ScrapbookContent = {
  readonly title: string;
  readonly subtitle: string;
  readonly metadata: {
    readonly description: string;
  };
  readonly cover: {
    readonly eyebrow: string;
    readonly stamp: string;
    readonly insideMaker: string;
    readonly insideDedication: string;
    readonly insideFooter: string;
  };
  readonly opening: {
    readonly eyebrow: string;
    readonly title: string;
    readonly message: string;
    readonly stamp: string;
    readonly doodle: string;
    readonly route: readonly [string, string, string];
  };
  readonly closing: {
    readonly eyebrow: string;
    readonly title: string;
    readonly message: string;
    readonly signature: string;
    readonly postscript: string;
  };
  readonly tableScatter: {
    readonly tramTicket: string;
    readonly pencil: string;
  };
  readonly recipeDecorationLabels: RecipeDecorationLabels;
  readonly contributions: readonly Contribution[];
};
