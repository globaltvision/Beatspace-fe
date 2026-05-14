import React from "react";
import { Box, Text, Image, Flex } from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";
import { BackButtonIcon } from "../../customIcons";
import { BACK_NAVIGATION_MAP } from "../../configs/navigationMapping";
import { useSettings } from "../../contexts/SettingsContext";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../LanguageSwitcher";

const COLORS = {
  primary: "#F6F4D3",
  accent: "#d1c676",
};

const UserHeader = ({ title, subtitle, showBack = true, prefix, suffix }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSettings();

  const handleBack = () => {
    const pathname = location.pathname;

    if (pathname.includes("/comics/chapter/")) {
      navigate("/comics/select-chapter", {
        state: { comic: location.state?.comic },
      });
      return;
    }

    if (pathname === "/comics/read") {
      navigate(-1); // Go back to comicview with state preserved by history
      return;
    }

    const target =
      BACK_NAVIGATION_MAP[pathname] ||
      BACK_NAVIGATION_MAP["default"] ||
      "/menu";

    if (target === -1) {
      navigate(-1);
    } else {
      // For comic chapter select, we don't necessarily need state unless we want to filter by author again
      // but let's just use the target path.
      navigate(target);
    }
  };

  const handleLogoClick = () => {
    navigate("/menu");
  };

  return (
    <Box
      style={{
        position: "fixed",
        top: "8%",
        left: 0,
        right: 0,
        height: "15%",
        zIndex: 100,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 10%",
      }}
    >
      {/* Left Column: Back Button + Title */}
      <Box
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          pointerEvents: "auto",
        }}
      >
        {showBack && (
          <Box
            w={"fit-content"}
            role="button"
            aria-label={t('common.back')}
            onClick={handleBack}
            style={{ cursor: "pointer", flexShrink: 0 }}
            className="!scale-[0.7] md:!scale-[0.9] lg:!scale-[1.2]"
          >
            <BackButtonIcon />
          </Box>
        )}
        {prefix && prefix}
        {(title || subtitle) && (
          <Box style={{ display: "flex", flexDirection: "column" }}>
            {title && (
              <Text
                style={{
                  fontSize: "1.8rem",
                  color: COLORS.primary,
                  letterSpacing: "4px",
                  textShadow: "0 0 15px rgba(246, 244, 211, 0.4)",
                  fontWeight: 900,
                  lineHeight: 1,
                }}
                className="vision-font max-sm:!text-[1.2rem] md:!text-[2rem] lg:!text-[2.9rem]"
              >
                {title}
              </Text>
            )}
            {subtitle && (
              <Text
                style={{
                  color: COLORS.primary,
                  letterSpacing: "2px",
                  marginTop: "0.1rem",
                }}
                className="vision-font max-sm:!text-[0.6rem] md:!text-[0.8rem] lg:!text-[1.2rem]"
              >
                {subtitle}
              </Text>
            )}
          </Box>
        )}
      </Box>

      {/* Right Column: Suffix & Logo */}
      <Box
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "1rem",
          pointerEvents: "auto",
        }}
      >
        <LanguageSwitcher />
        {suffix && suffix}
        <Box onClick={handleLogoClick} style={{ cursor: "pointer" }}>
          <Image
            src={settings.site_logo || "/assets/logo.png"}
            alt={settings.site_title || "GLOBAL VISION"}
            style={{
              width: "120px",
              height: "auto",
              filter: "brightness(1.2)",
            }}
            className="max-sm:!w-10 md:!w-20 lg:!w-28 xl:!w-32 object-contain"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default UserHeader;
