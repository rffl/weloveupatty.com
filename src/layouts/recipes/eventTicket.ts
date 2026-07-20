import type { LayoutRecipe } from "../types";

export const eventTicket = {
  id: "event-ticket",
  surface: "kraft",
  namePlacement: {
    desktop: { top: "6%", right: "8%", width: "44%", rotate: 3, z: 9 },
    mobile: { top: "5%", right: "7%", width: "60%", rotate: 3, z: 9 },
  },
  photos: [
    {
      photoIndex: 0,
      variant: "snapshot",
      placement: {
        desktop: { top: "14%", left: "6%", width: "51%", height: "38%", rotate: -6, z: 5 },
        mobile: { top: "15%", left: "5%", width: "64%", height: "31%", rotate: -6, z: 5 },
      },
    },
    {
      photoIndex: 1,
      variant: "polaroid",
      captionLayer: { position: "top" },
      placement: {
        desktop: { top: "28%", right: "6%", width: "39%", height: "32%", rotate: 7, z: 6 },
        mobile: { top: "29%", right: "4%", width: "44%", height: "25%", rotate: 7, z: 6 },
      },
    },
  ],
  message: {
    variant: "ticket",
    placement: {
      desktop: { bottom: "8%", left: "11%", width: "77%", height: "36%", rotate: -1, z: 7 },
      mobile: { bottom: "8%", left: "8%", width: "84%", height: "40%", rotate: -1, z: 7 },
    },
  },
  decorations: [
    {
      kind: "ticket",
      labelKey: "eventTicketAdmission",
      treatment: "compact-ticket",
      placement: {
        desktop: { top: "3%", left: "3%", width: "30%", height: "10%", rotate: -4, z: 8 },
        mobile: { top: "2.5%", left: "2%", width: "29%", height: "11%", rotate: -4, z: 8 },
      },
    },
    {
      kind: "stamp",
      labelKey: "eventTicketStamp",
      placement: {
        desktop: { bottom: "4%", right: "4%", width: "19%", height: "13%", rotate: 8, z: 9 },
        mobile: { bottom: "3%", right: "3%", width: "23%", height: "11%", rotate: 8, z: 9 },
      },
    },
  ],
} as const satisfies LayoutRecipe;
