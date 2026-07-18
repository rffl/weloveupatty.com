import type { LayoutRecipe } from "../types";

export const stickyNotes = {
  id: "sticky-notes",
  surface: "graph",
  namePlacement: {
    desktop: { top: "6%", right: "7%", width: "43%", rotate: 4, z: 9 },
    mobile: { top: "5%", right: "6%", width: "59%", rotate: 4, z: 9 },
  },
  photos: [
    {
      photoIndex: 0,
      variant: "snapshot",
      placement: {
        desktop: { top: "13%", left: "6%", width: "49%", height: "37%", rotate: -6, z: 5 },
        mobile: { top: "15%", left: "5%", width: "61%", height: "30%", rotate: -6, z: 5 },
      },
    },
    {
      photoIndex: 1,
      variant: "polaroid",
      captionLayer: "lifted",
      placement: {
        desktop: { top: "27%", right: "6%", width: "40%", height: "33%", rotate: 7, z: 6 },
        mobile: { top: "28%", right: "5%", width: "45%", height: "25%", rotate: 7, z: 6 },
      },
    },
  ],
  message: {
    variant: "sticky",
    placement: {
      desktop: { bottom: "9%", left: "16%", width: "62%", height: "37%", rotate: -3, z: 7 },
      mobile: { bottom: "9%", left: "10%", width: "79%", height: "40%", rotate: -3, z: 7 },
    },
  },
  decorations: [
    {
      kind: "tape",
      placement: {
        desktop: { top: "11%", left: "20%", width: "20%", rotate: -1, z: 10 },
        mobile: { top: "13%", left: "21%", width: "25%", rotate: -1, z: 10 },
      },
    },
    {
      kind: "heart",
      placement: {
        desktop: { bottom: "4%", right: "7%", width: "11%", rotate: 8, z: 9 },
        mobile: { bottom: "3%", right: "5%", width: "13%", rotate: 8, z: 9 },
      },
    },
    {
      kind: "doodle",
      label: "remember this bit! ↗",
      placement: {
        desktop: { top: "53%", left: "5%", width: "31%", rotate: -8, z: 8 },
        mobile: { top: "48%", left: "4%", width: "39%", rotate: -8, z: 8 },
      },
    },
  ],
} as const satisfies LayoutRecipe;
