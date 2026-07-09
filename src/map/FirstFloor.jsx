import { useState } from "react";

export default function FirstFloor({
  onBack,
  onEnterMedieval,
  onEnterArt,
  onEnterModern,
}) {
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);

  const getFill = (name, base) => {
    if (selected === name) return "#2563eb";
    if (hovered === name) return "#60a5fa";
    return base;
  };

  const door = (x1, y1, x2, y2) => (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="#fbbf24"
      strokeWidth="4"
    />
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
      }}
    >
      {/* TOP BAR */}
      <div
        style={{
          width: "900px",
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "8px",
        }}
      >
        <button
          onClick={onBack}
          style={{
            padding: "6px 14px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>

        <h2 style={{ margin: 0 }}>First Floor</h2>

        <div />
      </div>

      <svg viewBox="0 0 1000 550" style={{ width: "900px", height: "500px" }}>

        {/* ===== TOP ZONE ===== */}

        {/* Medieval */}
        <rect
          x="0"
          y="0"
          width="420"
          height="240"
          fill={getFill("Medieval", "#1e3a5f")}
          onClick={() => {
            setSelected("Medieval");
            if (onEnterMedieval) onEnterMedieval();
          }}
          onMouseEnter={() => setHovered("Medieval")}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: "pointer" }}
        />
        <text x="210" y="120" textAnchor="middle" fill="white">
          Medieval India
        </text>
        {door(170, 240, 250, 240)}

        {/* Help Desk */}
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
        <text x="520" y="120" textAnchor="middle" fill="white">
          Help Desk
        </text>
        {door(480, 240, 560, 240)}

        {/* Washroom */}
        <rect x="620" y="0" width="380" height="240" fill="#444" />
        <line x1="810" y1="0" x2="810" y2="240" stroke="white" />
        <text x="715" y="120" textAnchor="middle" fill="white">
          M
        </text>
        <text x="905" y="120" textAnchor="middle" fill="white">
          F
        </text>
        {door(700, 240, 760, 240)}
        {door(850, 240, 910, 240)}

        {/* Corridor */}
        <rect x="0" y="240" width="880" height="70" fill="#8b5a2b" />
        <text x="440" y="280" textAnchor="middle" fill="white">
          Corridor
        </text>

        {/* Stairs */}
        <rect x="880" y="240" width="120" height="70" fill="#f59e0b" />
        <text x="940" y="280" textAnchor="middle" fill="black">
          Stairs
        </text>

        {/* ===== BOTTOM ZONE ===== */}

        {/* Art Exhibition */}
        <rect
          x="0"
          y="310"
          width="420"
          height="240"
          fill={getFill("Art", "#7f1d1d")}
          onClick={() => {
            setSelected("Art");
            if (onEnterArt) onEnterArt();
          }}
          onMouseEnter={() => setHovered("Art")}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: "pointer" }}
        />
        <text x="210" y="430" textAnchor="middle" fill="white">
          Art Exhibition
        </text>
        {door(150, 310, 260, 310)}

        {/* Modern India */}
        <rect
          x="420"
          y="310"
          width="580"
          height="240"
          fill={getFill("Modern", "#1e40af")}
          onClick={() => {
            setSelected("Modern");
            if (onEnterModern) onEnterModern();
          }}
          onMouseEnter={() => setHovered("Modern")}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: "pointer" }}
        />
        <text x="710" y="430" textAnchor="middle" fill="white">
          Modern India
        </text>
        {door(550, 310, 750, 310)}
      </svg>

      {selected && (
        <div style={{ marginTop: "10px" }}>
          Selected: <b>{selected}</b>
        </div>
      )}
    </div>
  );
}