import type { LayoutRecipe } from "../types";

export const postcard = {
  id: "postcard",
  surface: "light",
  namePlacement: {
    desktop: { top: "7%", left: "8%", width: "44%", rotate: -3, z: 8 },
    mobile: { top: "5%", left: "7%", width: "61%", rotate: -3, z: 8 },
  },
  photos: [
    {
      photoIndex: 0,
      variant: "postcard",
      captionLayer: { position: "bottom" },
      placement: {
        desktop: {
          top: "15%",
          left: "6%",
          width: "58%",
          height: "43%",
          rotate: -4,
          z: 5,
        },
        mobile: {
          top: "15%",
          left: "5%",
          width: "73%",
          height: "35%",
          rotate: -4,
          z: 5,
        },
      },
    },
  ],
  message: {
    variant: "postcard",
    placement: {
      desktop: {
        bottom: "10%",
        right: "6%",
        width: "65%",
        height: "42%",
        rotate: 3,
        z: 6,
      },
      mobile: {
        bottom: "9%",
        right: "6%",
        width: "84%",
        height: "43%",
        rotate: 3,
        z: 6,
      },
    },
  },
  decorations: [
    {
      kind: "stamp",
      labelKey: "postcardStamp",
      placement: {
        desktop: {
          top: "12%",
          right: "7%",
          width: "23%",
          height: "15%",
          rotate: 8,
          z: 8,
        },
        mobile: {
          top: "11%",
          right: "4%",
          width: "26%",
          height: "12%",
          rotate: 8,
          z: 8,
        },
      },
    },
    {
      kind: "doodle",
      labelKey: "postcardDoodle",
      placement: {
        desktop: {
          bottom: "4%",
          left: "6%",
          width: "37%",
          rotate: -5,
          z: 9,
        },
        mobile: {
          bottom: "3%",
          left: "5%",
          width: "46%",
          rotate: -5,
          z: 9,
        },
      },
    },
  ],
} as const satisfies LayoutRecipe;
