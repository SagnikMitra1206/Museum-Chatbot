export default function GroundFloor({
  onBack,
  onEnterPrehistoric,
  onEnterAncient,
  onEnterInteractive,
}) {
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
            padding: "8px 16px",
            border: "none",
            borderRadius: "6px",
            background: "#3b82f6",
            color: "white",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>

        <h2 style={{ margin: 0 }}>Ground Floor</h2>

        <div />
      </div>

      <svg
        viewBox="0 0 900 420"
        style={{ width: "900px", height: "500px" }}
      >
        {/* ===== PREHISTORIC ===== */}
        <rect
          x="0"
          y="0"
          width="540"
          height="170"
          fill="#334155"
          onClick={onEnterPrehistoric}
          style={{ cursor: "pointer" }}
        />

        <text
          x="270"
          y="90"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize="22"
          fontWeight="bold"
          onClick={onEnterPrehistoric}
          style={{ cursor: "pointer" }}
        >
          Prehistoric
        </text>

        {/* ===== ENTRY ===== */}
        <rect
          x="540"
          y="0"
          width="60"
          height="170"
          fill="#92400e"
        />

        {/* ===== SHOWHOUSE ===== */}
        <rect
          x="600"
          y="0"
          width="300"
          height="170"
          fill="#475569"
        />

        <text
          x="750"
          y="35"
          textAnchor="middle"
          fill="white"
        >
          Showhouse
        </text>

        {/* SCREEN */}
        <rect
          x="650"
          y="10"
          width="200"
          height="40"
          fill="#1e293b"
        />

        <text
          x="750"
          y="35"
          textAnchor="middle"
          fontSize="12"
          fill="white"
        >
          Screen
        </text>

        {/* ===== CORRIDOR ===== */}
        <rect
          x="0"
          y="170"
          width="780"
          height="80"
          fill="#78350f"
        />

        <text
          x="390"
          y="215"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
        >
          Corridor
        </text>

        {/* ===== STAIRS ===== */}
        <rect
          x="780"
          y="170"
          width="120"
          height="80"
          fill="#f59e0b"
        />

        <text
          x="840"
          y="215"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="black"
        >
          Stairs
        </text>

        {/* ===== ANCIENT INDIA ===== */}
        <rect
          x="0"
          y="250"
          width="540"
          height="170"
          fill="#7f1d1d"
          onClick={onEnterAncient}
          style={{ cursor: "pointer" }}
        />

        <text
          x="270"
          y="335"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize="22"
          fontWeight="bold"
          onClick={onEnterAncient}
          style={{ cursor: "pointer" }}
        >
          Ancient India
        </text>

        {/* ===== INTERACTIVE ZONE ===== */}
        <rect
          x="540"
          y="250"
          width="360"
          height="170"
          fill="#1e40af"
          onClick={onEnterInteractive}
          style={{ cursor: "pointer" }}
        />

        <text
          x="720"
          y="335"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize="20"
          fontWeight="bold"
          onClick={onEnterInteractive}
          style={{ cursor: "pointer" }}
        >
          Interactive Zone
        </text>
      </svg>
    </div>
  );
}