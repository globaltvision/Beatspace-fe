import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const EternalRunPage = () => {
  const navigate = useNavigate();
  const iframeRef = useRef(null);

  const dispatchGameKeyEvent = (type, key, code, keyCode) => {
    const targetWindow = iframeRef.current?.contentWindow;
    if (!targetWindow) {
      console.error("❌ No iframe window available");
      return;
    }

    console.log(`🎮 Parent: Sending ${type} for key ${key} (${keyCode})`);

    // Use postMessage to communicate with iframe (more reliable for cross-origin)
    try {
      targetWindow.postMessage({
        source: 'dpad-control',
        type: type,
        key: key,
        code: code,
        keyCode: keyCode
      }, '*');
      console.log(`✅ Parent: Message sent successfully`);
    } catch (error) {
      console.error("❌ Could not send game control message", error);
    }
  };

  const handleControlDown = (e, key, code, keyCode) => {
    console.log(`🖱️ Button pressed: ${key}`);
    e.preventDefault();
    e.stopPropagation();
    dispatchGameKeyEvent("keydown", key, code, keyCode);
  };

  const handleControlUp = (e, key, code, keyCode) => {
    console.log(`🖱️ Button released: ${key}`);
    e.preventDefault();
    e.stopPropagation();
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
  }, []);

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
      
      {/* Game iframe with margins to avoid D-pad overlap */}
      <div style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 180px 0 180px"
      }}>
        <iframe
          ref={iframeRef}
          src="/games/EternalRun_Web/index.html"
          title="Eternal Run"
          style={{ 
            width: "100%", 
            height: "100%", 
            border: "none", 
            display: "block",
            maxWidth: "800px"
          }}
          allow="autoplay"
        />
      </div>

      {/* D-pad controls with background overlay */}
      <div style={{ 
        position: "absolute", 
        bottom: "1rem", 
        left: "1rem", 
        display: "flex", 
        flexDirection: "column", 
        gap: "0.75rem", 
        zIndex: 100000, 
        pointerEvents: "auto",
        padding: "1rem",
        borderRadius: "20px",
        background: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(10px)"
      }}>
        <button
          onPointerDown={(e) => handleControlDown(e, "ArrowUp", "ArrowUp", 38)}
          onPointerUp={(e) => handleControlUp(e, "ArrowUp", "ArrowUp", 38)}
          onPointerLeave={(e) => handleControlUp(e, "ArrowUp", "ArrowUp", 38)}
          onContextMenu={(e) => e.preventDefault()}
          style={controlButtonStyle}
        >
          ↑
        </button>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onPointerDown={(e) => handleControlDown(e, "ArrowLeft", "ArrowLeft", 37)}
            onPointerUp={(e) => handleControlUp(e, "ArrowLeft", "ArrowLeft", 37)}
            onPointerLeave={(e) => handleControlUp(e, "ArrowLeft", "ArrowLeft", 37)}
            onContextMenu={(e) => e.preventDefault()}
            style={controlButtonStyle}
          >
            ←
          </button>
          <button
            onPointerDown={(e) => handleControlDown(e, "ArrowRight", "ArrowRight", 39)}
            onPointerUp={(e) => handleControlUp(e, "ArrowRight", "ArrowRight", 39)}
            onPointerLeave={(e) => handleControlUp(e, "ArrowRight", "ArrowRight", 39)}
            onContextMenu={(e) => e.preventDefault()}
            style={controlButtonStyle}
          >
            →
          </button>
        </div>
        <button
          onPointerDown={(e) => handleControlDown(e, "ArrowDown", "ArrowDown", 40)}
          onPointerUp={(e) => handleControlUp(e, "ArrowDown", "ArrowDown", 40)}
          onPointerLeave={(e) => handleControlUp(e, "ArrowDown", "ArrowDown", 40)}
          onContextMenu={(e) => e.preventDefault()}
          style={controlButtonStyle}
        >
          ↓
        </button>
      </div>

      {/* Action button with background overlay */}
      <div style={{ 
        position: "absolute", 
        bottom: "1rem", 
        right: "1rem", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        zIndex: 100000, 
        pointerEvents: "auto",
        padding: "1rem",
        borderRadius: "50%",
        background: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(10px)"
      }}>
        <button
          onPointerDown={(e) => handleControlDown(e, " ", "Space", 32)}
          onPointerUp={(e) => handleControlUp(e, " ", "Space", 32)}
          onPointerLeave={(e) => handleControlUp(e, " ", "Space", 32)}
          onContextMenu={(e) => e.preventDefault()}
          style={actionButtonStyle}
        >
          A
        </button>
      </div>
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
  WebkitTapHighlightColor: "transparent",
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
  WebkitTapHighlightColor: "transparent",
};
export default EternalRunPage;
