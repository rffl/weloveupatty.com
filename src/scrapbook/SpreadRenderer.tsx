import { ClosingPage } from "../components/ClosingPage";
import { OpeningPage } from "../components/OpeningPage";
import type { RecipeDecorationLabels } from "../content/types";
import { ContributionLayout } from "../layouts/ContributionLayout";
import { getLayoutRecipe } from "../layouts";
import type { ResponsiveMode } from "../layouts/types";
import type { DesktopSpread, ScrapbookPage } from "./pageModel";
import { desktopSpreadForPageIndex } from "./pageModel";

type SpreadRendererProps = {
  pages: readonly ScrapbookPage[];
  desktopSpreads: readonly DesktopSpread[];
  activePageIndex: number;
  mode: ResponsiveMode;
  engagementEnabled: boolean;
  decorationLabels: RecipeDecorationLabels;
  onRememberPage: (pageIndex: number) => void;
};

type PageViewProps = {
  page: ScrapbookPage;
  pageIndex: number;
  mode: ResponsiveMode;
  side: "left" | "right" | "single";
  engagementEnabled: boolean;
  decorationLabels: RecipeDecorationLabels;
  onRememberPage: (pageIndex: number) => void;
};

function pageLabel(page: ScrapbookPage): string {
  if (page.kind === "opening") {
    return "Opening dedication";
  }

  if (page.kind === "closing") {
    return "Closing farewell";
  }

  return `Memory from ${page.contribution.friendName}`;
}

function PageView({
  page,
  pageIndex,
  mode,
  side,
  engagementEnabled,
  decorationLabels,
  onRememberPage,
}: PageViewProps) {
  const rememberThisPage = () => {
    if (engagementEnabled) {
      onRememberPage(pageIndex);
    }
  };

  return (
    <div
      aria-label={pageLabel(page)}
      className={`scrapbook-page scrapbook-page--${page.kind}`}
      data-page-id={page.id}
      data-page-index={pageIndex}
      data-side={side}
      onFocusCapture={rememberThisPage}
      onPointerDownCapture={rememberThisPage}
      role="group"
    >
      {page.kind === "opening" ? <OpeningPage content={page.content} /> : null}
      {page.kind === "contribution" ? (
        <ContributionLayout
          contribution={page.contribution}
          decorationLabels={decorationLabels}
          eagerPhotos
          mode={mode}
          recipe={getLayoutRecipe(page.contribution.layout)}
        />
      ) : null}
      {page.kind === "closing" ? <ClosingPage content={page.content} /> : null}
    </div>
  );
}

export function SpreadRenderer({
  pages,
  desktopSpreads,
  activePageIndex,
  mode,
  engagementEnabled,
  decorationLabels,
  onRememberPage,
}: SpreadRendererProps) {
  let visiblePages: readonly {
    page: ScrapbookPage;
    pageIndex: number;
    side: "left" | "right" | "single";
  }[] = [];
  let isSingle = false;

  if (mode === "mobile") {
    const page = pages[activePageIndex];

    if (page) {
      visiblePages = [{ page, pageIndex: activePageIndex, side: "single" }];
      isSingle = true;
    }
  } else {
    const spread = desktopSpreads[desktopSpreadForPageIndex(activePageIndex)];

    if (spread) {
      const [left, right] = spread.pages;
      const leftIndex = spread.index === 0 ? 0 : spread.index * 2 - 1;
      isSingle = !right;
      visiblePages = right
        ? [
            { page: left, pageIndex: leftIndex, side: "left" },
            { page: right, pageIndex: leftIndex + 1, side: "right" },
          ]
        : [{ page: left, pageIndex: leftIndex, side: "single" }];
    }
  }

  return (
    <div
      className={`scrapbook-pages ${
        mode === "mobile" ? "mobile-page" : "desktop-spread"
      }`}
      data-single={isSingle || undefined}
    >
      {visiblePages.map(({ page, pageIndex, side }) => (
        <PageView
          decorationLabels={decorationLabels}
          engagementEnabled={engagementEnabled}
          key={page.id}
          mode={mode}
          onRememberPage={onRememberPage}
          page={page}
          pageIndex={pageIndex}
          side={side}
        />
      ))}
    </div>
  );
}
