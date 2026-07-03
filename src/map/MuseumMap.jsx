import { useState } from "react";
import CampusMap from "./CampusMap";
import BuildingEntry from "./BuildingEntry";
import GroundFloor from "./GroundFloor";
import FirstFloor from "./FirstFloor";
import Prehistoric from "./Prehistoric"; // ✅ NEW

export default function MuseumMap({ onClose }) {
  const [view, setView] = useState("campus");

  return (
    <div style={{ position: "relative", minHeight: "100vh", background: "#fff" }}>
      
      {/* CLOSE BUTTON */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: 1000,
          padding: "8px 14px",
          borderRadius: "6px",
          border: "none",
          background: "#1f2d3d",
          color: "white",
          cursor: "pointer"
        }}
      >
        ✖ Close
      </button>

      {/* ===== MAP FLOW ===== */}

      {view === "campus" && (
        <CampusMap onEnter={() => setView("building")} />
      )}

      {view === "building" && (
        <BuildingEntry
          onGround={() => setView("ground")}
          onFirst={() => setView("first")}
        />
      )}

      {view === "ground" && (
        <GroundFloor
          onBack={() => setView("building")}
          onEnterPrehistoric={() => setView("prehistoric")} // ✅ NEW
        />
      )}

      {view === "first" && (
        <FirstFloor onBack={() => setView("building")} />
      )}

      {view === "prehistoric" && (
        <Prehistoric onBack={() => setView("ground")} /> // ✅ NEW
      )}

    </div>
  );
}