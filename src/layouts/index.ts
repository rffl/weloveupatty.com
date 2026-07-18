import type { ContributionLayout as ContributionLayoutId } from "../content/types";
import { airmailEnvelope } from "./recipes/airmailEnvelope";
import { coffeeReceipt } from "./recipes/coffeeReceipt";
import { diaryEntry } from "./recipes/diaryEntry";
import { eventTicket } from "./recipes/eventTicket";
import { filmNegative } from "./recipes/filmNegative";
import { finalLoveLetter } from "./recipes/finalLoveLetter";
import { foldedLetter } from "./recipes/foldedLetter";
import { mapFoldout } from "./recipes/mapFoldout";
import { photoboothStrip } from "./recipes/photoboothStrip";
import { postcard } from "./recipes/postcard";
import { pressedFlower } from "./recipes/pressedFlower";
import { stickyNotes } from "./recipes/stickyNotes";
import { tapedPolaroids } from "./recipes/tapedPolaroids";
import { tornNotebook } from "./recipes/tornNotebook";
import { tramTicket } from "./recipes/tramTicket";
import type { LayoutRecipe } from "./types";

export const layoutRecipes = {
  "map-foldout": mapFoldout,
  "taped-polaroids": tapedPolaroids,
  "folded-letter": foldedLetter,
  "airmail-envelope": airmailEnvelope,
  "torn-notebook": tornNotebook,
  "photobooth-strip": photoboothStrip,
  "tram-ticket": tramTicket,
  "coffee-receipt": coffeeReceipt,
  postcard,
  "pressed-flower": pressedFlower,
  "film-negative": filmNegative,
  "sticky-notes": stickyNotes,
  "diary-entry": diaryEntry,
  "event-ticket": eventTicket,
  "final-love-letter": finalLoveLetter,
} satisfies Record<ContributionLayoutId, LayoutRecipe>;

export function getLayoutRecipe(layout: ContributionLayoutId): LayoutRecipe {
  return layoutRecipes[layout] ?? tornNotebook;
}
