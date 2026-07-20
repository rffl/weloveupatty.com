import type { ScrapbookContent } from "../content/types";
import { Decoration } from "./Decoration";

type OpeningPageProps = {
  content: ScrapbookContent["opening"];
};

export function OpeningPage({ content }: OpeningPageProps) {
  return (
    <section className="opening-page paper-surface paper-surface--light">
      <Decoration kind="tape" className="opening-page__tape" />
      <Decoration
        kind="stamp"
        label={"MELBOURNE\nWITH LOVE"}
        className="opening-page__stamp"
      />
      <Decoration kind="map" className="opening-page__map" />
      <Decoration
        kind="doodle"
        label="turn slowly →"
        className="opening-page__doodle"
      />

      <div className="opening-page__copy">
        <p>{content.eyebrow}</p>
        <h1>{content.title}</h1>
        <div className="opening-page__underline" aria-hidden="true" />
        <p className="opening-page__message">{content.message}</p>
      </div>

      <div className="opening-page__route" aria-hidden="true">
        <span>the first hello</span>
        <i />
        <span>four years of us</span>
        <i />
        <span>never really goodbye</span>
      </div>
    </section>
  );
}
