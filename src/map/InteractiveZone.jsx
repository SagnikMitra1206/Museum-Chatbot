export default function InteractiveZone({ onBack }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111827",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <button
        onClick={onBack}
        style={{
          alignSelf: "flex-start",
          padding: "8px 16px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        ← Back
      </button>

      <h1 style={{ marginBottom: "20px" }}>
        Interactive Zone
      </h1>

      <img
        src="/Interactive.png"
        alt="Interactive Zone"
        style={{
          width: "95%",
          maxWidth: "1200px",
          borderRadius: "12px",
        }}
      />
    </div>
  );
}