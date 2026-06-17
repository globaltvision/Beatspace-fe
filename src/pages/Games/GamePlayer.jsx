import React, { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const R2_HOST = "pub-05996c159fb94c24a47d19984427a923.r2.dev";

// Convert R2 URL → same-origin proxy path so iframe is same-origin
// and keyboard events can be injected by the D-pad
const toProxyUrl = (url) => {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname === R2_HOST) return "/r2" + u.pathname;
  } catch {}
  return url;
};

const GamePlayer = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  const url = searchParams.get("url");
  const proxiedUrl = toProxyUrl(url);

  const focusIframe = () => {
    try { iframeRef.current?.focus(); } catch {}
    try { iframeRef.current?.contentWindow?.focus(); } catch {}
  };

  const dispatchGameKeyEvent = (type, key, code, keyCode) => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const makeEvent = () => {
      const evt = new KeyboardEvent(type, {
        key, code, bubbles: true, cancelable: true, keyCode, which: keyCode,
      });
      try { Object.defineProperty(evt, "keyCode", { get: () => keyCode }); } catch {}
      try { Object.defineProperty(evt, "which",   { get: () => keyCode }); } catch {}
      return evt;
    };

    // Dispatched to the game's document/window (works because proxy makes it same-origin)
    try { iframe.contentWindow.document.dispatchEvent(makeEvent()); } catch {}
    try { iframe.contentWindow.document.body?.dispatchEvent(makeEvent()); } catch {}
    try { iframe.contentWindow.dispatchEvent(makeEvent()); } catch {}
  };

  const handleControlDown = (e, key, code, keyCode) => {
    e.preventDefault();
    focusIframe();
    dispatchGameKeyEvent("keydown", key, code, keyCode);
  };

  const handleControlUp = (e, key, code, keyCode) => {
    e.preventDefault();
    dispatchGameKeyEvent("keyup", key, code, keyCode);
    focusIframe();
  };

  // Focus iframe after it loads so keyboard events reach the game immediately
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const onLoad = () => focusIframe();
    iframe.addEventListener("load", onLoad);
    return () => iframe.removeEventListener("load", onLoad);
  }, [proxiedUrl]);

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

      {proxiedUrl ? (
        <>
          <iframe
            ref={iframeRef}
            src={proxiedUrl}
            title="Game Player"
            style={{ width: "100%", height: "100%", border: "none", display: "block" }}
            allow="autoplay"
          />

          {/* D-pad: ↑ on top, ← ↓ → on bottom row — triangle layout */}
          <div style={{ position: "absolute", bottom: "max(calc(2rem + env(safe-area-inset-bottom, 0px)), calc(50vh - 260px))", left: "max(calc(2rem + env(safe-area-inset-left, 0px)), calc(50vw - 530px))", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", zIndex: 100000, pointerEvents: "auto", userSelect: "none" }}>
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
          <div style={{ position: "absolute", bottom: "max(calc(2rem + env(safe-area-inset-bottom, 0px)), calc(50vh - 260px))", right: "max(calc(2rem + env(safe-area-inset-right, 0px)), calc(50vw - 420px))", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100000, pointerEvents: "auto", userSelect: "none" }}>
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
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "1rem" }}>
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
