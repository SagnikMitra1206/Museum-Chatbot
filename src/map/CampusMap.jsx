export default function CampusMap({ onEnter }) {
  return (
    <div className="map">
      <h2>Campus Overview</h2>

<div className="campus">
  <img src="/map.png" alt="Campus Map" className="campus-img" />

  <div className="main-building" onClick={onEnter}></div>
</div>
    </div>
  );
}