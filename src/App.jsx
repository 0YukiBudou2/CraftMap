import { useEffect, useRef,useState } from "react";
import { tagLabels } from "./translations/labels";
import * as d3 from "d3";
import"./styels/App.css";
import InfoPanel from "./components/InfoPanel";
import SearchBox from "./components/SearchBox";
import { createGraph } from "./d3/createGraph";
import { highlightGraph } from "./d3/highlightGraph";
import { zoomToNode } from "./d3/zoomToNode";
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

  const [selectedNode, setSelectedNode] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [allNodes, setAllNodes] = useState([]);
  const [allLinks, setAllLinks] = useState([]);

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

    setSelectedNode({
      id: nodeId,
      label: targetNode.label,
      ingredients,
      products,
      connectedNodes
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
      d3.json("/labels.json")
    ]).then(([links,ja]) => {
      function getLabel(id) {
        const label =
          ja[`item.minecraft.${id}`] ||
          ja[`block.minecraft.${id}`] ||
          ja[`tag.minecraft.${id}`] ||
          tagLabels[id];
        return label || id;
      }

      const nodeMap = new Map();

      links.forEach((d) => {
        if (!nodeMap.has(d.source)) {
          nodeMap.set(d.source, {
            id: d.source,
            label: getLabel(d.source)
          });
        }

        if (!nodeMap.has(d.target)) {
          nodeMap.set(d.target, {
            id: d.target,
            label: getLabel(d.target)
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

  }, [selectedNode]);
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
