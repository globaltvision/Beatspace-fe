import { useNavigate, useSearchParams } from "react-router-dom";

const GamePlayer = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const url = searchParams.get("url");

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "#11131a",
        zIndex: 99999,
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => navigate("/games")}
        style={{
          position: "fixed",
          top: "1rem",
          left: "1rem",
          zIndex: 100000,
          background: "rgba(0,0,0,0.7)",
          color: "#fff",
          border: "1px solid #555",
          padding: "0.4rem 1.2rem",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        ← Back
      </button>

      {url ? (
        <iframe
          src={url}
          title="Game Player"
          style={{ width: "100%", height: "100%", border: "none", display: "block" }}
          allow="autoplay"
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "1rem",
          }}
        >
          No game URL provided.
        </div>
      )}
    </div>
  );
};

export default GamePlayer;
