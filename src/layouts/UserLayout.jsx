import React, { useEffect, useRef, useMemo, useCallback, memo, useState } from "react";
import { Box } from "@mantine/core";
import { Outlet, useLocation } from "react-router-dom";
import { useSettings } from "../contexts/SettingsContext";

// Fisher-Yates in-place shuffle (returns a new array)
const fisherYates = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Map a pathname to its section key (must match backend section_music keys)
const getSection = (pathname) => {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/menu")) return "menu";
  if (pathname.startsWith("/beats") || pathname.startsWith("/beatplay")) return "beats";
  if (pathname.startsWith("/comics")) return "comics";
  if (
    pathname.startsWith("/merch") ||
    pathname.startsWith("/shop") ||
    pathname.startsWith("/buyshirt") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/success")
  ) return "shop";
  if (pathname.startsWith("/games")) return "games";
  return null;
};

// Parse comma-separated URL string into an array
const parseUrls = (val) =>
  (val || "").split(",").map(s => s.trim()).filter(Boolean);

// Get URLs for a specific section, falling back to global pool if section has none
const getSectionUrls = (sectionKey, sectionMusic) => {
  if (sectionKey) {
    const urls = parseUrls(sectionMusic[sectionKey]);
    if (urls.length) return urls;
  }
  // Global fallback — all tracks across all sections (deduplicated)
  return [...new Set(
    Object.values(sectionMusic)
      .filter(Boolean)
      .flatMap(v => parseUrls(v))
  )];
};

// Static background video — rendered once, never re-renders
const BgVideo = memo(() => (
  <video
    autoPlay
    muted
    loop
    playsInline
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
      zIndex: 0,
    }}
  >
    <source src="/assets/bgvideo.mp4" type="video/mp4" />
  </video>
));
BgVideo.displayName = "BgVideo";

const UserLayout = () => {
  const location = useLocation();
  const { settings, loading: settingsLoading, fetchSettings } = useSettings();
  const [isMuted, setIsMuted] = useState(false);

  // Refs used inside event handlers/audio callbacks — avoid stale closures
  const bgAudioRef         = useRef(null);
  const playlistsBySectionRef = useRef({}); // Pre-processed playlists for each section
  const currentPlaylistRef = useRef([]); // Current section's playlist
  const playlistIndexRef   = useRef(-1);
  const currentUrlRef      = useRef(null);
  const isMutedRef         = useRef(false);
  const defaultVolumeRef   = useRef(70);
  const sectionMusicRef    = useRef({});
  const currentSectionRef  = useRef(null);  // tracks current section key
  const settingsLoadingRef = useRef(true);  // tracks loading state for location effect
  const pausedForGameRef   = useRef(false);
  const fetchingRef        = useRef(false);

  // Keep mutable refs in sync
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
  useEffect(() => { defaultVolumeRef.current = settings?.default_volume ?? 70; }, [settings?.default_volume]);
  useEffect(() => { settingsLoadingRef.current = settingsLoading; }, [settingsLoading]);

  const section = useMemo(() => getSection(location.pathname), [location.pathname]);

  const fetchIfNeeded = useCallback(() => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    fetchSettings().finally(() => { fetchingRef.current = false; });
  }, [fetchSettings]);

  // Re-fetch settings when the top-level section changes
  useEffect(() => {
    fetchIfNeeded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  // ── Create audio element once; attach a permanent `ended` handler via refs ──
  useEffect(() => {
    const audio = new Audio();
    bgAudioRef.current = audio;

    const playNext = () => {
      console.log("🎵 playNext called");
      
      const playlist = currentPlaylistRef.current;
      if (!playlist || playlist.length === 0) {
        console.log("🎵 No playlist available");
        return;
      }

      let nextIdx = playlistIndexRef.current + 1;
      console.log("🎵 Current index:", playlistIndexRef.current, "Next index:", nextIdx);

      // If we've reached the end, loop back to start
      if (nextIdx >= playlist.length) {
        console.log("🎵 End of playlist, looping to start");
        nextIdx = 0;
      }

      playlistIndexRef.current = nextIdx;
      const nextUrl = playlist[nextIdx];
      console.log("🎵 Playing track", nextIdx + 1, "of", playlist.length, ":", nextUrl);
      
      if (!nextUrl) return;

      currentUrlRef.current = nextUrl;
      audio.src = nextUrl;
      audio.volume = defaultVolumeRef.current / 100;
      audio.load();
      if (!isMutedRef.current) {
        console.log("🎵 Starting playback");
        audio.play().catch((err) => {
          console.error("🎵 Playback failed:", err);
        });
      } else {
        console.log("🎵 Audio is muted, not playing");
      }
    };

    audio.addEventListener("ended", playNext);

    return () => {
      audio.removeEventListener("ended", playNext);
      audio.pause();
      audio.src = "";
      bgAudioRef.current = null;
    };
  }, []); // mount only

  // ── Sync settings into ref; start initial playback ──
  useEffect(() => {
    const sectionMusic = settings?.section_music || {};
    sectionMusicRef.current = sectionMusic;

    if (settingsLoading) return;

    // Pre-process all playlists from backend response
    console.log("🎶 Pre-processing playlists from backend");
    const processedPlaylists = {};
    
    // Process each section
    Object.keys(sectionMusic).forEach(sectionKey => {
      const urls = parseUrls(sectionMusic[sectionKey]);
      if (urls.length > 0) {
        processedPlaylists[sectionKey] = urls; // Keep original order, no shuffle
        console.log(`🎶 Section "${sectionKey}":`, urls.length, "tracks");
      }
    });
    
    playlistsBySectionRef.current = processedPlaylists;
    console.log("🎶 All playlists ready:", Object.keys(processedPlaylists));

    const audio = bgAudioRef.current;
    if (!audio) return;

    audio.volume = (settings?.default_volume ?? 70) / 100;

    const sec = currentSectionRef.current || section;
    const playlist = processedPlaylists[sec] || [];

    if (playlist.length === 0) {
      audio.pause();
      currentPlaylistRef.current = [];
      playlistIndexRef.current = -1;
      currentUrlRef.current = null;
      return;
    }

    // Already playing a valid track for this section — don't interrupt
    if (!audio.paused && currentUrlRef.current && playlist.includes(currentUrlRef.current)) {
      console.log("🎶 Already playing valid track for section, continuing");
      return;
    }

    // Start first track
    currentPlaylistRef.current = playlist;
    playlistIndexRef.current = 0;
    currentUrlRef.current = playlist[0];

    if (!isMuted) {
      console.log("🎶 Starting first track:", playlist[0]);
      audio.src = playlist[0];
      audio.load();
      const p = audio.play();
      if (p !== undefined) {
        p.catch(() => {
          const tryResume = () => {
            if (audio.paused && audio.src) audio.play().catch(() => {});
          };
          window.addEventListener("click",      tryResume, { capture: true, once: true });
          window.addEventListener("keydown",    tryResume, { capture: true, once: true });
          window.addEventListener("touchstart", tryResume, { capture: true, once: true });
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsLoading, JSON.stringify(settings?.section_music)]);

  // ── Section switching on navigation ──
  useEffect(() => {
    const audio = bgAudioRef.current;
    if (!audio) return;

    const isGameRoute =
      location.pathname.startsWith("/games/play") ||
      location.pathname.startsWith("/games/eternal-run");

    if (isGameRoute) {
      if (!audio.paused) {
        audio.pause();
        pausedForGameRef.current = true;
      }
      return;
    }

    const wasGame = pausedForGameRef.current;
    pausedForGameRef.current = false;

    const newSection = getSection(location.pathname);
    const oldSection = currentSectionRef.current;
    
    console.log("🔄 Navigation - old section:", oldSection, "→ new section:", newSection);
    
    currentSectionRef.current = newSection;

    // Wait until settings are loaded before switching tracks
    if (settingsLoadingRef.current) {
      console.log("🔄 Settings still loading, skipping");
      return;
    }

    const playlist = playlistsBySectionRef.current[newSection] || [];
    console.log("🔄 Playlist for new section:", playlist);

    if (playlist.length === 0) {
      // No tracks for this section — resume if returning from game
      if (wasGame && audio.paused && audio.src && !isMutedRef.current) {
        console.log("🔄 Resuming from game");
        audio.play().catch(() => {});
      }
      return;
    }

    // If section hasn't changed, just resume playback if needed
    if (oldSection === newSection) {
      console.log("🔄 Same section, resuming if paused");
      if (audio.paused && !isMutedRef.current && audio.src) {
        audio.play().catch(() => {});
      }
      return;
    }

    // Section changed — ALWAYS start with first track of new section
    console.log("🔄 Section changed, loading FIRST track of new section");
    currentPlaylistRef.current = playlist;
    playlistIndexRef.current = 0;
    currentUrlRef.current = playlist[0];

    if (!isMutedRef.current) {
      console.log("🔄 Loading track:", playlist[0]);
      audio.src = playlist[0];
      audio.load();
      audio.play().catch(() => {});
    }
  }, [location.pathname]);

  // ── Volume sync ──
  useEffect(() => {
    const audio = bgAudioRef.current;
    if (audio) audio.volume = (settings?.default_volume ?? 70) / 100;
  }, [settings?.default_volume]);

  // ── Beat events — always pause BGM when a beat plays (mandatory) ──
  useEffect(() => {
    const handleBeatStart = () => {
      const audio = bgAudioRef.current;
      if (audio && !audio.paused) audio.pause();
    };
    const handleBeatStop = () => {
      const audio = bgAudioRef.current;
      if (audio && audio.src && audio.paused && !isMutedRef.current) {
        audio.play().catch(() => {});
      }
    };
    window.addEventListener("beat-play-start", handleBeatStart);
    window.addEventListener("beat-play-stop",  handleBeatStop);
    return () => {
      window.removeEventListener("beat-play-start", handleBeatStart);
      window.removeEventListener("beat-play-stop",  handleBeatStop);
    };
  }, []); // no deps — uses refs only

  const handleMuteToggle = () => {
    const audio = bgAudioRef.current;
    if (!audio) return;
    if (isMuted) {
      setIsMuted(false);
      isMutedRef.current = false;
      if (audio.src && audio.paused) audio.play().catch(() => {});
    } else {
      setIsMuted(true);
      isMutedRef.current = true;
      if (!audio.paused) audio.pause();
    }
  };

  return (
    <Box
      style={{
        height: "100vh",
        backgroundColor: "#111827",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <BgVideo />
      <Box style={{ position: "relative", zIndex: 1, flex: 1, height: "100%", overflowY: "auto" }}>
        <Outlet />
      </Box>

      {/* Floating mute/unmute button */}
      <button
        onClick={handleMuteToggle}
        title={isMuted ? "Unmute music" : "Mute music"}
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 9999,
          width: "42px",
          height: "42px",
          borderRadius: "50%",
          background: "rgba(0,0,0,0.6)",
          border: "1.5px solid rgba(246,244,211,0.35)",
          color: "#F6F4D3",
          fontSize: "17px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(6px)",
          transition: "background 0.2s",
          lineHeight: 1,
        }}
      >
        {isMuted ? "🔇" : "🔊"}
      </button>
    </Box>
  );
};

export default UserLayout;
