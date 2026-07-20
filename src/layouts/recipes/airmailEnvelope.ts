import type { LayoutRecipe } from "../types";

export const airmailEnvelope = {
  id: "airmail-envelope",
  surface: "light",
  namePlacement: {
    desktop: { top: "6%", right: "7%", width: "42%", rotate: 3, z: 9 },
    mobile: { top: "5%", right: "6%", width: "58%", rotate: 3, z: 9 },
  },
  photos: [
    {
      photoIndex: 0,
      variant: "postcard",
      placement: {
        desktop: {
          top: "14%",
          left: "6%",
          width: "48%",
          height: "34%",
          rotate: -5,
          z: 4,
        },
        mobile: {
          top: "16%",
          left: "5%",
          width: "61%",
          height: "22%",
          rotate: -5,
          z: 4,
        },
      },
    },
    {
      photoIndex: 1,
      variant: "snapshot",
      placement: {
        desktop: {
          top: "31%",
          right: "6%",
          width: "37%",
          height: "28%",
          rotate: 7,
          z: 7,
        },
        mobile: {
          top: "34%",
          right: "5%",
          width: "43%",
          height: "18%",
          rotate: 7,
          z: 7,
        },
      },
    },
  ],
  message: {
    variant: "envelope",
    placement: {
      desktop: {
        bottom: "8%",
        left: "10%",
        width: "74%",
        height: "41%",
        rotate: 1,
        z: 6,
      },
      mobile: {
        bottom: "7%",
        left: "7%",
        width: "84%",
        height: "34%",
        rotate: 1,
        z: 6,
      },
    },
  },
  decorations: [
    {
      kind: "stamp",
      labelKey: "airmailEnvelopeStamp",
      placement: {
        desktop: {
          top: "9%",
          left: "51%",
          width: "19%",
          height: "13%",
          rotate: -7,
          z: 8,
        },
        mobile: {
          top: "12%",
          left: "55%",
          width: "23%",
          height: "9%",
          rotate: -7,
          z: 8,
        },
      },
    },
    {
      kind: "doodle",
      labelKey: "airmailEnvelopeRoute",
      placement: {
        desktop: {
          right: "4%",
          bottom: "4%",
          width: "25%",
          rotate: -5,
          z: 9,
        },
        mobile: {
          right: "3%",
          bottom: "3%",
          width: "31%",
          rotate: -5,
          z: 9,
        },
      },
    },
  ],
} as const satisfies LayoutRecipe;
