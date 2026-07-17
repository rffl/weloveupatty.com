import type { LayoutRecipe } from "../types";

export const tapedPolaroids = {
  id: "taped-polaroids",
  surface: "paper",
  namePlacement: {
    desktop: { top: "7%", right: "8%", width: "43%", rotate: 3, z: 8 },
    mobile: { top: "5%", right: "7%", width: "57%", rotate: 3, z: 8 },
  },
  photos: [
    {
      photoIndex: 0,
      variant: "polaroid",
      placement: {
        desktop: {
          top: "13%",
          left: "7%",
          width: "52%",
          height: "42%",
          rotate: -7,
          z: 5,
        },
        mobile: {
          top: "16%",
          left: "6%",
          width: "65%",
          height: "34%",
          rotate: -7,
          z: 5,
        },
      },
    },
    {
      photoIndex: 1,
      variant: "polaroid",
      placement: {
        desktop: {
          top: "25%",
          right: "6%",
          width: "43%",
          height: "35%",
          rotate: 6,
          z: 6,
        },
        mobile: {
          top: "25%",
          right: "5%",
          width: "49%",
          height: "29%",
          rotate: 6,
          z: 6,
        },
      },
    },
  ],
  message: {
    variant: "letter",
    placement: {
      desktop: {
        bottom: "8%",
        left: "12%",
        width: "76%",
        height: "32%",
        rotate: -1,
        z: 7,
      },
      mobile: {
        bottom: "8%",
        left: "8%",
        width: "82%",
        height: "34%",
        rotate: -1,
        z: 7,
      },
    },
  },
  decorations: [
    {
      kind: "tape",
      placement: {
        desktop: {
          top: "10%",
          left: "21%",
          width: "22%",
          rotate: -2,
          z: 10,
        },
        mobile: {
          top: "13%",
          left: "24%",
          width: "26%",
          rotate: -2,
          z: 10,
        },
      },
    },
    {
      kind: "tape",
      placement: {
        desktop: {
          top: "22%",
          right: "16%",
          width: "19%",
          rotate: 9,
          z: 10,
        },
        mobile: {
          top: "23%",
          right: "13%",
          width: "22%",
          rotate: 9,
          z: 10,
        },
      },
    },
    {
      kind: "heart",
      placement: {
        desktop: {
          right: "6%",
          bottom: "5%",
          width: "10%",
          rotate: 7,
          z: 9,
        },
        mobile: {
          right: "5%",
          bottom: "3%",
          width: "12%",
          rotate: 7,
          z: 9,
        },
      },
    },
  ],
} as const satisfies LayoutRecipe;
