export const nodeColorMap = {
  "pre_1_8": { fill: "#f0e1f5", stroke: "#7b1fa2" },
  "1.9-1.12": { fill: "#e2f0e4", stroke: "#388e3c" },
  "1.13-1.15": { fill: "#e1ebf6", stroke: "#1976d2" },
  "1.16-1.18": { fill: "#fff2cc", stroke: "#f9a825" },
  "1.19+": { fill: "#f7dfdf", stroke: "#d32f2f" },
  other: { fill: "#ebe7e4", stroke: "#6d625a" }
};

export function getNodeColors(colorGroup) {
  return nodeColorMap[colorGroup] ?? nodeColorMap.other;
}

// 凡例など、単色だけを必要とする箇所向けの互換マップ。
export const colorMap = Object.fromEntries(
  Object.entries(nodeColorMap).map(([group, colors]) => [group, colors.stroke])
);
