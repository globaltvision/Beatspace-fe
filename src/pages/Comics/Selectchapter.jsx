import React, { useState } from "react";
import { Box, Text } from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";
import UserHeader from "../../components/common/UserHeader";
import { useTranslation } from "react-i18next";

const COLORS = {
  background: "#111827",
  primary: "#F6F4D3",
  accent: "#C7C048",
  accentDark: "#d1a94c",
  textSecondary: "#9ca3af",
  dark: "#0e0e0e",
  darkHover: "#141414",
};

// Chapter Item Component
const ChapterItem = ({ chapter, index, isHovered, onHover, onClick }) => {
  const { t } = useTranslation();
  const chapterNumber = String(index + 1).padStart(2, "0");
  return (
    <div className="border-4 border-[#C0BC75] p-2">
      <Box
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.75rem 1rem",
          backgroundColor: isHovered ? COLORS.darkHover : COLORS.dark,
          // border: `0.5px solid ${COLORS.accent}`,
          boxShadow: `0 0 0 2px ${COLORS.accent} inset`,
          cursor: "pointer",
          transition: "all 0.2s ease",
          minHeight: "64px",
        }}
        onClick={() => onClick(index + 1)}
        onMouseEnter={() => onHover(index + 1)}
        onMouseLeave={() => onHover(null)}
        className="border-0 !border-[#C0BC75]  vision-font"
      >
        <Box style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Text
            style={{
              color: "#000",
              backgroundColor: COLORS.accent,
              fontWeight: "600",
              padding: "4px 10px",
            }}
            className="pixel-font max-sm:!text-[0.9rem] min-sm:!text-[1rem] min-md:!text-[1.2rem] min-lg:!text-[1.8rem]"
          >
            {chapterNumber}
          </Text>
          <Box>
            <Text
              style={{
                color: COLORS.primary,
                fontWeight: "900",
                textTransform: "uppercase",
              }}
              className="!vision-font max-sm:!text-[1rem] min-sm:!text-[1.1rem] min-md:!text-[1.3rem] min-lg:!text-[2rem]"
            >
              {t('comics_user.chapter')} {index + 1} : {chapter.chapter_title}
            </Text>
            <Text
              style={{
                color: COLORS.textSecondary,
                fontWeight: "700",
              }}
              className="!vision-font max-sm:!text-[0.8rem] min-sm:!text-[0.9rem] min-md:!text-[1.1rem] min-lg:!text-[1.5rem]"
            >
              {chapter.images?.length || 0} {t('comics_user.pages')}
            </Text>
          </Box>
        </Box>
        <Box style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Text
            style={{
              color: COLORS.accent,
              fontWeight: "900",
              letterSpacing: "1px",
            }}
            className="!vision-font max-sm:!text-[0.8rem] min-sm:!text-[0.9rem] min-md:!text-[1.1rem] min-lg:!text-[1.5rem]"
          >
            {t('comics_user.read')}
          </Text>
          <Box
            style={{
              height: "1px",
              width: isHovered ? "64px" : "48px",
              backgroundColor: COLORS.accent,
              transition: "width 0.2s ease",
            }}
          />
        </Box>
      </Box>
    </div>
  );
};

// Main Component
const SelectChapter = () => {
  const { t } = useTranslation();
  const [hoveredChapter, setHoveredChapter] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const comic = location.state?.comic;

  if (!comic) {
    return (
      <Box
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text className="vision-font" style={{ color: COLORS.primary }}>
          {t('comics_user.no_comic_selected')}
        </Text>
      </Box>
    );
  }

  const handleChapterClick = (chapterIndex) => {
    navigate(`/comics/chapter/${chapterIndex}`, {
      state: { comic, chapterIndex: chapterIndex - 1 },
    });
  };

  const handleChapterHover = (chapterIndex) => {
    setHoveredChapter(chapterIndex);
  };

  return (
    <>
      <UserHeader title={t('comics_user.title')} subtitle={comic.author_name.toUpperCase()} />

      {/* Main Content */}
      <Box
        style={{
          height: "80vh",
          marginTop: "18vh",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          zIndex: 3,
          pointerEvents: "auto",
        }}
        className="!w-full"
      >
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
            width: "100%",
            padding: "0 2rem",
          }}
          className="max-sm:!h-[65%] max-sm:!overflow-y-auto min-md:!h-fit"
        >
          {/* Comic Title Section */}
          <Box
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: "1.25rem",
            }}
          >
            {/* Thumbnail */}
            {(comic.thumbnailUrl || comic.image) && (
              <img
                src={comic.thumbnailUrl || comic.image}
                alt={comic.title}
                style={{
                  width: "80px",
                  height: "110px",
                  objectFit: "cover",
                  border: `2px solid ${COLORS.accent}`,
                  flexShrink: 0,
                }}
                className="max-sm:!w-[60px] max-sm:!h-[85px] min-lg:!w-[110px] min-lg:!h-[150px]"
              />
            )}

            {/* Title & Author */}
            <Box className="vision-font">
              <Text
                style={{
                  color: COLORS.primary,
                  letterSpacing: "0.5px",
                  marginBottom: "0.2rem",
                  textTransform: "uppercase",
                  fontWeight: "900",
                }}
                className="max-sm:!text-[1.2rem] min-md:!text-[2rem] min-lg:!text-[3rem]"
              >
                {comic.title}
              </Text>
              <Text
                style={{
                  color: COLORS.accentDark,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
                className="vision-font max-sm:!text-[0.6rem] min-md:!text-[0.7rem] min-lg:!text-[1.5rem]"
              >
                by {comic.author_name}
              </Text>
            </Box>
          </Box>

          {/* Chapter List */}
          <Box
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              width: "100%",
              maxWidth: "800px",
              maxHeight: "55vh",
              overflowY: "auto",
              marginTop: "2rem",
              paddingRight: "10px",
            }}
            className="vision-font lg:mt-0 mt-12 custom-scrollbar"
          >
            {comic.chapter_info && comic.chapter_info.length > 0 ? (
              comic.chapter_info.map((chapter, index) => (
                <ChapterItem
                  key={index}
                  chapter={chapter}
                  index={index}
                  isHovered={hoveredChapter === index + 1}
                  onHover={handleChapterHover}
                  onClick={handleChapterClick}
                />
              ))
            ) : (
              <Text
                style={{ color: COLORS.textSecondary, textAlign: "center" }}
              >
                {t('comics_user.no_chapters')}
              </Text>
            )}
          </Box>
        </Box>
      </Box>

      {/* Bottom Instruction */}
      <Box
        style={{
          position: "absolute",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 3,
          pointerEvents: "auto",
        }}
      >
        <Text
          className="vision-font max-sm:!text-[1.1rem] min-md:!text-[1.3rem] min-lg:!text-[1.8rem] font-bold"
          style={{
            color: COLORS.textSecondary,
            letterSpacing: "1.5px",
            textAlign: "center",
          }}
        >
          {t('comics_user.click_start_reading')}
        </Text>
      </Box>
    </>
  );
};

export default SelectChapter;
