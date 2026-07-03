export default function BuildingEntry({ onGround, onFirst }) {
  return (
    <div className="entry-screen">
      
      {/* Icon / top element */}
      <div className="entry-icon">🏛️</div>

      {/* Title */}
      <h1 className="entry-title">MAIN BUILDING</h1>
      <p className="entry-subtitle">Select a level to explore</p>

      {/* Level Selection */}
      <div className="level-box">
        
        <div onClick={onFirst} className="level-card">
          <h2>1</h2>
          <p>FIRST FLOOR</p>
          <span>View Layout</span>
        </div>

        <div onClick={onGround} className="level-card">
          <h2>G</h2>
          <p>GROUND FLOOR</p>
          <span>View Layout</span>
        </div>

      </div>
    </div>
  );
}