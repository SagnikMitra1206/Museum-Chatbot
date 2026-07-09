import { useState } from "react";
import CampusMap from "./CampusMap";
import BuildingEntry from "./BuildingEntry";
import GroundFloor from "./GroundFloor";
import FirstFloor from "./FirstFloor";

import Prehistoric from "./Prehistoric";
import AncientIndia from "./AncientIndia";
import InteractiveZone from "./InteractiveZone";
import MedievalIndia from "./MedievalIndia";
import ArtExhibition from "./ArtExhibition";
import ModernIndia from "./ModernIndia";

export default function MuseumMap({ onClose }) {
  const [view, setView] = useState("campus");

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "#fff",
      }}
    >
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
          cursor: "pointer",
        }}
      >
        ✖ Close
      </button>

      {/* ================= CAMPUS ================= */}

      {view === "campus" && (
        <CampusMap onEnter={() => setView("building")} />
      )}

      {/* ================= BUILDING ================= */}

      {view === "building" && (
        <BuildingEntry
          onGround={() => setView("ground")}
          onFirst={() => setView("first")}
        />
      )}

      {/* ================= GROUND FLOOR ================= */}

      {view === "ground" && (
        <GroundFloor
          onBack={() => setView("building")}
          onEnterPrehistoric={() => setView("prehistoric")}
          onEnterAncient={() => setView("ancient")}
          onEnterInteractive={() => setView("interactive")}
        />
      )}

      {/* ================= FIRST FLOOR ================= */}

      {view === "first" && (
        <FirstFloor
          onBack={() => setView("building")}
          onEnterMedieval={() => setView("medieval")}
          onEnterArt={() => setView("art")}
          onEnterModern={() => setView("modern")}
        />
      )}

      {/* ================= GROUND FLOOR GALLERIES ================= */}

      {view === "prehistoric" && (
        <Prehistoric onBack={() => setView("ground")} />
      )}

      {view === "ancient" && (
        <AncientIndia onBack={() => setView("ground")} />
      )}

      {view === "interactive" && (
        <InteractiveZone onBack={() => setView("ground")} />
      )}

      {/* ================= FIRST FLOOR GALLERIES ================= */}

      {view === "medieval" && (
        <MedievalIndia onBack={() => setView("first")} />
      )}

      {view === "art" && (
        <ArtExhibition onBack={() => setView("first")} />
      )}

      {view === "modern" && (
        <ModernIndia onBack={() => setView("first")} />
      )}
    </div>
  );
}