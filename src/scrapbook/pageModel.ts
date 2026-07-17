import type { Contribution, ScrapbookContent } from "../content/types";

export type OpeningPage = {
  id: "opening";
  kind: "opening";
  content: ScrapbookContent["opening"];
};

export type ContributionPage = {
  id: string;
  kind: "contribution";
  contribution: Contribution;
};

export type ClosingPage = {
  id: "closing";
  kind: "closing";
  content: ScrapbookContent["closing"];
};

export type ScrapbookPage = OpeningPage | ContributionPage | ClosingPage;

export type DesktopSpread = {
  index: number;
  pages: readonly [ScrapbookPage] | readonly [ScrapbookPage, ScrapbookPage];
};

export function buildPages(content: ScrapbookContent): ScrapbookPage[] {
  if (content.contributions.length !== 15) {
    throw new Error(
      `The scrapbook requires exactly 15 contributions; received ${content.contributions.length}.`,
    );
  }

  const ids = new Set(content.contributions.map((item) => item.id));

  if (ids.size !== content.contributions.length) {
    throw new Error("Every contribution id must be unique.");
  }

  return [
    { id: "opening", kind: "opening", content: content.opening },
    ...content.contributions.map(
      (contribution): ContributionPage => ({
        id: contribution.id,
        kind: "contribution",
        contribution,
      }),
    ),
    { id: "closing", kind: "closing", content: content.closing },
  ];
}

export function buildDesktopSpreads(
  pages: readonly ScrapbookPage[],
): DesktopSpread[] {
  const opening = pages[0];

  if (!opening || opening.kind !== "opening") {
    throw new Error("The first scrapbook page must be the opening page.");
  }

  const spreads: DesktopSpread[] = [{ index: 0, pages: [opening] }];
  const remaining = pages.slice(1);

  for (let index = 0; index < remaining.length; index += 2) {
    const left = remaining[index];
    const right = remaining[index + 1];

    if (!left) {
      break;
    }

    spreads.push({
      index: spreads.length,
      pages: right ? [left, right] : [left],
    });
  }

  return spreads;
}

export function desktopSpreadForPageIndex(pageIndex: number): number {
  return pageIndex === 0 ? 0 : Math.ceil(pageIndex / 2);
}

export function firstPageIndexForDesktopSpread(spreadIndex: number): number {
  return spreadIndex === 0 ? 0 : spreadIndex * 2 - 1;
}
