import type { LayoutRecipe } from "../types";

export const finalLoveLetter = {
  id: "final-love-letter",
  surface: "light",
  namePlacement: {
    desktop: { top: "6%", left: "8%", width: "46%", rotate: -2, z: 9 },
    mobile: { top: "5%", left: "7%", width: "63%", rotate: -2, z: 9 },
  },
  photos: [
    {
      photoIndex: 0,
      variant: "polaroid",
      placement: {
        desktop: { top: "13%", left: "6%", width: "45%", height: "36%", rotate: -6, z: 5 },
        mobile: { top: "15%", left: "5%", width: "58%", height: "30%", rotate: -6, z: 5 },
      },
    },
    {
      photoIndex: 1,
      variant: "polaroid",
      captionLayer: "lifted",
      placement: {
        desktop: { top: "19%", right: "6%", width: "43%", height: "35%", rotate: 6, z: 6 },
        mobile: { top: "27%", right: "5%", width: "48%", height: "26%", rotate: 6, z: 6 },
      },
    },
  ],
  message: {
    variant: "love-letter",
    placement: {
      desktop: { bottom: "6%", left: "10%", width: "79%", height: "45%", rotate: 1, z: 7 },
      mobile: { bottom: "7%", left: "8%", width: "84%", height: "45%", rotate: 1, z: 7 },
    },
  },
  decorations: [
    {
      kind: "tape",
      placement: {
        desktop: { top: "11%", left: "19%", width: "20%", rotate: 0, z: 10 },
        mobile: { top: "13%", left: "20%", width: "25%", rotate: 0, z: 10 },
      },
    },
    {
      kind: "stamp",
      label: "OPEN WHEN\nYOU MISS US",
      placement: {
        desktop: { top: "6%", right: "6%", width: "23%", height: "15%", rotate: 8, z: 9 },
        mobile: { top: "9%", right: "3%", width: "27%", height: "12%", rotate: 8, z: 9 },
      },
    },
    {
      kind: "heart",
      placement: {
        desktop: { bottom: "3%", right: "4%", width: "12%", rotate: -7, z: 9 },
        mobile: { bottom: "2%", right: "3%", width: "15%", rotate: -7, z: 9 },
      },
    },
  ],
} as const satisfies LayoutRecipe;
