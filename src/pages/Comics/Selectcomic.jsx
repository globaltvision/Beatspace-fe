import React, { useState, useEffect } from "react";
import { Box, Text, Image } from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getComics } from "../../store/actions/adminActions";
import UserHeader from "../../components/common/UserHeader";
import { useTranslation } from "react-i18next";

const Selectcomic = () => {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { comics, isLoadingComics } = useSelector((state) => state.admin);

  const selectedAuthor = location.state?.author || "";

  useEffect(() => {
    if (comics.length === 0) {
      dispatch(getComics());
    }
  }, [dispatch, comics.length]);

  const filteredComics = selectedAuthor
    ? comics.filter((comic) => comic.author_name === selectedAuthor)
    : comics;

  const handleComicClick = (comic) => {
    navigate("/comics/select-chapter", { state: { comic } });
  };

  return (
    <>
      <UserHeader
        title={t("comics_user.title")}
        subtitle={selectedAuthor.toUpperCase()}
      />

      {/* Main Content Scrollable Area */}
      <Box
        style={{
          height: "70vh",
          marginTop: "26vh",
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "2rem",
          gap: "2.5rem",
          zIndex: 5,
          overflowY: "auto",
        }}
        className="custom-scrollbar"
      >
        {isLoadingComics ? (
          <Text className="vision-font" style={{ color: "#F6F4D3" }}>
            {t("comics_user.loading")}
          </Text>
        ) : filteredComics.length > 0 ? (
          filteredComics.map((comic) => (
            <Box
              key={comic._id}
              className="comic-card-container"
              onClick={() => handleComicClick(comic)}
              onMouseEnter={() => setIsHovered(comic._id)}
              onMouseLeave={() => setIsHovered(null)}
              style={{
                width: "220px",
                height: "360px",
                backgroundColor: "#000",
                border: "2px solid #d1c676",
                padding: "8px",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow:
                  isHovered === comic._id ? "0 0 15px #d1c676" : "none",
              }}
            >
              {/* Image Section with Frame */}
              <Box
                style={{
                  width: "100%",
                  height: "160px",
                  border: "2px solid #d1c676",
                  overflow: "hidden",
                  backgroundColor: "#000",
                  flexShrink: 0,
                }}
              >
                <Image
                  src={comic.thumbnailUrl || comic.image}
                  alt={comic.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    transition: "transform 0.5s ease",
                    transform:
                      isHovered === comic._id ? "scale(1.05)" : "scale(1)",
                  }}
                />
              </Box>

              {/* Gap / Divider Area */}
              <Box style={{ height: "8px", flexShrink: 0 }} />

              {/* Text Description Box with Frame */}
              <Box
                style={{
                  width: "100%",
                  flex: 1,
                  border: "2px solid #d1c676",
                  padding: "8px",
                  display: "flex",
                  flexDirection: "column",
                  backgroundColor: "#0b0b0b",
                }}
              >
                <Text
                  className="vision-font line-clamp-2 comic-card-title"
                  style={{
                    color: "#F6F4D3",
                    textTransform: "uppercase",
                    wordBreak: "break-word",
                  }}
                >
                  {comic.title}
                </Text>

                <Text
                  title={t("comics_user.chapter")}
                  className="vision-font comic-card-chapter"
                  style={{
                    color: "#d1c676",
                  }}
                >
                  {t("comics_user.chapter")} {comic.chapter_info?.length || 0}
                </Text>

                {/* Decorative line near bottom of text box */}
                <Box
                  style={{
                    height: "1px",
                    backgroundColor: "#d1c676",
                    marginTop: "auto",
                    width: "100%",
                    opacity: 0.8,
                  }}
                />
              </Box>
            </Box>
          ))
        ) : (
          <Text className="vision-font" style={{ color: "#9ca3af" }}>
            {t("comics_user.no_comics_artist")}
          </Text>
        )}
      </Box>
    </>
  );
};

export default Selectcomic;
