import type { ScrapbookContent } from "../content/types";
import { Decoration } from "./Decoration";

type ClosingPageProps = {
  content: ScrapbookContent["closing"];
};

export function ClosingPage({ content }: ClosingPageProps) {
  return (
    <section className="closing-page paper-surface paper-surface--light">
      <Decoration kind="tape" className="closing-page__tape" />
      <Decoration kind="flower" className="closing-page__flower" />
      <Decoration kind="heart" className="closing-page__heart" />

      <div className="closing-page__letter">
        <p className="closing-page__eyebrow">Patty, one last thing…</p>
        <h2>{content.title}</h2>
        <p>{content.message}</p>
        <strong>{content.signature}</strong>
      </div>

      <p className="closing-page__postscript">
        P.S. Melbourne is still yours whenever you come home.
      </p>
    </section>
  );
}
