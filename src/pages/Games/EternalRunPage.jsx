import { useNavigate } from "react-router-dom";

const EternalRunPage = () => {
  const navigate = useNavigate();
  return (
    <div style={{
      position: "fixed", top: 0, left: 0,
      width: "100vw", height: "100vh",
      background: "#11131a", zIndex: 99999,
      overflow: "hidden"
    }}>
      <button onClick={() => navigate("/games")} style={{
        position: "fixed", top: "1rem", left: "1rem",
        zIndex: 100000, background: "rgba(0,0,0,0.7)",
        color: "#fff", border: "1px solid #555",
        padding: "0.4rem 1.2rem", borderRadius: "6px",
        cursor: "pointer", fontSize: "14px"
      }}>← Back</button>
      <iframe
        src="/EternalRun_Web/index.html"
        title="Eternal Run"
        style={{ width: "100%", height: "100%", border: "none", display: "block" }}
        allow="autoplay"
      />
    </div>
  );
};

export default EternalRunPage;
