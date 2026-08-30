import { useState } from "react";
import { colorMap } from "../d3/colorMap";


const labels = {
  "pre_1_8": "1.8以前",
  "1.9-1.12": "1.9〜1.12",
  "1.13-1.15": "1.13〜1.15",
  "1.16-1.18": "1.16〜1.18",
  "1.19+": "1.19以降",
  "other": "その他"
};


export default function Legend({
  visibleGroups,
  setVisibleGroups
}) {

  const [open, setOpen] = useState(true);


  function toggleGroup(group) {

    if (visibleGroups.has(group)) {

      const newSet = new Set(visibleGroups);
      newSet.delete(group);
      setVisibleGroups(newSet);

    } else {

      const newSet = new Set(visibleGroups);
      newSet.add(group);
      setVisibleGroups(newSet);

    }

  }


  return (
    <div className="legend">

      <button
        onClick={() => setOpen(!open)}
      >
        凡例 {open ? "▲" : "▼"}
      </button>


      {
        open &&
        <div>

          {
            Object.entries(labels).map(([key,label]) => (

              <label
                className="legend-item"
                key={key}
              >

                <input
                  type="checkbox"
                  checked={visibleGroups.has(key)}
                  onChange={() => toggleGroup(key)}
                />

                <span
                  className="legend-color"
                  style={{
                    backgroundColor: colorMap[key]
                  }}
                />

                {label}

              </label>

            ))
          }

          <p className="legend-direction">矢印：素材 → 生成物</p>

        </div>
      }

    </div>
  );
}
