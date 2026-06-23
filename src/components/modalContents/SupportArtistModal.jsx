import React, { useState } from "react";
import { Box, Text, Image, TextInput, Button } from "@mantine/core";
import { heartIcon } from "../../customIcons";
import { useDispatch } from "react-redux";
import { playBeatAction } from "../../store/actions/beatActions";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const SupportArtistModal = ({
  isOpen,
  onClose,
  beatName,
  artistName,
  audioUrl,
  id,
  imageSrc = "/assets/artist.png",
  type = "beat", // New prop to handle different content types
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [donationAmount, setDonationAmount] = useState("");

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!audioUrl) {
      console.error("No audio URL provided for download");
      return;
    }

    // Track download on backend
    if (id) {
      dispatch(playBeatAction(id, true));
    }

    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      // Extract filename from URL or use beatName
      const filename = audioUrl.split("/").pop() || `${beatName}.mp3`;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback: try opening in new tab
      window.open(audioUrl, "_blank");
    }
  };

  const handleCheckout = () => {
    if (!donationAmount || isNaN(donationAmount) || parseFloat(donationAmount) <= 0) {
      toast.error("Please enter a valid donation amount");
      return;
    }
    navigate("/checkout", { state: { amount: parseFloat(donationAmount), type: 'donation' } });
    onClose();
  };

  return (
    <Box
      pos="fixed"
      top={0}
      left={0}
      w="100vw"
      h="100vh"
      style={{
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 10,
      }}
    >
      {/* Modal Card */}
      <Box
        className="vision-font custom-scrollbar"
        style={{
          width: "100%",
          maxWidth: 420,
          maxHeight: "92vh",
          overflowY: "auto",
          background: "#0f1220",
          borderRadius: 18,
          padding: 18,
          color: "white",
          border: "2px solid #2b2f55",
          position: "relative",
        }}
      >
        {/* Close */}
        <Text
          onClick={onClose}
          style={{
            position: "absolute",
            top: 10,
            left: 12,
            cursor: "pointer",
            fontSize: 22,
            opacity: 0.85,
          }}
        >
          ✕
        </Text>

        {/* Artist image */}
        <Box style={{ textAlign: "center", marginTop: 8 }}>
          <Image
            src={imageSrc}
            w={70}
            h={70}
            radius={12}
            mx="auto"
            alt="artist"
          />
        </Box>

        {/* Title */}
        <Text
          align="center"
          mt={10}
          style={{
            fontSize: 22,
            letterSpacing: 2,
          }}
        >
          {t('support_modal.title')}
        </Text>

        {/* Info */}
        <Text align="center" mt={8} size="sm" opacity={0.85}>
          {type === "comic" ? t('support_modal.comic_label') : t('support_modal.beat_label')} {beatName}
        </Text>
        <Text align="center" style={{ fontSize: 13, letterSpacing: 1 }}>
          {t('support_modal.by_label')} {artistName}
        </Text>

        {/* Heart */}
        <Box mt={12} style={{ textAlign: "center" }}>
          <span style={{ fontSize: 18 }}>{heartIcon}</span>
        </Box>

        {/* Description */}
        <Text
          align="center"
          mt={6}
          size="xs"
          className="font-400"
          opacity={0.8}
          style={{ lineHeight: 1.5 }}
        >
          {type === "comic" ? (
            <>
              {t('support_modal.comic_desc_1')}
              <br />
              {t('support_modal.comic_desc_2', { artist: artistName })}
            </>
          ) : (
            <>
              {t('support_modal.beat_desc_1')}
              <br />
              {t('support_modal.beat_desc_2')}
            </>
          )}
        </Text>

        {/* Donation */}
        <Text
          mt={14}
          mb={6}
          align="center"
          style={{ fontSize: 16, letterSpacing: 1 }}
        >
          {t('support_modal.donation_label')}
        </Text>

        <TextInput
          value={donationAmount}
          onChange={(e) => setDonationAmount(e.target.value)}
          placeholder="€ 00.0"
          styles={{
            input: {
              background: "#080b16",
              border: "1px solid #2c2f52",
              color: "white",
              height: 42,
              fontSize: 16,
            },
          }}
        />

        <Button
          mt={14}
          fullWidth
          onClick={handleCheckout}
          style={{
            background: "#c8c48a",
            color: "#000",
            fontWeight: 700,
            height: 42,
            letterSpacing: 1,
          }}
        >
          {t('support_modal.checkout')}
        </Button>

        {type !== "comic" && (
          <Button
            mt={10}
            fullWidth
            variant="outline"
            onClick={handleDownload}
            style={{
              borderColor: "#c8c48a",
              color: "#c8c48a",
              fontWeight: 700,
              height: 42,
              letterSpacing: 1,
              background: "transparent",
            }}
          >
            {t('support_modal.download_beat')}
          </Button>
        )}
      </Box>

      {/* Responsive fixes for horizontal mobile */}
      <style>
        {`
        .vision-font {
          font-family: 'Vision Font', sans-serif;
        }

        /* Mobile landscape (horizontal) */
        @media (max-height: 500px) {
          .vision-font {
            max-height: 88vh !important;
            padding: 14px !important;
          }
        }

        /* Very small height devices */
        @media (max-height: 420px) {
          .vision-font {
            max-height: 82vh !important;
            transform: scale(0.95);
          }
        }
      `}
      </style>
    </Box>
  );
};

export default SupportArtistModal;
