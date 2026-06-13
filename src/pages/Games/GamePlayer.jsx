import React, { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const GamePlayer = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  const url = searchParams.get("url");

  const dispatchGameKeyEvent = (type, key, code, keyCode) => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Build event with forced keyCode (read-only in constructor on modern browsers)
    const makeEvent = () => {
      const evt = new KeyboardEvent(type, {
        key, code, bubbles: true, cancelable: true, keyCode, which: keyCode,
      });
      try { Object.defineProperty(evt, "keyCode", { get: () => keyCode }); } catch {}
      try { Object.defineProperty(evt, "which",   { get: () => keyCode }); } catch {}
      return evt;
    };

    // Same-origin: dispatch to document and body
    try { iframe.contentWindow.document.dispatchEvent(makeEvent()); } catch {}
    try { iframe.contentWindow.document.body?.dispatchEvent(makeEvent()); } catch {}
    // Same-origin: dispatch to window
    try { iframe.contentWindow.dispatchEvent(makeEvent()); } catch {}
    // Cross-origin fallback: postMessage (works if the game listens for it)
    try { iframe.contentWindow?.postMessage({ type, key, code, keyCode }, "*"); } catch {}
  };

  const handleControlDown = (e, key, code, keyCode) => {
    e.preventDefault();
    dispatchGameKeyEvent("keydown", key, code, keyCode);
  };

  const handleControlUp = (e, key, code, keyCode) => {
    e.preventDefault();
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

          {/* D-pad: ↑ on top, ← ↓ → on bottom row — triangle layout */}
          <div style={{ position: "absolute", bottom: "1.5rem", left: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", zIndex: 100000, pointerEvents: "auto", userSelect: "none" }}>
            {/* Up */}
            <button
              onPointerDown={e => handleControlDown(e, "ArrowUp", "ArrowUp", 38)}
              onPointerUp={e => handleControlUp(e, "ArrowUp", "ArrowUp", 38)}
              onPointerLeave={e => handleControlUp(e, "ArrowUp", "ArrowUp", 38)}
              onContextMenu={e => e.preventDefault()}
              style={controlButtonStyle}
            >
              ↑
            </button>
            {/* ← ↓ → row */}
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onPointerDown={e => handleControlDown(e, "ArrowLeft", "ArrowLeft", 37)}
                onPointerUp={e => handleControlUp(e, "ArrowLeft", "ArrowLeft", 37)}
                onPointerLeave={e => handleControlUp(e, "ArrowLeft", "ArrowLeft", 37)}
                onContextMenu={e => e.preventDefault()}
                style={controlButtonStyle}
              >
                ←
              </button>
              <button
                onPointerDown={e => handleControlDown(e, "ArrowDown", "ArrowDown", 40)}
                onPointerUp={e => handleControlUp(e, "ArrowDown", "ArrowDown", 40)}
                onPointerLeave={e => handleControlUp(e, "ArrowDown", "ArrowDown", 40)}
                onContextMenu={e => e.preventDefault()}
                style={controlButtonStyle}
              >
                ↓
              </button>
              <button
                onPointerDown={e => handleControlDown(e, "ArrowRight", "ArrowRight", 39)}
                onPointerUp={e => handleControlUp(e, "ArrowRight", "ArrowRight", 39)}
                onPointerLeave={e => handleControlUp(e, "ArrowRight", "ArrowRight", 39)}
                onContextMenu={e => e.preventDefault()}
                style={controlButtonStyle}
              >
                →
              </button>
            </div>
          </div>

          {/* Action button — bottom right */}
          <div style={{ position: "absolute", bottom: "1.5rem", right: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100000, pointerEvents: "auto", userSelect: "none" }}>
            <button
              onPointerDown={e => handleControlDown(e, " ", "Space", 32)}
              onPointerUp={e => handleControlUp(e, " ", "Space", 32)}
              onPointerLeave={e => handleControlUp(e, " ", "Space", 32)}
              onContextMenu={e => e.preventDefault()}
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
  touchAction: "none",
  userSelect: "none",
  WebkitUserSelect: "none",
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
  touchAction: "none",
  userSelect: "none",
  WebkitUserSelect: "none",
};

export default GamePlayer;
