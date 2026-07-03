import { useState } from "react";

export default function FirstFloor({ onBack }) {
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);

  const getFill = (name, base) => {
    if (selected === name) return "#2563eb";
    if (hovered === name) return "#60a5fa";
    return base;
  };

  const door = (x1, y1, x2, y2) => (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fbbf24" strokeWidth="4" />
  );

  return (
    <div style={{ minHeight: "100vh", background: "#020617", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white" }}>

      {/* TOP BAR */}
      <div style={{ width: "900px", display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
        <button onClick={onBack} style={{ padding: "6px 14px", background: "#3b82f6", color: "white", border: "none", borderRadius: "6px" }}>
          ← Back
        </button>

        <h2 style={{ margin: 0 }}>First Floor</h2>

        <div />
      </div>

      <svg viewBox="0 0 1000 550" style={{ width: "900px", height: "500px" }}>

        {/* ===== TOP ZONE (240 HEIGHT) ===== */}

        {/* Medieval */}
        <rect
          x="0"
          y="0"
          width="420"
          height="240"
          fill={getFill("Medieval", "#1e3a5f")}
          onClick={() => setSelected("Medieval")}
          onMouseEnter={() => setHovered("Medieval")}
          onMouseLeave={() => setHovered(null)}
        />
        <text x="210" y="120" textAnchor="middle">Medieval India</text>
        {door(170, 240, 250, 240)}

        {/* Helpdesk */}
        <rect
          x="420"
          y="0"
          width="200"
          height="240"
          fill={getFill("Helpdesk", "#1f4e79")}
          onClick={() => setSelected("Helpdesk")}
          onMouseEnter={() => setHovered("Helpdesk")}
          onMouseLeave={() => setHovered(null)}
        />
        <text x="520" y="120" textAnchor="middle">Help Desk</text>
        {door(480, 240, 560, 240)}

        {/* Washroom */}
        <rect x="620" y="0" width="380" height="240" fill="#444" />
        <line x1="810" y1="0" x2="810" y2="240" stroke="white" />
        <text x="715" y="120" textAnchor="middle">M</text>
        <text x="905" y="120" textAnchor="middle">F</text>
        {door(700, 240, 760, 240)}
        {door(850, 240, 910, 240)}

        {/* ===== CORRIDOR (CENTERED) ===== */}
        <rect x="0" y="240" width="880" height="70" fill="#8b5a2b" />
        <text x="440" y="275" textAnchor="middle">Corridor</text>

        {/* STAIRS */}
        <rect x="880" y="240" width="120" height="70" fill="#f59e0b" />
        <text x="940" y="275" textAnchor="middle" fill="black">Stairs</text>

        {/* ===== BOTTOM ZONE (240 HEIGHT) ===== */}

        {/* Art */}
        <rect
          x="0"
          y="310"
          width="420"
          height="240"
          fill={getFill("Art", "#7f1d1d")}
          onClick={() => setSelected("Art")}
          onMouseEnter={() => setHovered("Art")}
          onMouseLeave={() => setHovered(null)}
        />
        <text x="210" y="430" textAnchor="middle">Art Exhibition</text>
        {door(150, 310, 260, 310)}

        {/* Modern */}
        <rect
          x="420"
          y="310"
          width="580"
          height="240"
          fill={getFill("Modern", "#1e40af")}
          onClick={() => setSelected("Modern")}
          onMouseEnter={() => setHovered("Modern")}
          onMouseLeave={() => setHovered(null)}
        />
        <text x="710" y="430" textAnchor="middle">Modern India</text>
        {door(550, 310, 750, 310)}

      </svg>

      {selected && (
        <div style={{ marginTop: "6px" }}>
          Selected: <b>{selected}</b>
        </div>
      )}
    </div>
  );
}
