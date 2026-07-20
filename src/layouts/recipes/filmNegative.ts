import type { LayoutRecipe } from "../types";

export const filmNegative = {
  id: "film-negative",
  surface: "black",
  namePlacement: {
    desktop: { top: "6%", left: "7%", width: "44%", rotate: -2, z: 9 },
    mobile: { top: "4%", left: "7%", width: "61%", rotate: -2, z: 9 },
  },
  photos: [
    {
      photoIndex: 0,
      variant: "film",
      placement: {
        desktop: { top: "17%", left: "5%", width: "43%", height: "29%", rotate: -4, z: 5 },
        mobile: { top: "13%", left: "4%", width: "49%", height: "18%", rotate: -5, z: 5 },
      },
    },
    {
      photoIndex: 1,
      variant: "film",
      placement: {
        desktop: { top: "13%", right: "5%", width: "43%", height: "29%", rotate: 4, z: 6 },
        mobile: { top: "15%", right: "4%", width: "49%", height: "18%", rotate: 5, z: 6 },
      },
    },
    {
      photoIndex: 2,
      variant: "film",
      captionLayer: { position: "top" },
      placement: {
        desktop: { top: "43%", left: "28%", width: "44%", height: "29%", rotate: -1, z: 7 },
        mobile: { top: "36%", left: "25%", width: "52%", height: "18%", rotate: -1, z: 7 },
      },
    },
  ],
  message: {
    variant: "letter",
    placement: {
      desktop: { bottom: "6%", left: "11%", width: "78%", height: "29%", rotate: 1, z: 8 },
      mobile: { bottom: "5%", left: "8%", width: "84%", height: "30%", rotate: 1, z: 8 },
    },
  },
  decorations: [
    {
      kind: "film",
      placement: {
        desktop: { top: "48%", left: "4%", width: "29%", height: "6%", rotate: 7, z: 3 },
        mobile: { top: "49%", left: "2%", width: "32%", height: "4%", rotate: 7, z: 3 },
      },
    },
    {
      kind: "doodle",
      labelKey: "filmNegativeDoodle",
      treatment: "dark-label",
      placement: {
        desktop: { top: "64%", right: "4%", width: "32%", rotate: -7, z: 9 },
        mobile: { top: "58%", right: "3%", width: "39%", rotate: -7, z: 9 },
      },
    },
  ],
} as const satisfies LayoutRecipe;
