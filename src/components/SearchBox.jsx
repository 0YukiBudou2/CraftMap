export default function SearchBox({
  searchText,
  setSearchText,
  searchResults,
  onSelectNode
}) {
  return (
    <div className="search-area">
      <input
        className="search-input"
        type="text"
        placeholder="アイテムを検索..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />

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