import { Search } from "lucide-react";

/** Plain GET form so searches are shareable URLs and work without JavaScript. */
export function SearchBar({ defaultValue = "", large = false, autoFocus = false }: { defaultValue?: string; large?: boolean; autoFocus?: boolean }) {
  return (
    <form action="/search" method="get" className={`searchbar${large ? " searchbar-lg" : ""}`} role="search">
      <label htmlFor={large ? "q-large" : "q"} className="visually-hidden">
        Search your PDFs
      </label>
      <input
        id={large ? "q-large" : "q"}
        name="q"
        type="search"
        placeholder="Ask anything about your PDFs"
        defaultValue={defaultValue}
        autoComplete="off"
        autoFocus={autoFocus}
        maxLength={200}
      />
      <button type="submit" aria-label="Search" title="Search">
        <Search size={large ? 24 : 20} strokeWidth={1.6} />
      </button>
    </form>
  );
}
