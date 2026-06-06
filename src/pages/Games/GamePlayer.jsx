import React, { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const GamePlayer = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  const url = searchParams.get("url");

  const dispatchGameKeyEvent = (type, key, code, keyCode) => {
    const targetWindow = iframeRef.current?.contentWindow;
    if (!targetWindow) return;

    try {
      const event = new KeyboardEvent(type, {
        key,
        code,
        keyCode,
        bubbles: true,
        cancelable: true,
      });

      targetWindow.document.dispatchEvent(event);
      targetWindow.dispatchEvent(event);
    } catch (error) {
      console.warn("Could not send game control event", error);
    }
  };

  const handleControlDown = (key, code, keyCode) => {
    dispatchGameKeyEvent("keydown", key, code, keyCode);
  };

  const handleControlUp = (key, code, keyCode) => {
    dispatchGameKeyEvent("keyup", key, code, keyCode);
  };

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.focus();
      } catch {
        // ignore cross-origin focus issues
      }
    }
  }, [url]);

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
        <>
          <iframe
            ref={iframeRef}
            src={url}
            title="Game Player"
            style={{ width: "100%", height: "100%", border: "none", display: "block" }}
            allow="autoplay"
          />

          <div style={{ position: "absolute", bottom: "1.5rem", left: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem", zIndex: 100000, pointerEvents: "auto" }}>
            <button
              onPointerDown={() => handleControlDown("ArrowUp", "ArrowUp", 38)}
              onPointerUp={() => handleControlUp("ArrowUp", "ArrowUp", 38)}
              onPointerLeave={() => handleControlUp("ArrowUp", "ArrowUp", 38)}
              style={controlButtonStyle}
            >
              ↑
            </button>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onPointerDown={() => handleControlDown("ArrowLeft", "ArrowLeft", 37)}
                onPointerUp={() => handleControlUp("ArrowLeft", "ArrowLeft", 37)}
                onPointerLeave={() => handleControlUp("ArrowLeft", "ArrowLeft", 37)}
                style={controlButtonStyle}
              >
                ←
              </button>
              <button
                onPointerDown={() => handleControlDown("ArrowRight", "ArrowRight", 39)}
                onPointerUp={() => handleControlUp("ArrowRight", "ArrowRight", 39)}
                onPointerLeave={() => handleControlUp("ArrowRight", "ArrowRight", 39)}
                style={controlButtonStyle}
              >
                →
              </button>
            </div>
            <button
              onPointerDown={() => handleControlDown("ArrowDown", "ArrowDown", 40)}
              onPointerUp={() => handleControlUp("ArrowDown", "ArrowDown", 40)}
              onPointerLeave={() => handleControlUp("ArrowDown", "ArrowDown", 40)}
              style={controlButtonStyle}
            >
              ↓
            </button>
          </div>

          <div style={{ position: "absolute", bottom: "1.5rem", right: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100000, pointerEvents: "auto" }}>
            <button
              onPointerDown={() => handleControlDown(" ", "Space", 32)}
              onPointerUp={() => handleControlUp(" ", "Space", 32)}
              style={actionButtonStyle}
            >
              A
            </button>
          </div>
        </>
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

const controlButtonStyle = {
  width: "3.4rem",
  height: "3.4rem",
  borderRadius: "16px",
  border: "1px solid rgba(246,244,211,0.75)",
  background: "rgba(246,244,211,0.15)",
  color: "#F6F4D3",
  fontSize: "1.4rem",
  fontWeight: 700,
  cursor: "pointer",
  pointerEvents: "auto",
};

const actionButtonStyle = {
  width: "4.5rem",
  height: "4.5rem",
  borderRadius: "50%",
  border: "1px solid rgba(246,244,211,0.8)",
  background: "rgba(246,244,211,0.15)",
  color: "#F6F4D3",
  fontSize: "1.5rem",
  fontWeight: 700,
  cursor: "pointer",
  pointerEvents: "auto",
};

export default GamePlayer;
