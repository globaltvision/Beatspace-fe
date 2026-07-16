import React, { useState, useRef, useEffect, useMemo } from "react";
import { Box, Text, Image, Loader, Center } from "@mantine/core";
import { useDispatch } from "react-redux";
import { playBeatAction } from "../../store/actions/beatActions";
import { useTranslation } from "react-i18next";
import { playIcon, pauseIcon, downloadIcon } from "../../customIcons";
import SupportArtistModal from "../../components/modalContents/SupportArtistModal";
import { useNavigate, useLocation } from "react-router-dom";
import UserHeader from "../../components/common/UserHeader";
import AudioWaveform from "../../components/AudioWaveform";
import { useBeatController } from "../../hooks/useBeatController";
import { toast } from "sonner";

const BeatPlay = () => {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBeat, setSelectedBeat] = useState(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [audioProgress, setAudioProgress] = useState({});
  const [audioCurrentTime, setAudioCurrentTime] = useState({});
  const [audioDuration, setAudioDuration] = useState({});
  const audioRefs = useRef({});
  const navigate = useNavigate();
  const location = useLocation();
  const { beats: reduxBeats, isLoading, fetchBeats } = useBeatController();
  const dispatch = useDispatch();

  // Get category from query string
  const queryParams = new URLSearchParams(location.search);
  const category = queryParams.get("category");

  const beatItems = useMemo(() => {
    if (!reduxBeats) return [];

    // Filter by category if one is selected
    let filtered = reduxBeats;
    if (category) {
      filtered = reduxBeats.filter((beat) => {
        const beatCategory = (
          beat.category ||
          beat["category "] ||
          beat[" category"]
        )
          ?.toLowerCase()
          ?.trim();
        return beatCategory === category.toLowerCase().trim();
      });
    }

    return filtered.map((beat) => ({
      ...beat,
      id: beat._id || beat.id,
      waveform: `audio-waveform-${beat._id || beat.id}`,
      audioUrl: beat.mp3_url,
    }));
  }, [reduxBeats, category]);

  useEffect(() => {
    fetchBeats(category);
  }, [fetchBeats, category]);

  const handleItemHover = () => {
    setIsHovered(true);
  };

  const handleItemLeave = () => {
    setIsHovered(false);
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0.00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}.${String(s).padStart(2, "0")}`;
  };

  useEffect(() => {
    beatItems.forEach((beat) => {
      if (
        !audioRefs.current[beat.id] &&
        beat.audioUrl &&
        beat.audioUrl.trim() !== ""
      ) {
        const audio = new Audio();
        audio.preload = "metadata";
        audio.crossOrigin = "anonymous";
        audio.src = beat.audioUrl;

        audio.addEventListener("loadedmetadata", () => {
          if (audio.duration && !isNaN(audio.duration)) {
            setAudioDuration((prev) => ({
              ...prev,
              [beat.id]: audio.duration,
            }));
          }
        });

        audio.addEventListener("timeupdate", () => {
          if (audio.duration && !isNaN(audio.duration)) {
            const progress = audio.currentTime / audio.duration;
            setAudioProgress((prev) => ({ ...prev, [beat.id]: progress }));
            setAudioCurrentTime((prev) => ({
              ...prev,
              [beat.id]: audio.currentTime,
            }));
          }
        });

        audio.addEventListener("ended", () => {
          setCurrentlyPlaying(null);
          setAudioProgress((prev) => ({ ...prev, [beat.id]: 0 }));
          setAudioCurrentTime((prev) => ({ ...prev, [beat.id]: 0 }));
          window.dispatchEvent(new CustomEvent("beat-play-stop"));
        });
 
        audioRefs.current[beat.id] = audio;
      }
    });
 
    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.src = "";
          audio.load();
        }
      });
      window.dispatchEvent(new CustomEvent("beat-play-stop"));
    };
  }, [beatItems]);
 
  const handlePlay = async (beat) => {
    const beatId = beat.id;
    if (!beat.audioUrl || beat.audioUrl.trim() === "") {
      toast.error(`No audio URL provided for ${beat.name}.`);
      return;
    }
 
    const audio = audioRefs.current[beatId];
    if (!audio) return;
 
    if (currentlyPlaying === beatId && !audio.paused) {
      audio.pause();
      setCurrentlyPlaying(null);
      window.dispatchEvent(new CustomEvent("beat-play-stop"));
    } else {
      Object.keys(audioRefs.current).forEach((id) => {
        if (id !== beatId.toString() && audioRefs.current[id]) {
          audioRefs.current[id].pause();
          audioRefs.current[id].currentTime = 0;
        }
      });
 
      try {
        await audio.play();
        setCurrentlyPlaying(beatId);
        dispatch(playBeatAction(beatId, false));
        window.dispatchEvent(new CustomEvent("beat-play-start"));
      } catch (error) {
        console.error("Error playing audio:", error);
        toast.error(`Error playing ${beat.name}: ${error.message}`);
        setCurrentlyPlaying(null);
      }
    }
  };

  const handleBeatNameClick = (beat) => {
    setSelectedBeat(beat);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBeat(null);
  };

  return (
    <>
      <UserHeader title={t('beats_page.title')} />

      <Box
        className="custom-scrollbar !top-[30%] !h-[55%] min-lg:!top-[26%] min-lg:!h-[60%]"
        style={{
          position: "absolute",
          left: "12%",
          top: "25%",
          zIndex: 3,
          pointerEvents: "auto",
          width: "calc(90% - 12%)",
          maxWidth: "100%",
          height: "60%",
          overflowY: "auto",
        }}
      >
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4rem",
          }}
          className="!gap-6"
        >
          {isLoading ? (
            <Center style={{ height: "200px", width: "100%" }}>
              <Loader color="#F6F4D3" size="lg" variant="dots" />
            </Center>
          ) : beatItems.length > 0 ? (
            beatItems.map((beat, index) => (
              <Box
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "0.5rem",
                  borderRadius: "4px",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  width: "60%",
                  height: "100px",
                }}
                className="!h-24 flex items-center justify-center min-lg:justify-start min-lg:!w-[75%] !w-[90%]"
                onMouseEnter={handleItemHover}
                onMouseLeave={handleItemLeave}
              >
                <Box
                  style={{
                    width: "70px",
                    height: "70px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  className="!h-8 !w-8 min-lg:!h-12 min-lg:!w-12 -translate-y-2 "
                  onClick={() => handlePlay(beat)}
                >
                  {currentlyPlaying === beat.id &&
                  audioRefs.current[beat.id] &&
                  !audioRefs.current[beat.id].paused
                    ? pauseIcon()
                    : playIcon()}
                </Box>

                <Box
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    gap: "0.5rem",
                    flex: 1,
                    height: "70px",
                  }}
                  className="!w-[70%] relative min-lg:!w-fit "
                >
                  <Text
                    style={{
                      fontSize: "1.1rem",
                      color: "#F6F4D3",
                      letterSpacing: "2px",
                    }}
                    className="!text-[0.8rem] absolute !vision-font -top-3 min-md:-top-6 min-lg:-top-4 left-0 w-full min-md:!text-[1.1rem] min-lg:!text-[1.5rem]"
                  >
                    {beat.name}
                  </Text>

                  <Box
                    style={{
                      height: "43px",
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "4px",
                    }}
                  >
                    <AudioWaveform
                      isPlaying={
                        currentlyPlaying === beat.id &&
                        audioRefs.current[beat.id] &&
                        !audioRefs.current[beat.id].paused
                      }
                      progress={audioProgress[beat.id] || 0}
                      audioRef={
                        currentlyPlaying === beat.id
                          ? audioRefs.current[beat.id]
                          : null
                      }
                    />
                  </Box>

                  <Box
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginTop: "-5px",
                      height: "12px",
                      paddingLeft: "0px",
                      paddingRight: "0px",
                    }}
                  >
                    <span
                      className="!vision-font font-700"
                      style={{
                        fontSize: "0.32rem",
                        color: "#676762ff",
                        letterSpacing: "0.1px",
                        opacity: 0.6,
                        lineHeight: 1,
                      }}
                    >
                      {formatTime(audioCurrentTime[beat.id] || 0)}
                    </span>

                    <span
                      className="!vision-font font-700"
                      style={{
                        fontSize: "0.32rem",
                        color: "#676762ff",
                        letterSpacing: "0.1px",
                        opacity: 0.6,
                        lineHeight: 1,
                      }}
                    >
                      -{formatTime(Math.max(0, (audioDuration[beat.id] || 0) - (audioCurrentTime[beat.id] || 0)))}
                    </span>
                  </Box>
                </Box>

                <Box
                  style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  className="!h-8 !w-8 min-lg:!h-12 min-lg:!w-12 -translate-y-2 "
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBeatNameClick(beat);
                  }}
                >
                  {downloadIcon()}
                </Box>
              </Box>
            ))
          ) : (
            <Center style={{ height: "200px", width: "100%" }}>
              <Text
                style={{
                  color: "#F6F4D3",
                  fontSize: "1.2rem",
                  letterSpacing: "2px",
                  opacity: 0.6,
                }}
                className="!vision-font"
              >
                {t('beats_page.no_tracks')}
              </Text>
            </Center>
          )}
        </Box>
      </Box>

      <SupportArtistModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        beatName={selectedBeat?.name || "eFELKIT"}
        artistName={
          selectedBeat?.category ||
          selectedBeat?.["category "] ||
          selectedBeat?.[" category"] ||
          "Unknown Artist"
        }
        audioUrl={selectedBeat?.audioUrl}
        id={selectedBeat?.id}
      />
    </>
  );
};

export default BeatPlay;
