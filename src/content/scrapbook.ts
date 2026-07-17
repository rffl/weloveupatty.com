import type { ContributionPhoto, ScrapbookContent } from "./types";

function photo(
  friendNumber: number,
  photoNumber: number,
  overrides: Partial<ContributionPhoto> = {},
): ContributionPhoto {
  const friend = String(friendNumber).padStart(2, "0");
  const item = String(photoNumber).padStart(2, "0");

  return {
    src: null,
    alt: `Replace with photo ${item} of Friend ${friend} together with Patty`,
    caption: `Replace with a caption for photo ${item}`,
    focalPoint: "center",
    ...overrides,
  };
}

export const scrapbook = {
  title: "We Love You, Patty",
  subtitle: "Four years in Melbourne, and a lifetime of people who love you.",
  opening: {
    eyebrow: "Melbourne · four unforgettable years",
    title: "This city was better with you in it.",
    message:
      "Fifteen friends left you photographs, memories, wishes, and little pieces of Melbourne. Turn the pages slowly — this was made with all our love.",
  },
  closing: {
    title: "Never really goodbye.",
    message:
      "Melbourne will always carry traces of you, and every one of us carries a piece of the life we shared here. Wherever you go next, you take our love with you.",
    signature: "All of us, always",
  },
  contributions: [
    {
      id: "friend-01",
      friendName: "Friend 01",
      message:
        "Replace this with Friend 01's personal wish, shared memory, or farewell message for Patty.",
      photos: [photo(1, 1), photo(1, 2), photo(1, 3)],
      layout: "map-foldout",
      accent: "tram-blue",
      melbourneDetail: "Our Melbourne map",
      location: "Melbourne CBD",
      year: "2022–2026",
    },
    {
      id: "friend-02",
      friendName: "Friend 02",
      message:
        "Replace this with Friend 02's personal wish, shared memory, or farewell message for Patty.",
      photos: [photo(2, 1), photo(2, 2)],
      layout: "taped-polaroids",
      accent: "postmark-red",
      melbourneDetail: "One perfect Melbourne day",
    },
    {
      id: "friend-03",
      friendName: "Friend 03",
      message:
        "Replace this with Friend 03's longer handwritten-letter message for Patty.",
      photos: [photo(3, 1)],
      layout: "folded-letter",
      accent: "eucalyptus",
      melbourneDetail: "Keep this letter",
    },
    {
      id: "friend-04",
      friendName: "Friend 04",
      message:
        "Replace this with Friend 04's personal wish, shared memory, or farewell message for Patty.",
      photos: [photo(4, 1), photo(4, 2)],
      layout: "airmail-envelope",
      accent: "tram-blue",
      melbourneDetail: "MEL → wherever comes next",
    },
    {
      id: "friend-05",
      friendName: "Friend 05",
      message:
        "Replace this with Friend 05's personal wish, shared memory, or farewell message for Patty.",
      photos: [photo(5, 1), photo(5, 2)],
      layout: "torn-notebook",
      accent: "ticket-mustard",
      melbourneDetail: "A page from the best years",
    },
    {
      id: "friend-06",
      friendName: "Friend 06",
      message:
        "Replace this with Friend 06's personal wish, shared memory, or farewell message for Patty.",
      photos: [photo(6, 1), photo(6, 2), photo(6, 3)],
      layout: "photobooth-strip",
      accent: "postmark-red",
      melbourneDetail: "Three frames, too many laughs",
    },
    {
      id: "friend-07",
      friendName: "Friend 07",
      message:
        "Replace this with Friend 07's personal wish, shared memory, or farewell message for Patty.",
      photos: [photo(7, 1), photo(7, 2)],
      layout: "tram-ticket",
      accent: "tram-blue",
      melbourneDetail: "Tram 86 · valid forever",
    },
    {
      id: "friend-08",
      friendName: "Friend 08",
      message:
        "Replace this with Friend 08's personal wish, shared memory, or farewell message for Patty.",
      photos: [photo(8, 1), photo(8, 2)],
      layout: "coffee-receipt",
      accent: "ticket-mustard",
      melbourneDetail: "Two flat whites and one very long chat",
    },
    {
      id: "friend-09",
      friendName: "Friend 09",
      message:
        "Replace this with Friend 09's postcard message and favourite Melbourne memory with Patty.",
      photos: [photo(9, 1)],
      layout: "postcard",
      accent: "postmark-red",
      melbourneDetail: "Wish you could stay",
    },
    {
      id: "friend-10",
      friendName: "Friend 10",
      message:
        "Replace this with Friend 10's personal wish, shared memory, or farewell message for Patty.",
      photos: [photo(10, 1), photo(10, 2)],
      layout: "pressed-flower",
      accent: "eucalyptus",
      melbourneDetail: "A little piece of spring",
    },
    {
      id: "friend-11",
      friendName: "Friend 11",
      message:
        "Replace this with Friend 11's personal wish, shared memory, or farewell message for Patty.",
      photos: [photo(11, 1), photo(11, 2), photo(11, 3)],
      layout: "film-negative",
      accent: "tram-blue",
      melbourneDetail: "The moments between the moments",
    },
    {
      id: "friend-12",
      friendName: "Friend 12",
      message:
        "Replace this with Friend 12's personal wish, shared memory, or farewell message for Patty.",
      photos: [photo(12, 1), photo(12, 2)],
      layout: "sticky-notes",
      accent: "ticket-mustard",
      melbourneDetail: "Things we never want to forget",
    },
    {
      id: "friend-13",
      friendName: "Friend 13",
      message:
        "Replace this with Friend 13's diary-style memory and farewell message for Patty.",
      photos: [photo(13, 1), photo(13, 2)],
      layout: "diary-entry",
      accent: "eucalyptus",
      melbourneDetail: "Dear diary: Patty made today better",
    },
    {
      id: "friend-14",
      friendName: "Friend 14",
      message:
        "Replace this with Friend 14's personal wish, shared memory, or farewell message for Patty.",
      photos: [photo(14, 1), photo(14, 2)],
      layout: "event-ticket",
      accent: "postmark-red",
      melbourneDetail: "Admit two · one unforgettable night",
    },
    {
      id: "friend-15",
      friendName: "Friend 15",
      message:
        "Replace this with Friend 15's final love-letter contribution and farewell wish for Patty.",
      photos: [photo(15, 1), photo(15, 2)],
      layout: "final-love-letter",
      accent: "tram-blue",
      melbourneDetail: "Open whenever you miss us",
    },
  ],
} as const satisfies ScrapbookContent;
