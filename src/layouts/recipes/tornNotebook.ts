import type { LayoutRecipe } from "../types";

export const tornNotebook = {
  id: "torn-notebook",
  surface: "paper",
  namePlacement: {
    desktop: { top: "6%", left: "12%", width: "42%", rotate: -1, z: 8 },
    mobile: { top: "5%", left: "12%", width: "59%", rotate: -1, z: 8 },
  },
  photos: [
    {
      photoIndex: 0,
      variant: "polaroid",
      placement: {
        desktop: {
          top: "14%",
          right: "7%",
          width: "44%",
          height: "36%",
          rotate: 7,
          z: 5,
        },
        mobile: {
          top: "16%",
          right: "5%",
          width: "56%",
          height: "23%",
          rotate: 7,
          z: 5,
        },
      },
    },
    {
      photoIndex: 1,
      variant: "snapshot",
      placement: {
        desktop: {
          top: "22%",
          left: "9%",
          width: "39%",
          height: "29%",
          rotate: -6,
          z: 6,
        },
        mobile: {
          top: "34%",
          left: "6%",
          width: "43%",
          height: "18%",
          rotate: -6,
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
        left: "11%",
        width: "76%",
        height: "41%",
        rotate: 1,
        z: 7,
      },
      mobile: {
        bottom: "7%",
        left: "9%",
        width: "82%",
        height: "34%",
        rotate: 1,
        z: 7,
      },
    },
  },
  decorations: [
    {
      kind: "tape",
      placement: {
        desktop: {
          top: "12%",
          right: "18%",
          width: "19%",
          rotate: 4,
          z: 10,
        },
        mobile: {
          top: "14%",
          right: "18%",
          width: "23%",
          rotate: 4,
          z: 10,
        },
      },
    },
    {
      kind: "doodle",
      labelKey: "tornNotebookDoodle",
      placement: {
        desktop: {
          bottom: "3%",
          left: "5%",
          width: "29%",
          rotate: -8,
          z: 9,
        },
        mobile: {
          bottom: "3%",
          left: "4%",
          width: "38%",
          rotate: -8,
          z: 9,
        },
      },
    },
  ],
} as const satisfies LayoutRecipe;
