import { useState } from "react";
import "./Prehistoric.css";

export default function Prehistoric({ onBack }) {
  const [selected, setSelected] = useState(null);

  const data = {
    dino: {
      title: "T-Rex Skeleton",
      desc: "One of the most powerful predators of the prehistoric era. This skeleton represents the dominance of carnivorous dinosaurs."
    },
    mammoth: {
      title: "Woolly Mammoth",
      desc: "A massive herbivore from the Ice Age, known for its thick fur and long curved tusks."
    }
  };

  return (
    <div className="prehistoric-page">

      {/* BACK */}
      <button className="back-btn" onClick={onBack}>
        ← Back
      </button>

      {/* ROOM IMAGE */}
      <div className="room">

        {/* 🦖 DINOSAUR HOTSPOT */}
        <div
          className="hotspot dino"
          onClick={() => setSelected("dino")}
        ></div>

        {/* 🐘 MAMMOTH HOTSPOT */}
        <div
          className="hotspot mammoth"
          onClick={() => setSelected("mammoth")}
        ></div>

      </div>

      {/* MODAL */}
      {selected && (
        <div className="artifact-modal">
          <div className="modal-content">
            <h3>{data[selected].title}</h3>
            <p>{data[selected].desc}</p>

            <button onClick={() => setSelected(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}