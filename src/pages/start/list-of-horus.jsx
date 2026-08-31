import React, { useState } from "react";
import { Box, Text, Image } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import UserHeader from "../../components/common/UserHeader";
import { useTranslation } from "react-i18next";

const ListOfHorus = () => {
  const { t } = useTranslation();
  const [selectedItem, setSelectedItem] = useState("beats");
  const navigate = useNavigate();

  const menuItems = [
    { key: "comics", path: "/comics" },
    { key: "beats", path: "/beats" },
    { key: "shop", path: "/shop-list" },
    { key: "games", path: "/games" }
  ];

  const handleItemClick = (item) => {
    setSelectedItem(item.key);
    navigate(item.path);
  };

  const handleItemHover = (item) => {
    setSelectedItem(item.key);
  };

  const handleItemLeave = () => {
    // Selection stays on the last hovered item
  };

  return (
    <>
      <UserHeader title={t('menu.title')} />

      <Box
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          zIndex: 3,
          pointerEvents: "auto",
          overflowY: "auto",
        }}
        className="max-sm:!justify-start max-sm:!pt-24"
      >
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.5rem",
          }}
          className="!gap-0 min-md:!gap-0"
        >
          {menuItems.map((item) => (
            <div
              className="max-sm:px-0 max-sm:py-0"
              key={item.key}
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                transition: "all 0.3s ease",
              }}
              onClick={() => handleItemClick(item)}
              onMouseEnter={() => handleItemHover(item)}
              onMouseLeave={handleItemLeave}
            >
              {selectedItem === item.key && (
                <svg
                  viewBox="0 0 16 16"
                  style={{
                    width: "16px",
                    height: "16px",
                    marginRight: "1rem",
                    imageRendering: "pixelated",
                    flexShrink: 0,
                  }}
                  className="max-sm:!w-3 max-sm:!h-3 min-md:!w-4 min-md:!h-4 min-lg:!w-5 min-lg:!h-5"
                >
                  <rect x="2" y="2" width="2" height="2" fill="#F6F4D3" />
                  <rect x="4" y="4" width="2" height="2" fill="#F6F4D3" />
                  <rect x="6" y="6" width="2" height="2" fill="#F6F4D3" />
                  <rect x="4" y="8" width="2" height="2" fill="#F6F4D3" />
                  <rect x="2" y="10" width="2" height="2" fill="#F6F4D3" />
                </svg>
              )}

              <Text
                style={{
                  fontSize: "1.4rem",
                  color: selectedItem === item.key ? "#F6F4D3" : "#9ca3af",
                  textShadow: selectedItem === item.key ? "0 0 10px #F6F4D3" : "none",
                  letterSpacing: "2px",
                  transition: "all 0.3s ease",
                }}
                className="!text-[1.3rem] vision-font min-md:!text-[1.5rem] min-lg:!text-[2rem] min-xl:!text-[2.5rem]"
              >
                {t(`menu.${item.key}`)}
              </Text>

              {selectedItem === item.key && (
                <svg
                  viewBox="0 0 16 16"
                  style={{
                    width: "16px",
                    height: "16px",
                    marginLeft: "1rem",
                    imageRendering: "pixelated",
                    flexShrink: 0,
                  }}
                  className="max-sm:!w-3 max-sm:!h-3 min-md:!w-4 min-md:!h-4 min-lg:!w-5 min-lg:!h-5"
                >
                  <rect x="12" y="4" width="2" height="2" fill="#F6F4D3" />
                  <rect x="10" y="6" width="2" height="2" fill="#F6F4D3" />
                  <rect x="8" y="8" width="2" height="2" fill="#F6F4D3" />
                  <rect x="12" y="10" width="2" height="2" fill="#F6F4D3" />
                  <rect x="10" y="8" width="2" height="2" fill="#F6F4D3" />
                </svg>
              )}
            </div>
          ))}
        </Box>
      </Box>
    </>
  );
};

export default ListOfHorus;
