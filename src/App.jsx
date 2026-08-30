import Legend from "./components/Legend";
import { useEffect, useRef,useState } from "react";
import { tagLabels } from "./data/labels";
import { tagItems } from "./data/tagItems";
import * as d3 from "d3";
import"./styels/App.css";
import InfoPanel from "./components/InfoPanel";
import SearchBox from "./components/SearchBox";
import { createGraph } from "./d3/createGraph";
import { highlightGraph } from "./d3/highlightGraph";
import { zoomToNode } from "./d3/zoomToNode";
import { updateVersionFilter } from "./d3/versionFilter";
import {
  getNode,
  getIngredients,
  getProducts,
  getTraversal
} from "./d3/graphUtils";

export default function App() {
  const svgRef = useRef();
  const nodeRef = useRef();
  const linkRef = useRef();
  const containerRef = useRef();
  const zoomRef = useRef();
  const nodeMapRef = useRef(new Map());
  const allNodesRef = useRef([]);
  const allLinksRef = useRef([]);
  const simulationRef = useRef();
  const nodesRef = useRef([]);
  const getLabelRef = useRef(id => id);
  const traversalModeRef = useRef("ingredients");

  const [selectedNode, setSelectedNode] = useState(null);
  const [traversalMode, setTraversalMode] = useState("ingredients");
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [allNodes, setAllNodes] = useState([]);
  const [allLinks, setAllLinks] = useState([]);
  const [visibleGroups,setVisibleGroups] = useState(
    new Set([
      "pre_1_8",
      "1.9-1.12",
      "1.13-1.15",
      "1.16-1.18",
      "1.19+",
      "other"
    ])
  );

  function selectNode(
    nodeId,
    shouldZoom = false,
    mode = traversalModeRef.current
  ) {
    const targetNode = getNode(
      nodeId,
      allNodesRef.current
    );
    if (!targetNode) return;

    const ingredients = getIngredients(
      nodeId,
      allLinksRef.current,
      nodeMapRef.current
    );
    const products = getProducts(
      nodeId,
      allLinksRef.current,
      nodeMapRef.current
    );

    const tagData = tagItems[nodeId];
    const effectiveMode = tagData ? "products" : mode;

    if (tagData && traversalModeRef.current !== "products") {
      traversalModeRef.current = "products";
      setTraversalMode("products");
    }

    const { traversalNodeIds, traversalLinks } = getTraversal(
      nodeId,
      allLinksRef.current,
      effectiveMode
    );

    const tagNodeList = tagData
      ? tagData.items.map(id => {

          const node = nodeMapRef.current.get(id);

          if (node) {
            return node;
          }

          return {
            id,
            label: getLabelRef.current(id),
            version: "",
            colorGroup: "other"
          };

        })
      : [];

    setSelectedNode({
      id: nodeId,
      label: targetNode.label,
      version: targetNode.version ?? "",
      colorGroup: targetNode.colorGroup ?? "other",
      ingredients,
      products,
      traversalMode: effectiveMode,
      traversalNodeIds,
      traversalLinks,
      isTag: !!tagData,
      tagItems: tagNodeList
    });
    if (shouldZoom) {
      zoomToNode({
        svgRef,
        zoomRef,
        nodes: nodesRef.current,
        nodeId
      });
    }
  }

  function changeTraversalMode(nextMode) {
    if (nextMode === traversalMode) return;

    traversalModeRef.current = nextMode;
    setTraversalMode(nextMode);

    if (selectedNode) {
      selectNode(selectedNode.id, false, nextMode);
    }
  }
  useEffect(() => {
    const svgElement = svgRef.current;
    const width = svgElement.clientWidth;
    const height = svgElement.clientHeight;
    

    Promise.all([
      d3.csv("/edges.csv"),
      d3.json("/labels.json"),
      d3.csv("/versions.csv"),
      d3.json("/item-images.json")
    ]).then(([links,ja,versions,itemImages]) => {
      
      const versionMap = new Map(
        versions.map(v => [v.id, v])
      );
      
      function getLabel(id) {
        const label =
          ja[`item.minecraft.${id}`] ||
          ja[`block.minecraft.${id}`] ||
          ja[`tag.minecraft.${id}`] ||
          tagLabels[id];
        return label || id;
      }
      getLabelRef.current = getLabel;

      const nodeMap = new Map();

      links.forEach((d) => {
        if (!nodeMap.has(d.source)) {
          const meta = versionMap.get(d.source);
          nodeMap.set(d.source, {
            id: d.source,
            label: getLabel(d.source),
            version: meta?.version ?? "",
            colorGroup: meta?.colorGroup || "other",
            imageUrl: itemImages[d.source]
          });
        }

        if (!nodeMap.has(d.target)) {
          const meta = versionMap.get(d.target);

          nodeMap.set(d.target, {
            id: d.target,
            label: getLabel(d.target),
            version: meta?.version ?? "",
            colorGroup: meta?.colorGroup ?? "other",
            imageUrl: itemImages[d.target]
          });
        }
      });
      const nodes = [...nodeMap.values()];
      nodesRef.current = nodes;
      setAllNodes(nodes);
      setAllLinks(links);
      allNodesRef.current = nodes;
      allLinksRef.current = links;
      nodeMapRef.current = nodeMap;
      
      createGraph({
        svgRef,
        nodes,
        links,
        onNodeClick: (nodeId) => selectNode(nodeId, false),
        containerRef,
        nodeRef,
        linkRef,
        zoomRef,
        simulationRef
      });
    });
  }, []);
  useEffect(() => {

      if (searchText === "") {
        setSearchResults([]);
        return;
      }

      const results = allNodes.filter(node =>
        node.label
          .toLowerCase()
          .includes(searchText.toLowerCase())
      );

      setSearchResults(results);

    }, [searchText, allNodes]); 
  useEffect(() => {
    highlightGraph({
      node: nodeRef.current,
      link: linkRef.current,
      selectedNode
    });

    updateVersionFilter({
      node: nodeRef.current,
      link: linkRef.current,
      visibleGroups,
      selectedNode
    });
  }, [selectedNode, visibleGroups]);
    return (
    <div className="app">
      <header className="header">
        <div className="title-area">
          <h1>Craft Map</h1>
          <h2>Minecraft レシピ可視化サイト</h2>
        </div> 
        <div className="traversal-mode" role="group" aria-label="経路の表示モード">
          <button
            type="button"
            className={traversalMode === "ingredients" ? "active" : ""}
            aria-pressed={traversalMode === "ingredients"}
            onClick={() => changeTraversalMode("ingredients")}
          >
            素材をたどる
          </button>
          <button
            type="button"
            className={traversalMode === "products" ? "active" : ""}
            aria-pressed={traversalMode === "products"}
            onClick={() => changeTraversalMode("products")}
          >
            クラフト先をたどる
          </button>
        </div>
        <SearchBox
          searchText={searchText}
          setSearchText={setSearchText}
          searchResults={searchResults}
          onSelectNode={(nodeId) => {
            selectNode(nodeId, true);
            setSearchResults([]);
          }}
        />
      </header>
      <Legend 
        visibleGroups={visibleGroups}
        setVisibleGroups={setVisibleGroups}
      />
      <main className="main">
        <svg ref={svgRef}/>
      </main>

      <InfoPanel
        selectedNode={selectedNode}
        onClose={() => setSelectedNode(null)}
        onSelectNode={(nodeId) => selectNode(nodeId, true)}
      />
    </div>
  );
}
