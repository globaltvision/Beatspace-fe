import React, { useState } from "react";
import { Box, Text, Image } from "@mantine/core";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { BookreadIcon, SliderIcon } from "../../customIcons";
import UserHeader from "../../components/common/UserHeader";
import { useTranslation } from "react-i18next";

const Comicview = () => {
  const { t } = useTranslation();
  const { chapterNumber } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [hoverL, setHoverL] = useState(false);
  const [hoverR, setHoverR] = useState(false);

  const comic = location.state?.comic;
  const chapterIndex = location.state?.chapterIndex ?? 0;

  const chapter = comic?.chapter_info?.[chapterIndex];
  const pages = chapter?.images?.length > 0 ? chapter.images : [comic?.image]; // Fallback to cover if no pages

  const [idx, setIdx] = useState(0);

  const prev = (e) => {
    e.stopPropagation();
    setIdx((n) => (n > 0 ? n - 1 : n));
  };
  const next = (e) => {
    e.stopPropagation();
    setIdx((n) => (n < pages.length - 1 ? n + 1 : n));
  };

  const openReader = () => {
    navigate("/comics/read", {
      state: { comic, chapterIndex, initialPage: idx },
    });
  };

  if (!comic || !chapter) {
    return (
      <Box
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text className="vision-font" style={{ color: "#F6F4D3" }}>
          {t('comics_user.not_found')}
        </Text>
      </Box>
    );
  }

  return (
    <>
      <UserHeader
        title={t('comics_user.title')}
        subtitle={`${comic.title} - ${chapter.chapter_title}`}
      />

      {/* Viewer Area */}
      <Box
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 3,
          marginTop: "30px",
        }}
      >
        {/* Chapter badge left */}
        <Box
          style={{
            position: "absolute",
            left: "12%",
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            zIndex: 10,
          }}
        >
          <Box
            style={{
              width: "48px",
              height: "28px",
              backgroundColor: "#d1c676",
              borderRadius: "2px",
              border: "2px solid #000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              className="vision-font"
              style={{ fontSize: "1.2rem", color: "#000", fontWeight: "900" }}
            >
              {String(chapterIndex + 1).padStart(2, "0")}
            </Text>
          </Box>
        </Box>

        {/* Left arrow */}
        <Box
          role="button"
          aria-label="Prev"
          onMouseEnter={() => setHoverL(true)}
          onMouseLeave={() => setHoverL(false)}
          onClick={prev}
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-260px)",
            cursor: "pointer",
            visibility: idx > 0 ? "visible" : "hidden",
            zIndex: 15,
          }}
          className="max-md:!left-[10%] max-md:!transform-none"
        >
          <Box
            style={{
              width: 0,
              height: 0,
              borderLeft: "15px solid transparent",
              borderRight: "15px solid transparent",
              borderTop: `15px solid ${hoverL ? "#F6F4D3" : "#d1c676"}`,
              transform: "rotate(90deg)",
            }}
          />
        </Box>

        {/* Comic image with frame */}
        <Box
          role="button"
          aria-label="Open Reader"
          onClick={openReader}
          style={{
            border: "4px solid #d1c676",
            boxShadow: "0 0 15px rgba(209,198,118,0.4)",
            backgroundColor: "#0b0b0b",
            display: "flex",
            justifyContent: "center",
            cursor: "pointer",
            overflow: "hidden",
            zIndex: 5,
          }}
          className="mt-16 max-sm:!w-[160px] max-sm:!h-[225px] sm:!w-[225px] sm:!h-[320px] md:!w-[300px] md:!h-[430px] lg:!w-[340px] lg:!h-[485px]"
        >
          <Image
            key={idx}
            src={pages[idx]}
            alt={`Chapter ${chapterIndex + 1} page ${idx + 1}`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              animation: "fadeIn 0.4s ease-in-out",
            }}
          />
        </Box>

        {/* Right arrow */}
        <Box
          role="button"
          aria-label="Next"
          onMouseEnter={() => setHoverR(true)}
          onMouseLeave={() => setHoverR(false)}
          onClick={next}
          style={{
            position: "absolute",
            right: "50%",
            transform: "translateX(260px)",
            cursor: "pointer",
            visibility: idx < pages.length - 1 ? "visible" : "hidden",
            zIndex: 15,
          }}
          className="max-md:!right-[10%] max-md:!transform-none"
        >
          <Box
            style={{
              width: 0,
              height: 0,
              borderLeft: "15px solid transparent",
              borderRight: "15px solid transparent",
              borderTop: `15px solid ${hoverR ? "#F6F4D3" : "#d1c676"}`,
              transform: "rotate(-90deg)",
            }}
          />
        </Box>

        {/* Small UI icons right */}
        <Box
          style={{
            position: "absolute",
            top: "50%",
            transform: "translateY(-50%)",
            right: "12%",
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
            zIndex: 10,
          }}
        >
          <BookreadIcon />
          <SliderIcon />
        </Box>
      </Box>
    </>
  );
};

export default Comicview;
