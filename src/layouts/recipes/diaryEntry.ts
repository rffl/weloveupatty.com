import type { LayoutRecipe } from "../types";

export const diaryEntry = {
  id: "diary-entry",
  surface: "paper",
  namePlacement: {
    desktop: { top: "6%", left: "11%", width: "43%", rotate: -2, z: 9 },
    mobile: { top: "5%", left: "11%", width: "60%", rotate: -2, z: 9 },
  },
  photos: [
    {
      photoIndex: 0,
      variant: "polaroid",
      placement: {
        desktop: { top: "13%", right: "7%", width: "43%", height: "35%", rotate: 6, z: 6 },
        mobile: { top: "15%", right: "5%", width: "56%", height: "29%", rotate: 6, z: 6 },
      },
    },
    {
      photoIndex: 1,
      variant: "snapshot",
      captionLayer: { position: "top" },
      placement: {
        desktop: { top: "25%", left: "10%", width: "38%", height: "29%", rotate: -6, z: 5 },
        mobile: { top: "27%", left: "6%", width: "43%", height: "23%", rotate: -6, z: 5 },
      },
    },
  ],
  message: {
    variant: "diary",
    placement: {
      desktop: { bottom: "6%", left: "10%", width: "78%", height: "44%", rotate: 1, z: 7 },
      mobile: { bottom: "7%", left: "8%", width: "84%", height: "45%", rotate: 1, z: 7 },
    },
  },
  decorations: [
    {
      kind: "tape",
      placement: {
        desktop: { top: "11%", right: "18%", width: "19%", rotate: 3, z: 10 },
        mobile: { top: "13%", right: "18%", width: "23%", rotate: 3, z: 10 },
      },
    },
    {
      kind: "doodle",
      labelKey: "diaryEntryDoodle",
      treatment: "diary-heading",
      placement: {
        desktop: { top: "2%", right: "1%", width: "27%", rotate: -5, z: 8 },
        mobile: { top: "2%", right: "1%", width: "27%", rotate: -5, z: 8 },
      },
    },
    {
      kind: "flower",
      placement: {
        desktop: { bottom: "3%", right: "3%", width: "15%", height: "19%", rotate: -12, z: 8 },
        mobile: { bottom: "2%", right: "2%", width: "17%", height: "16%", rotate: -12, z: 8 },
      },
    },
  ],
} as const satisfies LayoutRecipe;
