export default function InfoPanel({
  selectedNode,
  onClose,
  onSelectNode
}) {
  if (!selectedNode) return null;

  return (
    <div className="info">
      <h2>{selectedNode.label}</h2>
      {!selectedNode.isTag &&(
        <>
          <h3>追加バージョン</h3>
            
          <p>{selectedNode.version || "不明"}</p>
        </>
      )}
      {selectedNode.isTag && (
        <>
          <h3>タグに含まれるアイテム</h3>

          <ul>
            {selectedNode.tagItems.map(item => (
              <li 
                key={item.id}
                className="node-link"
                onClick={() => onSelectNode(item.id)}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </>
      )}
      <h3>素材</h3>

      <ul>
        {selectedNode.ingredients.map(item => (
          <li 
            key={item.id}
            className="node-link"
            onClick={() => onSelectNode(item.id)}
          >
            {item.label}</li>
        ))}
      </ul>

      <h3>クラフト先</h3>
      <ul>
        {selectedNode.products.map(item => (
          <li 
            key={item.id}
            className="node-link"
            onClick={() => onSelectNode(item.id)}
          >
            {item.label}</li>
        ))}
      </ul>

      <button
        className="close-button"
        onClick={onClose}
      >
        ×
      </button>
    </div>
  );
}