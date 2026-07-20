import type { LayoutRecipe } from "../types";

export const tramTicket = {
  id: "tram-ticket",
  surface: "graph",
  namePlacement: {
    desktop: { top: "6%", left: "8%", width: "42%", rotate: -3, z: 8 },
    mobile: { top: "5%", left: "7%", width: "60%", rotate: -3, z: 8 },
  },
  photos: [
    {
      photoIndex: 0,
      variant: "snapshot",
      placement: {
        desktop: {
          top: "15%",
          right: "7%",
          width: "49%",
          height: "36%",
          rotate: 6,
          z: 5,
        },
        mobile: {
          top: "16%",
          right: "5%",
          width: "62%",
          height: "30%",
          rotate: 6,
          z: 5,
        },
      },
    },
    {
      photoIndex: 1,
      variant: "polaroid",
      captionLayer: { position: "bottom" },
      placement: {
        desktop: {
          top: "28%",
          left: "7%",
          width: "41%",
          height: "34%",
          rotate: -7,
          z: 6,
        },
        mobile: {
          top: "28%",
          left: "5%",
          width: "46%",
          height: "26%",
          rotate: -7,
          z: 6,
        },
      },
    },
  ],
  message: {
    variant: "ticket",
    placement: {
      desktop: {
        bottom: "7%",
        left: "14%",
        width: "72%",
        height: "35%",
        rotate: 1,
        z: 7,
      },
      mobile: {
        bottom: "8%",
        left: "8%",
        width: "84%",
        height: "39%",
        rotate: 1,
        z: 7,
      },
    },
  },
  decorations: [
    {
      kind: "ticket",
      labelKey: "tramTicketPass",
      placement: {
        desktop: {
          top: "8%",
          left: "49%",
          width: "39%",
          height: "12%",
          rotate: -4,
          z: 9,
        },
        mobile: {
          top: "11%",
          right: "3%",
          width: "43%",
          height: "10%",
          rotate: -4,
          z: 9,
        },
      },
    },
    {
      kind: "doodle",
      labelKey: "tramTicketDoodle",
      placement: {
        desktop: {
          bottom: "4%",
          right: "4%",
          width: "24%",
          rotate: -6,
          z: 9,
        },
        mobile: {
          bottom: "3%",
          right: "3%",
          width: "31%",
          rotate: -6,
          z: 9,
        },
      },
    },
  ],
} as const satisfies LayoutRecipe;
