import { useRef } from "react";

export default function SearchBox({
  searchText,
  setSearchText,
  searchResults,
  onSelectNode
}) {
  const inputRef = useRef(null);

  function clearSearch() {
    setSearchText("");
    inputRef.current?.focus();
  }

  return (
    <div className="search-area" data-keep-details-open>
      <div className="search-input-wrapper">
        <input
          ref={inputRef}
          className="search-input"
          type="text"
          placeholder="アイテムを検索..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        {searchText && (
          <button
            type="button"
            className="search-clear"
            aria-label="検索内容を消去"
            onMouseDown={event => event.preventDefault()}
            onClick={clearSearch}
          >
            ×
          </button>
        )}
      </div>

      {searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((node) => (
            <div
              key={node.id}
              className="search-result-item"
              onClick={() => {
                onSelectNode(node.id);
                setSearchText("");
              }}
            >
              {node.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
