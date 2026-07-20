import type { LayoutRecipe } from "../types";

export const coffeeReceipt = {
  id: "coffee-receipt",
  surface: "kraft",
  namePlacement: {
    desktop: { top: "6%", right: "8%", width: "45%", rotate: 4, z: 8 },
    mobile: { top: "5%", right: "7%", width: "61%", rotate: 3, z: 8 },
  },
  photos: [
    {
      photoIndex: 0,
      variant: "polaroid",
      captionLayer: { position: "bottom" },
      placement: {
        desktop: {
          top: "11%",
          left: "6%",
          width: "48%",
          height: "39%",
          rotate: -6,
          z: 6,
        },
        mobile: {
          top: "15%",
          left: "5%",
          width: "59%",
          height: "31%",
          rotate: -6,
          z: 6,
        },
      },
    },
    {
      photoIndex: 1,
      variant: "snapshot",
      captionLayer: { position: "bottom" },
      placement: {
        desktop: {
          top: "25%",
          right: "6%",
          width: "38%",
          height: "29%",
          rotate: 7,
          z: 5,
        },
        mobile: {
          top: "27%",
          right: "5%",
          width: "45%",
          height: "24%",
          rotate: 7,
          z: 5,
        },
      },
    },
  ],
  message: {
    variant: "receipt",
    placement: {
      desktop: {
        bottom: "6%",
        left: "27%",
        width: "49%",
        height: "48%",
        rotate: -1,
        z: 7,
      },
      mobile: {
        bottom: "7%",
        left: "16%",
        width: "68%",
        height: "47%",
        rotate: -1,
        z: 7,
      },
    },
  },
  decorations: [
    {
      kind: "receipt",
      labelKey: "coffeeReceiptOrder",
      placement: {
        desktop: {
          bottom: "11%",
          left: "5%",
          width: "29%",
          height: "34%",
          rotate: 5,
          z: 4,
        },
        mobile: {
          top: "47%",
          left: "3%",
          width: "29%",
          height: "25%",
          rotate: 5,
          z: 4,
        },
      },
    },
    {
      kind: "tape",
      placement: {
        desktop: {
          bottom: "50%",
          left: "40%",
          width: "18%",
          rotate: 2,
          z: 10,
        },
        mobile: {
          bottom: "50%",
          left: "40%",
          width: "23%",
          rotate: 2,
          z: 10,
        },
      },
    },
    {
      kind: "doodle",
      labelKey: "coffeeReceiptDoodle",
      placement: {
        desktop: {
          bottom: "4%",
          right: "4%",
          width: "33%",
          rotate: -6,
          z: 9,
        },
        mobile: {
          bottom: "3%",
          right: "3%",
          width: "42%",
          rotate: -6,
          z: 9,
        },
      },
    },
  ],
} as const satisfies LayoutRecipe;
