import type { LayoutRecipe } from "../types";

export const pressedFlower = {
  id: "pressed-flower",
  surface: "light",
  namePlacement: {
    desktop: { top: "6%", right: "9%", width: "44%", rotate: 2, z: 8 },
    mobile: { top: "5%", right: "7%", width: "60%", rotate: 2, z: 8 },
  },
  photos: [
    {
      photoIndex: 0,
      variant: "polaroid",
      placement: {
        desktop: {
          top: "13%",
          left: "7%",
          width: "46%",
          height: "38%",
          rotate: -5,
          z: 5,
        },
        mobile: {
          top: "15%",
          left: "6%",
          width: "60%",
          height: "31%",
          rotate: -5,
          z: 5,
        },
      },
    },
    {
      photoIndex: 1,
      variant: "snapshot",
      placement: {
        desktop: {
          top: "25%",
          right: "7%",
          width: "39%",
          height: "30%",
          rotate: 5,
          z: 6,
        },
        mobile: {
          top: "28%",
          right: "5%",
          width: "44%",
          height: "24%",
          rotate: 5,
          z: 6,
        },
      },
    },
  ],
  message: {
    variant: "letter",
    placement: {
      desktop: {
        bottom: "7%",
        left: "12%",
        width: "74%",
        height: "39%",
        rotate: -1,
        z: 7,
      },
      mobile: {
        bottom: "8%",
        left: "9%",
        width: "82%",
        height: "40%",
        rotate: -1,
        z: 7,
      },
    },
  },
  decorations: [
    {
      kind: "flower",
      placement: {
        desktop: {
          top: "7%",
          left: "53%",
          width: "14%",
          height: "18%",
          rotate: 17,
          z: 9,
        },
        mobile: {
          top: "8%",
          left: "57%",
          width: "16%",
          height: "15%",
          rotate: 17,
          z: 9,
        },
      },
    },
    {
      kind: "flower",
      placement: {
        desktop: {
          bottom: "3%",
          right: "4%",
          width: "16%",
          height: "20%",
          rotate: -13,
          z: 8,
        },
        mobile: {
          bottom: "2%",
          right: "2%",
          width: "18%",
          height: "16%",
          rotate: -13,
          z: 8,
        },
      },
    },
    {
      kind: "tape",
      placement: {
        desktop: {
          top: "11%",
          left: "20%",
          width: "19%",
          rotate: 1,
          z: 10,
        },
        mobile: {
          top: "13%",
          left: "22%",
          width: "24%",
          rotate: 1,
          z: 10,
        },
      },
    },
  ],
} as const satisfies LayoutRecipe;
