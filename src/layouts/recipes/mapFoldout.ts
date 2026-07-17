import type { LayoutRecipe } from "../types";

export const mapFoldout = {
  id: "map-foldout",
  surface: "graph",
  namePlacement: {
    desktop: { top: "5%", left: "7%", width: "44%", rotate: -3, z: 8 },
    mobile: { top: "5%", left: "7%", width: "58%", rotate: -3, z: 8 },
  },
  photos: [
    {
      photoIndex: 0,
      variant: "polaroid",
      placement: {
        desktop: {
          top: "17%",
          left: "8%",
          width: "49%",
          height: "38%",
          rotate: -5,
          z: 5,
        },
        mobile: {
          top: "17%",
          left: "7%",
          width: "61%",
          height: "30%",
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
          top: "12%",
          right: "5%",
          width: "38%",
          height: "29%",
          rotate: 5,
          z: 4,
        },
        mobile: {
          top: "11%",
          right: "5%",
          width: "36%",
          height: "23%",
          rotate: 6,
          z: 4,
        },
      },
    },
    {
      photoIndex: 2,
      variant: "polaroid",
      placement: {
        desktop: {
          right: "7%",
          bottom: "9%",
          width: "37%",
          height: "29%",
          rotate: 4,
          z: 6,
        },
        mobile: {
          right: "6%",
          bottom: "8%",
          width: "44%",
          height: "24%",
          rotate: 4,
          z: 6,
        },
      },
    },
  ],
  message: {
    variant: "notebook",
    placement: {
      desktop: {
        bottom: "7%",
        left: "8%",
        width: "51%",
        height: "34%",
        rotate: 2,
        z: 7,
      },
      mobile: {
        top: "48%",
        left: "9%",
        width: "75%",
        height: "29%",
        rotate: 2,
        z: 7,
      },
    },
  },
  decorations: [
    {
      kind: "map",
      placement: {
        desktop: {
          top: "43%",
          right: "7%",
          width: "31%",
          height: "21%",
          rotate: -4,
          z: 2,
        },
        mobile: {
          top: "37%",
          right: "4%",
          width: "32%",
          height: "17%",
          rotate: -4,
          z: 2,
        },
      },
    },
    {
      kind: "tape",
      placement: {
        desktop: {
          top: "15%",
          left: "23%",
          width: "19%",
          rotate: 2,
          z: 9,
        },
        mobile: {
          top: "15%",
          left: "24%",
          width: "24%",
          rotate: 2,
          z: 9,
        },
      },
    },
    {
      kind: "doodle",
      label: "we were here ↗",
      placement: {
        desktop: {
          top: "59%",
          right: "9%",
          width: "26%",
          rotate: -7,
          z: 9,
        },
        mobile: {
          bottom: "5%",
          left: "8%",
          width: "38%",
          rotate: -7,
          z: 9,
        },
      },
    },
  ],
} as const satisfies LayoutRecipe;
