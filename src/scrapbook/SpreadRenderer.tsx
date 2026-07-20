import { ClosingPage } from "../components/ClosingPage";
import { OpeningPage } from "../components/OpeningPage";
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
  onRememberPage: (pageIndex: number) => void;
};

type PageViewProps = {
  page: ScrapbookPage;
  pageIndex: number;
  mode: ResponsiveMode;
  side: "left" | "right" | "single";
  engagementEnabled: boolean;
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
  onRememberPage,
}: SpreadRendererProps) {
  if (mode === "mobile") {
    const page = pages[activePageIndex];

    if (!page) {
      return null;
    }

    return (
      <div className="mobile-page" key={page.id}>
        <PageView
          engagementEnabled={engagementEnabled}
          mode={mode}
          onRememberPage={onRememberPage}
          page={page}
          pageIndex={activePageIndex}
          side="single"
        />
      </div>
    );
  }

  const spread = desktopSpreads[desktopSpreadForPageIndex(activePageIndex)];

  if (!spread) {
    return null;
  }

  const [left, right] = spread.pages;
  const leftIndex = spread.index === 0 ? 0 : spread.index * 2 - 1;
  const isSingle = !right;

  return (
    <div
      className="desktop-spread"
      data-single={isSingle || undefined}
      key={`spread-${spread.index}`}
    >
      <PageView
        engagementEnabled={engagementEnabled}
        mode={mode}
        onRememberPage={onRememberPage}
        page={left}
        pageIndex={leftIndex}
        side={isSingle ? "single" : "left"}
      />
      {right ? (
        <PageView
          engagementEnabled={engagementEnabled}
          mode={mode}
          onRememberPage={onRememberPage}
          page={right}
          pageIndex={leftIndex + 1}
          side="right"
        />
      ) : null}
    </div>
  );
}
