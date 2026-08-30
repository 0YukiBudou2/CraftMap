import { getCraftMethodLabel } from "../data/craftMethods";

function RelatedItem({ item, onSelectNode }) {
  return (
    <div className="related-item">
      <button
        type="button"
        className="related-item-heading"
        onClick={() => onSelectNode(item.id)}
      >
        <span>{item.label}</span>
        {item.imageUrl && (
          <img
            className="related-item-image"
            src={item.imageUrl}
            alt=""
            loading="lazy"
          />
        )}
      </button>
      <p className="craft-methods">
        クラフト方法：{item.craftMethods.map(getCraftMethodLabel).join("、")}
      </p>
    </div>
  );
}

function RelatedItems({ items, onSelectNode }) {
  if (items.length === 0) {
    return <p className="related-items-empty">なし</p>;
  }

  return (
    <div className="related-items">
      {items.map(item => (
        <RelatedItem
          key={item.id}
          item={item}
          onSelectNode={onSelectNode}
        />
      ))}
    </div>
  );
}

export default function InfoPanel({
  selectedNode,
  onClose,
  onSelectNode
}) {
  if (!selectedNode) return null;

  return (
    <>
      <div
        className="info-backdrop"
        aria-hidden="true"
        onClick={onClose}
      />
      <div className="info">
        <div className="info-title">
          <h2>{selectedNode.label}</h2>
          {selectedNode.imageUrl && (
            <img
              className="selected-item-image"
              src={selectedNode.imageUrl}
              alt=""
            />
          )}
        </div>

      {!selectedNode.isTag && (
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
      <RelatedItems
        items={selectedNode.ingredients}
        onSelectNode={onSelectNode}
      />

      <h3>クラフト先</h3>
      <RelatedItems
        items={selectedNode.products}
        onSelectNode={onSelectNode}
      />

      <button
        type="button"
        className="close-button"
        aria-label="詳細を閉じる"
        onClick={onClose}
      >
        ×
      </button>
      </div>
    </>
  );
}
