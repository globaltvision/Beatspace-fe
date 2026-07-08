import React, { useState } from "react";
import { Box, Text, Group, Image } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../../contexts/SettingsContext";
import { useTranslation } from "react-i18next";

const Home = () => {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { settings } = useSettings();

  const handleClick = (e) => {
    e.stopPropagation();
    setIsHovered(true);
    navigate("/menu");
  };

  return (
    <Box style={styles.container}>
      {/* --- HERO & CLOUDS CONTAINER --- */}
      <Box 
        style={styles.heroContainer} 
        className="!w-full !top-[12%] min-md:!w-full min-md:!top-[12%] min-lg:!top-[14%] min-xl:!top-[14%]"
      >
        <Image
          src={settings.site_logo || "/assets/Hero.webp"}
          alt={settings.site_title || "GLOBAL VISION"}
          style={styles.heroLogo}
          className="max-sm:!mb-0 !h-20 min-md:!h-24 min-lg:!h-32 min-xl:!h-40 object-contain"
        />

        {/* Cloud 1 (Left) */}
        <Image
          src="/assets/Cloud.webp"
          alt="Cloud"
          style={styles.cloudLeft}
          className="!left-20 !h-24 !w-24 min-md:!left-20 min-md:!h-32 min-md:!w-32 min-lg:!left-32 min-lg:!h-32 min-lg:!w-36 min-xl:!left-44 min-xl:!h-40 min-xl:!w-40 min-xl:top-[20%]"
        />

        {/* Cloud 2 (Right Mid) */}
        <Image
          src="/assets/Cloud.webp"
          alt="Cloud"
          style={styles.cloudRightMid}
          className="!right-32 min-md:!right-32 min-md:!h-16 min-md:!w-16 min-lg:!right-48 min-lg:!h-20 min-lg:!w-20 min-xl:!right-64 min-xl:!h-28 min-xl:!w-28"
        />

        {/* Cloud 3 (Right Top) */}
        <Image
          src="/assets/Cloud.webp"
          alt="Cloud"
          style={styles.cloudRightTop}
          className="top-5 right-16 h-24 w-24 max-sm:h-24 max-sm:w-24 min-md:right-16 min-md:top-20 min-lg:right-32 min-lg:top-24 min-lg:h-32 min-lg:w-32 min-xl:right-48 min-xl:top-40 min-xl:h-40 min-xl:w-40"
        />
      </Box>

      {/* --- CONTENT CONTAINER --- */}
      <Box style={styles.contentWrapper}>
        {/* Start Button Group */}
        <Group justify="center" mt={26}>
          <div
            style={styles.startButton}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleClick}
            className="md:p-3"
          >
            <Text
              className="vision-font hover:!scale-[0.7] !scale-[1] hover:min-md:!scale-[1.2] min-md:!scale-[1.8] min-md:!mt-40 font-bold"
              style={{
                ...styles.startText,
                color: isHovered ? "#F6F4D3" : "#1f2937",
                textShadow: isHovered
                  ? "0 0 10px #F6F4D3, 0 0 20px #F6F4D3, 0 0 30px #F6F4D3"
                  : "none",
              }}
            >
              {">"} {t("home.press_start")}
            </Text>
          </div>
        </Group>

        {/* Footer / Copyright Group */}
        <Group
          justify="center"
          mt={60}
          className="!mt-0 min-md:!gap-[4.3rem] min-md:!translate-y-16 xl:mt-60"
        >
          <Text className="vision-font min-md:scale-[1.6]" style={styles.footerText}>
            ©
          </Text>
          <Text className="vision-font min-md:scale-[1.1]" style={styles.footerText}>
            {new Date().getFullYear()} {settings.site_title || "GLOBAL VISION"}
          </Text>
        </Group>
      </Box>
    </Box>
  );
};

// --- CLEAN & CLEAN STYLES OBJECT ---
const styles = {
  container: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    zIndex: 3,
    pointerEvents: "auto",
  },
  heroContainer: {
    position: "absolute",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  heroLogo: {
    width: "100%",
    height: "auto",
    filter: "drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1))",
    marginBottom: "1rem",
    position: "relative",
    zIndex: 10,
  },
  cloudLeft: {
    position: "absolute",
    left: "-2rem",
    top: "40%",
    width: "7rem",
    height: "4.5rem",
    opacity: 0.9,
    filter: "drop-shadow(0 4px 3px rgb(0 0 0 / 0.07))",
    animation: "floatCloud1 8s ease-in-out infinite",
    zIndex: 1,
  },
  cloudRightMid: {
    position: "absolute",
    right: "1rem",
    top: "25%",
    width: "3.5rem",
    height: "2rem",
    opacity: 0.9,
    filter: "drop-shadow(0 4px 3px rgb(0 0 0 / 0.07))",
    animation: "floatCloud2 6s ease-in-out infinite",
    zIndex: 1,
  },
  cloudRightTop: {
    position: "absolute",
    right: "-8rem",
    top: "-20%",
    width: "8rem",
    height: "5rem",
    opacity: 0.9,
    filter: "drop-shadow(0 4px 3px rgb(0 0 0 / 0.07))",
    transform: "scaleX(-1)",
    animation: "floatCloud3 10s ease-in-out infinite",
    zIndex: 1,
  },
  contentWrapper: {
    textAlign: "center",
    marginTop: "1.5rem",
    width: "100%",
    maxWidth: "24rem",
  },
  startButton: {
    display: "inline-block",
    padding: "10px",
    cursor: "pointer",
  },
  startText: {
    transition: "all 0.3s ease",
    margin: 0,
    letterSpacing: "4px",
  },
  footerText: {
    color: "#1f2937",
  },
};

export default Home;