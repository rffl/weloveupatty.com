import { scrapbook } from "./content/scrapbook";
import { Scrapbook } from "./scrapbook/Scrapbook";

export function App() {
  return <Scrapbook content={scrapbook} />;
}
