export default function MedievalIndia({ onBack }) {
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

      <h1 style={{ marginBottom: "20px" }}>Medieval India Gallery</h1>

      <img
        src="/Medieval.png"
        alt="Medieval India Gallery"
        style={{
          width: "90%",
          maxWidth: "1200px",
          borderRadius: "12px",
          boxShadow: "0 0 20px rgba(0,0,0,0.5)",
        }}
      />
    </div>
  );
}