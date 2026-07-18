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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  // Refs used inside event handlers/audio callbacks — avoid stale closures
  const bgAudioRef         = useRef(null);
  const currentPlaylistRef = useRef([]); // Single site-wide playlist — never rebuilt by navigation
  const playlistIndexRef   = useRef(-1);
  const currentUrlRef      = useRef(null);
  const isMutedRef         = useRef(false);
  const defaultVolumeRef   = useRef(70);
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

    // Advances to the next track in the site-wide playlist. This is the ONLY
    // place playback moves forward — navigation never calls this, so the
    // radio never restarts just because the user changed pages.
    const playNext = () => {
      const playlist = currentPlaylistRef.current;
      if (!playlist || playlist.length === 0) return;

      let nextIdx = playlistIndexRef.current + 1;
      if (nextIdx >= playlist.length) nextIdx = 0; // loop back to start

      playlistIndexRef.current = nextIdx;
      const nextUrl = playlist[nextIdx];
      if (!nextUrl) return;

      currentUrlRef.current = nextUrl;
      audio.src = nextUrl;
      audio.volume = defaultVolumeRef.current / 100;
      audio.load();
      if (!isMutedRef.current) {
        audio.play().catch(() => {});
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

  // ── Build ONE site-wide playlist from every section's tracks (deduplicated,
  //    shuffled) and keep it playing continuously — this is the "radio".
  //    The dependency on the section_music JSON means this only re-runs when
  //    the admin actually adds/removes tracks, never on navigation, so
  //    changing pages never restarts or interrupts what's playing. ──
  useEffect(() => {
    if (settingsLoading) return;

    const sectionMusic = settings?.section_music || {};
    const combined = [...new Set(
      Object.values(sectionMusic).filter(Boolean).flatMap(parseUrls)
    )];

    const audio = bgAudioRef.current;
    if (!audio) return;

    audio.volume = (settings?.default_volume ?? 70) / 100;

    if (combined.length === 0) {
      audio.pause();
      currentPlaylistRef.current = [];
      playlistIndexRef.current = -1;
      currentUrlRef.current = null;
      return;
    }

    const shuffled = fisherYates(combined);

    // Nothing has ever played yet — start the radio from a random track.
    if (!currentUrlRef.current) {
      currentPlaylistRef.current = shuffled;
      playlistIndexRef.current = 0;
      currentUrlRef.current = shuffled[0];

      if (!isMuted) {
        audio.src = shuffled[0];
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
      return;
    }

    // Radio is already running — the admin changed the track list. Swap the
    // pool in for future tracks WITHOUT touching what's currently playing.
    currentPlaylistRef.current = shuffled;
    playlistIndexRef.current = shuffled.indexOf(currentUrlRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsLoading, JSON.stringify(settings?.section_music)]);

  // ── Pause the radio during fullscreen game routes; resume when leaving ──
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

    if (pausedForGameRef.current) {
      pausedForGameRef.current = false;
      if (audio.paused && audio.src && !isMutedRef.current) {
        audio.play().catch(() => {});
      }
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

  // ── Fullscreen ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);

  const handleFullscreenToggle = useCallback(() => {
    if (isIos) {
      setShowIosHint(true);
      setTimeout(() => setShowIosHint(false), 4000);
      return;
    }
    if (!document.fullscreenElement) {
      (document.documentElement.requestFullscreen?.() ??
       document.documentElement.webkitRequestFullscreen?.())?.catch(() => {});
    } else {
      (document.exitFullscreen?.() ?? document.webkitExitFullscreen?.())?.catch(() => {});
    }
  }, [isIos]);

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
      <Box style={{ position: "relative", flex: 1, height: "100%", overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>
        <style>{`
          div:not(.custom-scrollbar)::-webkit-scrollbar {
            display: none !important;
          }
        `}</style>
        <Outlet />
      </Box>

      {/* iOS hint tooltip */}
      {showIosHint && (
        <div style={{
          position: "fixed",
          bottom: "7.5rem",
          right: "1.5rem",
          zIndex: 10001,
          background: "rgba(0,0,0,0.85)",
          color: "#F6F4D3",
          fontSize: "11px",
          padding: "0.5rem 0.75rem",
          borderRadius: "8px",
          border: "1px solid rgba(246,244,211,0.25)",
          backdropFilter: "blur(8px)",
          maxWidth: "180px",
          textAlign: "center",
          lineHeight: 1.5,
          pointerEvents: "none",
        }}>
          Tap <strong>Share →</strong> then<br /><strong>"Add to Home Screen"</strong><br />for fullscreen
        </div>
      )}

      {/* Floating fullscreen toggle button */}
      <button
        onClick={handleFullscreenToggle}
        title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        style={{
          position: "fixed",
          bottom: "5rem",
          right: "1.5rem",
          zIndex: 9999,
          width: "42px",
          height: "42px",
          borderRadius: "50%",
          background: "rgba(0,0,0,0.6)",
          border: "1.5px solid rgba(246,244,211,0.35)",
          color: "#F6F4D3",
          fontSize: "15px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(6px)",
          transition: "background 0.2s",
          lineHeight: 1,
        }}
      >
        {isFullscreen ? (
          // compress / exit fullscreen
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/>
            <path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
          </svg>
        ) : (
          // expand / enter fullscreen
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 8V5a2 2 0 0 1 2-2h3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/>
            <path d="M21 16v3a2 2 0 0 1-2 2h-3"/><path d="M8 21H5a2 2 0 0 1-2-2v-3"/>
          </svg>
        )}
      </button>

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
