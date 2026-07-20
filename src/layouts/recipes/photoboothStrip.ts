import type { LayoutRecipe } from "../types";

export const photoboothStrip = {
  id: "photobooth-strip",
  surface: "kraft",
  namePlacement: {
    desktop: { top: "6%", right: "8%", width: "47%", rotate: 3, z: 8 },
    mobile: { top: "4%", left: "8%", width: "61%", rotate: -2, z: 8 },
  },
  photos: [
    {
      photoIndex: 0,
      variant: "photobooth",
      placement: {
        desktop: {
          top: "10%",
          left: "8%",
          width: "31%",
          height: "25%",
          rotate: -4,
          z: 5,
        },
        mobile: {
          top: "13%",
          left: "5%",
          width: "35%",
          height: "17%",
          rotate: -6,
          z: 5,
        },
      },
    },
    {
      photoIndex: 1,
      variant: "photobooth",
      placement: {
        desktop: {
          top: "36%",
          left: "9%",
          width: "31%",
          height: "25%",
          rotate: -2,
          z: 5,
        },
        mobile: {
          top: "18%",
          left: "33%",
          width: "35%",
          height: "17%",
          rotate: 1,
          z: 6,
        },
      },
    },
    {
      photoIndex: 2,
      variant: "photobooth",
      placement: {
        desktop: {
          top: "62%",
          left: "10%",
          width: "31%",
          height: "25%",
          rotate: 0,
          z: 5,
        },
        mobile: {
          top: "23%",
          right: "4%",
          width: "35%",
          height: "17%",
          rotate: 6,
          z: 5,
        },
      },
    },
  ],
  message: {
    variant: "letter",
    placement: {
      desktop: {
        top: "22%",
        right: "7%",
        width: "51%",
        height: "60%",
        rotate: 2,
        z: 6,
      },
      mobile: {
        bottom: "9%",
        left: "8%",
        width: "84%",
        height: "37%",
        rotate: -1,
        z: 7,
      },
    },
  },
  decorations: [
    {
      kind: "film",
      placement: {
        desktop: {
          bottom: "5%",
          right: "8%",
          width: "37%",
          height: "6%",
          rotate: -5,
          z: 8,
        },
        mobile: {
          top: "39%",
          left: "23%",
          width: "54%",
          height: "4%",
          rotate: -3,
          z: 8,
        },
      },
    },
    {
      kind: "doodle",
      labelKey: "photoboothDoodle",
      placement: {
        desktop: {
          top: "12%",
          right: "8%",
          width: "28%",
          rotate: 8,
          z: 9,
        },
        mobile: {
          bottom: "4%",
          right: "5%",
          width: "38%",
          rotate: 7,
          z: 9,
        },
      },
    },
  ],
} as const satisfies LayoutRecipe;
