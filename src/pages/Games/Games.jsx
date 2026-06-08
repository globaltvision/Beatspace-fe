import React, { useState } from "react";
import { Box, Image, Skeleton, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import UserHeader from "../../components/common/UserHeader";
import { useTranslation } from "react-i18next";
import { publicAxios } from "../../configs/axios.config";

const VISION = { fontFamily: '"Vision Font", monospace, sans-serif' };

const getGamesFromResponse = (response) => {
  const payload = response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.games)) return payload.games;
  if (Array.isArray(payload?.data?.games)) return payload.data.games;
  return [];
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch {
    return "";
  }
};

const Games = () => {
  const { t } = useTranslation();
  const [hoveredId, setHoveredId] = useState(null);
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
      <UserHeader title={t("games_page.title")} />

      <Box style={{ position: "relative", minHeight: "100vh", padding: "2rem", marginTop: "100px ", zIndex: 3 }}>

        {/* ── floating clouds ── */}
        {[
          { style: { left: "-2rem", top: "40%", width: "7rem", height: "4.5rem", animation: "floatCloud1 8s ease-in-out infinite" }, className: "max-sm:!left-[-6.5rem] max-sm:!h-24 max-sm:!w-24 min-md:!left-20 min-md:!h-32 min-md:!w-32 min-lg:!left-32 min-lg:!h-32 min-lg:!w-36 min-xl:!left-44 min-xl:!h-40 min-xl:!w-40" },
          { style: { right: "1rem", top: "25%", width: "3.5rem", height: "2rem", animation: "floatCloud2 6s ease-in-out infinite" }, className: "max-sm:!right-[-10%] min-md:!right-[16%] min-md:!h-16 min-md:!w-16 min-lg:!right-[20%] min-lg:!h-20 min-lg:!w-20 min-xl:!right-[20%] min-xl:!h-28 min-xl:!w-28" },
          { style: { right: "0%", top: "90%", width: "8rem", height: "5rem", transform: "scaleX(-1)", animation: "floatCloud3 10s ease-in-out infinite" }, className: "max-sm:!right-[-6rem] max-sm:!h-24 max-sm:!w-24 min-md:!right-[20%] min-md:!top-[90%] min-lg:!right-[0%] min-lg:!h-32 min-lg:!w-32 min-xl:!right-[0%] min-xl:!h-40 min-xl:!w-40" },
        ].map((cloud, i) => (
          <Image
            key={i}
            src="/assets/Cloud.webp"
            alt="Cloud"
            style={{ position: "fixed", opacity: 0.9, filter: "drop-shadow(0 4px 3px rgb(0 0 0 / 0.07))", zIndex: 1, pointerEvents: "none", ...cloud.style }}
            className={cloud.className}
          />
        ))}

        {/* ── grid ── */}
        <Box style={{ maxWidth: "1200px", width: "100%", margin: "80px auto", position: "relative", zIndex: 2, paddingInline: "20px" }}>

          {isLoading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "2rem" }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ borderRadius: "16px", overflow: "hidden", background: "rgba(8,18,55,.85)" }}>
                  <Skeleton height={190} radius={0} />
                  <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <Skeleton height={18} width="40%" radius="xl" />
                    <Skeleton height={22} width="70%" />
                    <Skeleton height={36} />
                    <Skeleton height={42} mt={6} />
                  </div>
                </div>
              ))}
            </div>

          ) : games.length === 0 ? (
            <Box style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
              <Text style={{ ...VISION, fontSize: "1.4rem", color: "#9CA3AF", letterSpacing: "0.05em" }}>
                {t("games_page.no_games") || "No games available"}
              </Text>
            </Box>

          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "28px" }}>
              {games.map((game) => {
                const gameId = game._id || game.id || game.slug || game.name;
                const isHovered = hoveredId === gameId;

                return (
                  <div
                    key={gameId}
                    onMouseEnter={() => setHoveredId(gameId)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => handleGameClick(game)}
                    style={{
                      ...VISION,
                      cursor: "pointer",
                      borderRadius: "16px",
                      overflow: "hidden",
                      background: isHovered
                        ? "rgba(12, 24, 68, 0.97)"
                        : "rgba(8, 15, 45, 0.92)",
                      border: isHovered
                        ? "1px solid rgba(246,244,211,0.55)"
                        : "1px solid rgba(246,244,211,0.12)",
                      transition: "all 0.3s ease",
                      transform: isHovered ? "translateY(-6px)" : "translateY(0)",
                      backdropFilter: "blur(14px)",
                      boxShadow: isHovered
                        ? "0 20px 50px rgba(0,0,0,0.55), 0 0 0 1px rgba(246,244,211,0.1)"
                        : "0 6px 24px rgba(0,0,0,0.4)",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* ── thumbnail ── */}
                    <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden", background: "#fff", borderRadius: "20px", padding: "8px" }}>
                      <div style={{ width: "100%", height: "100%", borderRadius: "16px", overflow: "hidden", background: "#fff" }}>
                        {game.image ? (
                          <img
                            src={game.image}
                            alt={game.name}
                            style={{
                              width: "100%", height: "100%", objectFit: "contain",
                              transition: "transform 0.45s ease",
                              transform: isHovered ? "scale(1.02)" : "scale(1)",
                              background: "#fff",
                            }}
                          />
                        ) : (
                        <div style={{
                          width: "100%", height: "100%",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: "linear-gradient(135deg,#0b1640 0%,#111f5c 100%)",
                        }}>
                          <span style={{ ...VISION, fontSize: "2.5rem", opacity: 0.3 }}>▶</span>
                        </div>
                      )}

                      {/* genre badge overlay */}
                      {/* <div style={{
                        position: "absolute", top: "12px", left: "12px",
                        background: "rgba(0,0,0,0.62)",
                        backdropFilter: "blur(6px)",
                        border: "1px solid rgba(246,244,211,0.22)",
                        borderRadius: "6px",
                        padding: "4px 10px",
                      }}>
                        <span style={{ ...VISION, color: "#F6F4D3", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                          {game.category || "Game"}
                        </span>
                      </div> */}
                    </div>
                  </div>

                    {/* ── card body ── */}
                    <div style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column", flex: 1, gap: "8px" }}>

                      {/* title */}
                      <div className="pixel-font !text-[14px] md:!text-[20px]" style={{
                        ...VISION,
                        fontSize: "17px",
                        fontWeight: 700,
                        color: "#F6F4D3",
                        letterSpacing: "0.04em",
                        lineHeight: 1.3,
                      }}>
                        {game.name}
                      </div>

                      {/* description */}
                      <div  className="pixel-font !text-[12px] md:!text-[16px]"  style={{
                        ...VISION,
                        color: "#94A3B8",
                        fontSize: "8px",
                        lineHeight: 1.6,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        letterSpacing: "0.02em",
                      }}>
                        {game.description || "No description available"}
                      </div>

                      {/* divider */}
                      <div style={{ height: "1px", background: "rgba(246,244,211,0.08)", margin: "6px 0" }} />

                      {/* footer */}
                      <div >
                        <span className="pixel-font !text-[12px] md:!text-[16px]"  style={{ ...VISION, color: "#64748B", letterSpacing: "0.04em" }}>
                          {formatDate(game.createdAt)}
                        </span>

                        <button
                          onClick={(e) => { e.stopPropagation(); handleGameClick(game); }}
                          className="pixel-font !text-[12px] text-nowrap md:!text-[16px]" 
                          style={{ 
                            height: "30px", 
                            borderRadius: "8px",
                            padding: "0 16px",
                            border: "1px solid rgba(246,244,211,0.3)",
                            background: isHovered ? "#F6F4D3" : "rgba(246,244,211,0.1)",
                            color: isHovered ? "#091237" : "#F6F4D3",   
                            cursor: "pointer",
                            transition: "all 0.25s ease",
                            display: "flex",
                            alignItems: "center", 

                          }}
                        >
                          <span className="!text-[20px] mr-2" >▶</span> Play Now
                        </button>
                      </div>
                    </div>
                  </div>
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
