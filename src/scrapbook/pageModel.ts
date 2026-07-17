import type { Contribution, ScrapbookContent } from "../content/types";

export type OpeningPage = {
  readonly id: "opening";
  readonly kind: "opening";
  readonly content: ScrapbookContent["opening"];
};

export type ContributionPage = {
  readonly id: string;
  readonly kind: "contribution";
  readonly contribution: Contribution;
};

export type ClosingPage = {
  readonly id: "closing";
  readonly kind: "closing";
  readonly content: ScrapbookContent["closing"];
};

export type ScrapbookPage = OpeningPage | ContributionPage | ClosingPage;

export type DesktopSpread = {
  readonly index: number;
  readonly pages:
    | readonly [ScrapbookPage]
    | readonly [ScrapbookPage, ScrapbookPage];
};

export function buildPages(content: ScrapbookContent): readonly ScrapbookPage[] {
  if (content.contributions.length !== 15) {
    throw new Error(
      `The scrapbook requires exactly 15 contributions; received ${content.contributions.length}.`,
    );
  }

  const ids = new Set(content.contributions.map((item) => item.id));

  if (ids.size !== content.contributions.length) {
    throw new Error("Every contribution id must be unique.");
  }

  if (
    content.contributions.some(
      (item) => item.id === "opening" || item.id === "closing",
    )
  ) {
    throw new Error(
      'Contribution ids cannot use the reserved page ids "opening" or "closing".',
    );
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
): readonly DesktopSpread[] {
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
  assertNonNegativeSafeInteger(
    pageIndex,
    "Page index must be a non-negative safe integer.",
  );

  return pageIndex === 0 ? 0 : Math.ceil(pageIndex / 2);
}

export function firstPageIndexForDesktopSpread(spreadIndex: number): number {
  assertNonNegativeSafeInteger(
    spreadIndex,
    "Spread index must be a non-negative safe integer.",
  );

  return spreadIndex === 0 ? 0 : spreadIndex * 2 - 1;
}

function assertNonNegativeSafeInteger(value: number, message: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(message);
  }
}
