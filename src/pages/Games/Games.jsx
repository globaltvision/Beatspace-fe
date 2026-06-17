import React, { useState } from "react";
import { Box, Image } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import UserHeader from "../../components/common/UserHeader";
import { useTranslation } from "react-i18next";
import { publicAxios } from "../../configs/axios.config";

const getGamesFromResponse = (response) => {
  const payload = response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.games)) return payload.games;
  if (Array.isArray(payload?.data?.games)) return payload.data.games;
  return [];
};

// Scoped styles — `!important` is required to beat the global App.css rule
// that forces font-size:36px / Vision font onto every span & div.
const GAMES_STYLES = `
  @keyframes pixelBounce {
    0%, 100% { transform: translateY(0); opacity: 1; }
    50% { transform: translateY(-14px); opacity: 0.4; }
  }
  .gm-pixel {
    font-family: "Press Start 2P", monospace !important;
    font-weight: 400 !important;
  }
  .gm-loading  { font-size: 9px !important;  letter-spacing: 0.1em;  color: rgba(246,244,211,0.55); }
  .gm-empty    { font-size: 11px !important; letter-spacing: 0.1em;  color: rgba(246,244,211,0.4); line-height: 1.8; text-align: center; }
  .gm-play     { font-size: 10px !important; color: #F6F4D3; text-shadow: 2px 2px 0 #000; }
  .gm-title    { font-size: 14px !important;  line-height: 1.6; text-align: center; text-shadow: 1px 1px 0 #000;
                 display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
                 overflow: hidden; word-break: break-word; }
  @media (max-width: 600px) { .gm-title { font-size: 7px !important; } }
`;

// ── Loader ──────────────────────────────────────────────────────────────────
const PixelLoader = () => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: "2rem" }}>
    <div style={{ display: "flex", gap: "10px" }}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            width: "12px",
            height: "12px",
            background: "#F6F4D3",
            imageRendering: "pixelated",
            boxShadow: "0 0 10px rgba(246,244,211,0.5)",
            animation: `pixelBounce 0.9s ease-in-out ${i * 0.15}s infinite`,
          }}
        />
      ))}
    </div>
    <span className="gm-pixel gm-loading">LOADING</span>
  </div>
);

// ── Card ─────────────────────────────────────────────────────────────────────
const GameCard = ({ game, onClick }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => setHovered(false)}
      style={{
        cursor: "pointer",
        position: "relative",
        background: "#0a0f2e",
        border: "3px solid",
        borderColor: hovered ? "#F6F4D3" : "rgba(246,244,211,0.35)",
        boxShadow: hovered
          ? "0 0 0 2px #0a0f2e, 0 0 18px rgba(246,244,211,0.35), 8px 8px 0 rgba(0,0,0,0.5)"
          : "6px 6px 0 rgba(0,0,0,0.45)",
        transition: "transform 0.15s steps(2), border-color 0.15s, box-shadow 0.15s",
        transform: hovered ? "translate(-2px,-2px)" : "none",
        display: "flex",
        flexDirection: "column",
        imageRendering: "pixelated",
      }}
    >
      {/* ── Thumbnail (white frame) ── */}
      <div style={{ position: "relative", aspectRatio: "1 / 1", background: "#fff", padding: "6px", borderBottom: "3px solid rgba(246,244,211,0.35)" }}>
        <div style={{ width: "100%", height: "100%", overflow: "hidden", background: "#fff" }}>
          {game.image ? (
            <img
              src={game.image}
              alt={game.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                transition: "transform 0.2s steps(3)",
                transform: hovered ? "scale(1.05)" : "scale(1)",
                display: "block",
                imageRendering: "auto",
              }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0f2e" }}>
              <span className="gm-pixel gm-play">?</span>
            </div>
          )}
        </div>

        {/* Play overlay on hover */}
        <div style={{
          position: "absolute", inset: "6px",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: hovered ? "rgba(10,15,46,0.55)" : "transparent",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.15s, background 0.15s",
          pointerEvents: "none",
        }}>
          <span className="gm-pixel gm-play">▶ PLAY</span>
        </div>
      </div>

      {/* ── Title bar ── */}
      <div style={{ padding: "10px 8px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "44px" }}>
        <span className="gm-pixel gm-title" style={{ color: hovered ? "#F6F4D3" : "rgba(246,244,211,0.8)" }}>
          {game.name}
        </span>
      </div>
    </div>
  );
};

// ── Page ─────────────────────────────────────────────────────────────────────
const Games = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: games = [], isLoading } = useQuery({
    queryKey: ["public-games"],
    queryFn: async () => getGamesFromResponse(await publicAxios.get("/public/games")),
  });

  const handleGameClick = (game) => {
    if (game.launch_url) {
      navigate(`/games/play?url=${encodeURIComponent(game.launch_url)}`);
    }
  };

  return (
    <>
      <style>{GAMES_STYLES}</style>
      <UserHeader title={t("games_page.title")} />

      <Box
        style={{
          position: "relative",
          zIndex: 3,
          minHeight: "100%",
          paddingTop: "24vh",   // clear the fixed header (bottom edge ~23vh)
          paddingBottom: "5rem",
        }}
      >
        {/* floating clouds */}
        {[
          { style: { left: "-2rem", top: "40%", width: "7rem", height: "4.5rem", animation: "floatCloud1 8s ease-in-out infinite" }, className: "max-sm:!left-[-6.5rem] max-sm:!h-24 max-sm:!w-24 min-md:!left-20 min-md:!h-32 min-md:!w-32" },
          { style: { right: "1rem", top: "25%", width: "3.5rem", height: "2rem", animation: "floatCloud2 6s ease-in-out infinite" }, className: "max-sm:!right-[-10%] min-md:!right-[16%] min-md:!h-16 min-md:!w-16" },
        ].map((cloud, i) => (
          <Image key={i} src="/assets/Cloud.webp" alt="" style={{ position: "fixed", opacity: 0.7, zIndex: 1, pointerEvents: "none", ...cloud.style }} className={cloud.className} />
        ))}

        <Box style={{ maxWidth: "1000px", width: "100%", margin: "0 auto", padding: "0 clamp(14px, 4vw, 32px)", position: "relative", zIndex: 2 }}>
          {isLoading ? (
            <PixelLoader />
          ) : games.length === 0 ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "40vh" }}>
              <span className="gm-pixel gm-empty">
                {t("games_page.no_games") || "NO GAMES YET"}
              </span>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, clamp(120px, 24vw, 180px))",
              justifyContent: "center",
              gap: "clamp(14px, 3vw, 24px)",
            }}>
              {games.map((game) => {
                const gameId = game._id || game.id || game.slug || game.name;
                return (
                  <GameCard
                    key={gameId}
                    game={game}
                    onClick={() => handleGameClick(game)}
                  />
                );
              })}
            </div>
          )}
        </Box>
      </Box>
    </>
  );
};

export default Games;
