import React, { useState, useEffect } from "react";
import { Box, Text, Image, Button } from "@mantine/core";
import SupportArtistModal from "../../components/modalContents/SupportArtistModal";
import { useNavigate, useLocation } from "react-router-dom";
import { useMediaQuery } from "@mantine/hooks";
import { BackButtonIcon, BookreadIcon, SliderIcon } from "../../customIcons";
import { useTranslation } from "react-i18next";

const Comicread = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  
  const comic = location.state?.comic;
  const chapterIndex = location.state?.chapterIndex ?? 0;
  const initialPage = location.state?.initialPage ?? 0;
  
  const chapter = comic?.chapter_info?.[chapterIndex];
  
  // Dynamic page resolution: prefer structured pages over legacy images
  const pages = React.useMemo(() => {
    if (chapter?.pages?.length > 0) {
      return [...chapter.pages]
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(p => p.url);
    }
    if (chapter?.images?.length > 0) return chapter.images;
    return [comic?.thumbnailUrl || comic?.image];
  }, [chapter, comic]);
  
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Mobile detection
  const isMobileMediaQuery = useMediaQuery("(max-width: 1024px)");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileMediaQuery);
  }, [isMobileMediaQuery]);

  // Auto-opening removed as per user request to only open on click


  const handleBack = () => {
    try {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate("/comics");
      }
    } catch {
      navigate("/comics");
    }
  };

  const nextPage = (e) => {
    if (e) e.stopPropagation();
    if (currentPage < pages.length - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = (e) => {
    if (e) e.stopPropagation();
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  if (!comic || !chapter) {
    return (
      <Box style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
        <Text className="vision-font" style={{ color: "#F6F4D3" }}>{t('comics_user.not_found')}</Text>
      </Box>
    );
  }

  if (isMobile) {
    return (
      <Box
        className="custom-scrollbar"
        style={{
          height: "100vh",
          width: "100vw",
          backgroundColor: "#000",
          overflowX: "auto",
          overflowY: "auto",
          scrollSnapType: "x mandatory",
          display: "flex",
          flexDirection: "column",
          paddingBottom: "55px",
          paddingTop: "10px",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 99999,
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style>
          {`
            div::-webkit-scrollbar {
              display: none !important;
            }
          `}
        </style>

        {/* Minimal Back Button Overlay */}
        <Box
          onClick={handleBack}
          style={{
            position: "fixed",
            top: "8%",
            left: "10%",
            zIndex: 100,
            cursor: "pointer",
            background: "rgba(0,0,0,0.5)",
            borderRadius: "50%",
            width: "50px",
            height: "50px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s ease",
          }}
          className="!scale-[0.7] md:!scale-[0.9] lg:!scale-[1.2]"
        >
          <Box style={{ transform: "scale(1.2)" }}>
            <BackButtonIcon />
          </Box>
        </Box>

        {pages.map((page, index) => (
          <Box
            key={index}
            style={{
              height: "100vh",
              width: "100vw",
              minWidth: "100vw",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              scrollSnapAlign: "start",
            }}
          >
            <Image
              src={page}
              alt={`Page ${index + 1}`}
              style={{
                height: "100%",
                width: "100%",
                paddingBottom: "20px",
                paddingTop: "20px",
                maxWidth: "none",
                objectFit: "fill",
              }}
            />
          </Box>
        ))}

        {/* End of chapter panel for mobile */}
        <Box
          style={{
            height: "100vh",
            width: "100vw",
            minWidth: "100vw",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            scrollSnapAlign: "start",
            gap: "2.5rem",
            backgroundColor: "#000",
          }}
        >
          <Box
            style={{
              border: "2px solid #d1c676",
              padding: "1.5rem",
              textAlign: "center",
              width: "80%",
            }}
          >
            <Text
              className="vision-font"
              style={{
                color: "#F6F4D3",
                fontSize: "1.5rem",
                letterSpacing: "3px",
              }}
            >
              {t('comics_user.end_chapter')}
            </Text>
          </Box>
          <Button
            onClick={() => setIsSupportOpen(true)}
            style={{
              backgroundColor: "#d1c676",
              color: "#000",
              fontWeight: "bold",
            }}
          >
            {t('comics_user.support_artist')}
          </Button>
        </Box>

        {isSupportOpen && (
          <SupportArtistModal
            isOpen={isSupportOpen}
            onClose={() => setIsSupportOpen(false)}
            beatName={comic.title}
            artistName={comic.author_name}
            imageSrc={comic.thumbnailUrl || comic.image}
            type="comic"
          />
        )}
      </Box>
    );
  }

  // Laptop View: Full Screen Image Viewer
  return (
    <Box
      style={{
        height: "100vh",
        width: "100vw",
        backgroundColor: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9999,
        overflow: "hidden",
      }}
    >
      {/* Back Button */}
      <Box
        onClick={handleBack}
        style={{
          position: "absolute",
          top: "8%",
          left: "10%",
          zIndex: 100,
          cursor: "pointer",
          transition: "all 0.3s ease",
          background: "rgba(0,0,0,0.5)",
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        className="!scale-[0.7] md:!scale-[0.9] lg:!scale-[1.2]"
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(0,0,0,0.8)";
          e.currentTarget.style.transform = "scale(1.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(0,0,0,0.5)";
          e.currentTarget.style.transform = "scale(1.2)";
        }}
      >
        <Box style={{ transform: "scale(1.2)" }}>
          <BackButtonIcon />
        </Box>
      </Box>

      {/* Main Comic Image container */}
      <Box
        style={{
          height: "90vh",
          width: "90vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <Image
          key={currentPage} // Force re-render for animation if needed
          src={pages[currentPage]}
          alt={`Page ${currentPage + 1}`}
          style={{
            height: "100%",
            width: "auto",
            maxWidth: "100%",
            objectFit: "contain",
          }}
        />

        {/* Left Arrow Button */}
        {currentPage > 0 && (
          <Box
            onClick={prevPage}
            style={{
              position: "absolute",
              left: "2rem",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 15,
              cursor: "pointer",
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "rgba(246, 244, 211, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
              border: "1px solid rgba(246, 244, 211, 0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "rgba(246, 244, 211, 0.3)";
              e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                "rgba(246, 244, 211, 0.1)";
              e.currentTarget.style.transform = "translateY(-50%) scale(1)";
            }}
          >
            <Text
              style={{
                color: "#F6F4D3",
                fontSize: "2rem",
                fontWeight: "bold",
                userSelect: "none",
              }}
            >
              «
            </Text>
          </Box>
        )}

        {/* Right Arrow Button */}
        {currentPage < pages.length - 1 && (
          <Box
            onClick={nextPage}
            style={{
              position: "absolute",
              right: "2rem",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 15,
              cursor: "pointer",
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "rgba(246, 244, 211, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
              border: "1px solid rgba(246, 244, 211, 0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "rgba(246, 244, 211, 0.3)";
              e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                "rgba(246, 244, 211, 0.1)";
              e.currentTarget.style.transform = "translateY(-50%) scale(1)";
            }}
          >
            <Text
              style={{
                color: "#F6F4D3",
                fontSize: "2rem",
                fontWeight: "bold",
                userSelect: "none",
              }}
            >
              »
            </Text>
          </Box>
        )}

        {/* Click-to-Next Global Overlay (Invisible side zones for easy clicking) */}
        <Box
          onClick={prevPage}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "15%",
            zIndex: 5,
            cursor: "pointer",
          }}
        />
        {currentPage < pages.length - 1 && (
          <Box
            onClick={nextPage}
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: "15%",
              zIndex: 5,
              cursor: "pointer",
            }}
          />
        )}

        {/* End Interaction (on last page) - Moved to bottom right to avoid covering content */}
        {currentPage === pages.length - 1 && (
          <Box
            style={{
              position: "absolute",
              bottom: "2rem",
              right: "2rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "0.8rem",
              zIndex: 100,
            }}
          >
            <Box
              style={{
                backgroundColor: "rgba(0,0,0,0.92)",
                border: "2px solid #d1c676",
                borderRadius: "8px",
                padding: "1rem 2rem",
                textAlign: "right",
                boxShadow: "0 0 20px rgba(0,0,0,0.8), 0 0 10px rgba(209,198,118,0.2)",
              }}
            >
              <Text
                className="vision-font"
                style={{
                  color: "#F6F4D3",
                  fontSize: "1rem",
                  marginBottom: "0.6rem",
                  letterSpacing: "1.5px",
                  fontWeight: "bold"
                }}
              >
                {t('comics_user.end_chapter')}
              </Text>
              <Button
                onClick={() => setIsSupportOpen(true)}
                style={{
                  backgroundColor: "#d1c676",
                  color: "#000",
                  fontWeight: "900",
                  height: "38px",
                  borderRadius: "4px",
                  letterSpacing: "0.5px",
                  fontSize: "0.85rem"
                }}
                className="vision-font"
              >
                {t('comics_user.support_artist')}
              </Button>
            </Box>
          </Box>
        )}
      </Box>

      {/* Support Modal */}
      {isSupportOpen && (
        <SupportArtistModal
          isOpen={isSupportOpen}
          onClose={() => setIsSupportOpen(false)}
          beatName={comic.title}
          artistName={comic.author_name}
          imageSrc={comic.image}
          type="comic"
        />
      )}
    </Box>
  );
};

export default Comicread;
