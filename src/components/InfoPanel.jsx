export default function InfoPanel({
  selectedNode,
  onClose
}) {
  if (!selectedNode) return null;

  return (
    <div className="info">
      <h2>{selectedNode.label}</h2>

      <h3>素材</h3>
      <ul>
        {selectedNode.ingredients.map(item => (
          <li key={item.id}>{item.label}</li>
        ))}
      </ul>

      <h3>クラフト先</h3>
      <ul>
        {selectedNode.products.map(item => (
          <li key={item.id}>{item.label}</li>
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