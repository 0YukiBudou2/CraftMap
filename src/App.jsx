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
  getConnectedNodes
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

  const [selectedNode, setSelectedNode] = useState(null);
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

  function selectNode(nodeId,shouldZoom = false) {
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

    const connectedNodes = getConnectedNodes(
      nodeId,
      allLinksRef.current
    );
    const tagData = tagItems[nodeId];

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
      connectedNodes,
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
  useEffect(() => {
    const svgElement = svgRef.current;
    const width = svgElement.clientWidth;
    const height = svgElement.clientHeight;
    

    Promise.all([
      d3.csv("/edges.csv"),
      d3.json("/labels.json"),
      d3.csv("/versions.csv")
    ]).then(([links,ja,versions]) => {
      
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
            colorGroup: meta?.colorGroup || "other"
          });
        }

        if (!nodeMap.has(d.target)) {
          const meta = versionMap.get(d.target);

          nodeMap.set(d.target, {
            id: d.target,
            label: getLabel(d.target),
            version: meta?.version ?? "",
            colorGroup: meta?.colorGroup ?? "other"
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
      />
    </div>
  );
}
