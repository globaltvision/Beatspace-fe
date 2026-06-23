import React, { useState, useRef, useCallback, useEffect, memo } from "react";

// Module-level cache — survives remounts within the same browser session,
// resets on hard page reload. Set to null to force a fresh fetch.
let _assetsCache = null;
import { UploadIcon1, MusicIcons1 } from "../../customIcons";
import { useTranslation } from "react-i18next";
import custAxios, { formAxios } from "../../configs/axios.config";
import { notifications } from "@mantine/notifications";
import { useSettings } from "../../contexts/SettingsContext";
import {
  Modal,
  TextInput,
  Select,
  Button,
  Group,
  Stack,
  Text,
  LoadingOverlay,
} from "@mantine/core";

// ─── constants ────────────────────────────────────────────────────────────────
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Site sections — these map directly to routes in UserLayout
const SECTIONS = [
  { key: "Home",   label: "Home",   route: "/" },
  { key: "Menu",   label: "Menu",   route: "/menu" },
  { key: "Beats",  label: "Beats",  route: "/beats" },
  { key: "Comics", label: "Comics", route: "/comics" },
  { key: "Shop",   label: "Shop",   route: "/merch" },
  { key: "Games",  label: "Games",  route: "/games" },
  { key: "Other",  label: "Other (no auto-play)", route: null },
];
const SECTION_KEYS = SECTIONS.map((s) => s.key);

const FONT_OPTIONS = [
  { value: "Vision Font", label: "Vision Font" },
  { value: "Alexandria", label: "Alexandria" },
  { value: "Press Start 2P", label: "Press Start 2P (Retro)" },
  { value: "System Font", label: "System Font" },
];
const BACKEND_ORIGIN = "http://localhost:8000";

// ─── helpers ──────────────────────────────────────────────────────────────────
const formatFileSize = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const resolveUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${BACKEND_ORIGIN}${url}`;
};

// ─── Mantine modal input styles ───────────────────────────────────────────────
const INPUT_STYLES = {
  input: { background: "#2a2e1e", border: "1px solid #6b6b3a", color: "#fff" },
  label: { color: "#CBC895", marginBottom: "4px" },
};

// ─── icons ────────────────────────────────────────────────────────────────────
const ChevronDownIcon = () => (
  <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ThreeDotsIcon = () => (
  <svg width="4" height="16" viewBox="0 0 4 16" fill="none">
    <circle cx="2" cy="2" r="2" fill="currentColor" />
    <circle cx="2" cy="8" r="2" fill="currentColor" />
    <circle cx="2" cy="14" r="2" fill="currentColor" />
  </svg>
);

const MusicNoteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

// ─── SiteConfigPanel ──────────────────────────────────────────────────────────
const SiteConfigPanel = ({ audioAssets, onRefresh }) => {
  const { settings, fetchSettings: refreshGlobal } = useSettings();
  const [siteTitle, setSiteTitle] = useState("");
  const [fontFamily, setFontFamily] = useState("Vision Font");
  const [saving, setSaving] = useState(false);
  const [sectionSaving, setSectionSaving] = useState("");

  useEffect(() => {
    if (settings) {
      setSiteTitle(settings.site_title || "");
      setFontFamily(settings.font_family || "Vision Font");
    }
  }, [settings]);

  // Save title + font only
  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("site_title", siteTitle);
      fd.append("font_family", fontFamily);
      await formAxios.patch(`/admin/settings/${settings._id}`, fd);
      notifications.show({ title: "Saved", message: "Site configuration updated", color: "green" });
      refreshGlobal();
    } catch (err) {
      notifications.show({ title: "Error", message: err?.response?.data?.message || "Save failed", color: "red" });
    } finally {
      setSaving(false);
    }
  };

  // Parse a section's stored value into a URL array (supports comma-separated playlists)
  const getSectionUrls = (sectionKey) => {
    const val = settings?.section_music?.[sectionKey.toLowerCase()] || "";
    if (!val) return [];
    return val.split(",").map(s => s.trim()).filter(Boolean);
  };

  // Save a full URL array to a section (joined as comma-separated string)
  const handleSetSectionPlaylist = async (sectionKey, urls) => {
    const key = sectionKey.toLowerCase();
    setSectionSaving(key);
    try {
      const urlStr = urls.filter(Boolean).join(",") || null;
      await custAxios.patch("/admin/settings/section-music", { section: key, url: urlStr });
      notifications.show({
        title: `${sectionKey} Playlist Updated`,
        message: urls.length ? `${urls.length} track(s) in playlist` : "BGM cleared",
        color: "green",
      });
      refreshGlobal();
      window.dispatchEvent(new Event("settings-changed"));
    } catch (err) {
      notifications.show({ title: "Error", message: "Failed to update section music", color: "red" });
    } finally {
      setSectionSaving("");
    }
  };

  const handleAddTrack = (sectionKey, url) => {
    if (!url) return;
    const current = getSectionUrls(sectionKey);
    if (current.includes(url)) return;
    handleSetSectionPlaylist(sectionKey, [...current, url]);
  };

  const handleRemoveTrack = (sectionKey, url) => {
    const current = getSectionUrls(sectionKey);
    handleSetSectionPlaylist(sectionKey, current.filter(u => u !== url));
  };

  const bgmSections = SECTIONS.filter((s) => s.key !== "Other");

  return (
    <section className="bg-[rgba(181,179,135,0.16)] border border-[rgba(203,200,149,1)] w-full px-4 sm:px-6 lg:px-7 py-6 relative">
      <LoadingOverlay visible={saving} overlayProps={{ blur: 2 }} />
      <h2 className="text-[rgba(223,215,79,1)] text-lg sm:text-xl lg:text-[20px] font-normal leading-tight mb-6 pixel-font uppercase">
        Site Configuration
      </h2>

      {/* Title + Font row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-[#CBC895] text-sm alexandria-font mb-2 uppercase">Site Title</label>
          <input
            type="text"
            value={siteTitle}
            onChange={(e) => setSiteTitle(e.target.value)}
            className="w-full bg-[rgba(19,19,25,1)] border border-[rgba(203,200,149,1)] px-4 py-3 text-[#9C963A] text-base alexandria-font focus:outline-none focus:border-[rgba(223,215,79,1)]"
            placeholder="Beatspace"
          />
        </div>
        <div>
          <label className="block text-[#CBC895] text-sm alexandria-font mb-2 uppercase">Site Font</label>
          <div className="relative">
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full bg-[rgba(19,19,25,1)] border border-[rgba(203,200,149,1)] px-4 py-3 text-[#9C963A] text-base alexandria-font appearance-none focus:outline-none focus:border-[rgba(223,215,79,1)] cursor-pointer"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#CBC895]">
              <ChevronDownIcon />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-[rgba(203,200,149,1)] shadow-[0px_7px_2px_rgba(0,0,0,1)] text-[rgba(25,26,34,1)] text-sm font-semibold alexandria-font px-6 py-3 hover:bg-[rgba(213,210,159,1)] transition-colors disabled:opacity-50 mb-8"
      >
        {saving ? "Saving…" : "Save Configuration"}
      </button>

      {/* Per-Section BGM Playlists */}
      <div>
        <label className="block text-[#CBC895] text-sm alexandria-font mb-1 uppercase">
          Background Music Per Section
        </label>
        <p className="text-[rgba(255,249,153,0.6)] text-xs alexandria-font mb-4">
          Each section has its own playlist. All tracks shuffle globally across sections.
          Add multiple tracks per section — music continues across page navigation.
        </p>

        {audioAssets.length === 0 ? (
          <p className="text-[rgba(203,200,149,0.4)] text-sm alexandria-font">
            Upload audio files below to assign them to sections.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {bgmSections.map((sec) => {
              const activeUrls = getSectionUrls(sec.key);
              const isSaving = sectionSaving === sec.key.toLowerCase();
              const availableTracks = audioAssets.filter(a => !activeUrls.includes(a.url));

              return (
                <div
                  key={sec.key}
                  className={`border p-4 transition-colors ${
                    activeUrls.length > 0
                      ? "border-[rgba(223,215,79,0.6)] bg-[rgba(223,215,79,0.05)]"
                      : "border-[rgba(203,200,149,0.25)] bg-[rgba(19,19,25,0.4)]"
                  }`}
                >
                  {/* Section label */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[rgba(203,200,149,1)] text-sm font-semibold alexandria-font uppercase">
                      {sec.label}
                    </span>
                    <div className="flex items-center gap-2">
                      {activeUrls.length > 0 && (
                        <span className="text-[rgba(223,215,79,0.7)] text-xs">
                          {activeUrls.length} track{activeUrls.length > 1 ? "s" : ""}
                        </span>
                      )}
                      {activeUrls.length > 0 && (
                        <button
                          onClick={() => handleSetSectionPlaylist(sec.key, [])}
                          disabled={isSaving}
                          className="text-[rgba(239,68,68,0.8)] text-xs hover:text-red-400 transition-colors disabled:opacity-50"
                          title="Clear all tracks for this section"
                        >
                          ✕ Clear all
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Current playlist */}
                  {activeUrls.length > 0 ? (
                    <div className="mb-3 space-y-1">
                      {activeUrls.map((url, idx) => {
                        const asset = audioAssets.find(a => a.url === url);
                        return (
                          <div key={url} className="flex items-center gap-2 bg-[rgba(19,19,25,0.6)] px-2 py-1 rounded">
                            <span className="text-[rgba(223,215,79,0.7)] text-xs w-4 shrink-0">{idx + 1}.</span>
                            <span className="text-[rgba(223,215,79,1)] shrink-0"><MusicNoteIcon /></span>
                            <span className="text-white text-xs truncate flex-1">{asset?.fileName || url}</span>
                            <button
                              onClick={() => handleRemoveTrack(sec.key, url)}
                              disabled={isSaving}
                              className="text-[rgba(239,68,68,0.7)] text-xs hover:text-red-400 shrink-0 disabled:opacity-50"
                              title="Remove from playlist"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[rgba(203,200,149,0.35)] text-xs alexandria-font mb-3 italic">No tracks assigned</p>
                  )}

                  {/* Add track selector */}
                  {availableTracks.length > 0 && (
                    <div className="relative">
                      <select
                        value=""
                        onChange={(e) => handleAddTrack(sec.key, e.target.value)}
                        disabled={isSaving}
                        className="w-full bg-[rgba(19,19,25,1)] border border-[rgba(203,200,149,0.4)] px-3 py-2 text-[#9C963A] text-xs alexandria-font appearance-none focus:outline-none focus:border-[rgba(223,215,79,1)] cursor-pointer disabled:opacity-50 pr-7"
                      >
                        <option value="">+ Add track to playlist</option>
                        {availableTracks.map((a) => (
                          <option key={a._id} value={a.url}>{a.fileName}</option>
                        ))}
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#CBC895]">
                        <ChevronDownIcon />
                      </div>
                    </div>
                  )}
                  {availableTracks.length === 0 && audioAssets.length > 0 && (
                    <p className="text-[rgba(203,200,149,0.4)] text-xs italic">All tracks assigned</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

// ─── AssetUpload ──────────────────────────────────────────────────────────────
const AssetUpload = memo(({ onFileUpload, uploading }) => {
  const { t } = useTranslation();
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = Array.from(e.dataTransfer.files).filter(
        (f) => f.size <= MAX_FILE_SIZE
      );
      if (files.length) onFileUpload(files);
    },
    [onFileUpload]
  );

  const handleFileChange = useCallback(
    (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length) onFileUpload(files);
      e.target.value = "";
    },
    [onFileUpload]
  );

  return (
    <section className="bg-[rgba(181,179,135,0.16)] border w-full px-4 sm:px-6 lg:px-[23px] py-6 sm:py-7 lg:py-[29px] border-[rgba(203,200,149,1)] border-solid overflow-hidden relative">
      <LoadingOverlay visible={uploading} overlayProps={{ blur: 2 }} />
      <div className="flex w-full items-center gap-4 sm:gap-5 flex-col sm:flex-row justify-between">
        <h1 className="text-[rgba(223,215,79,1)] text-lg sm:text-xl lg:text-[23px] font-normal leading-tight">
          {t("assets.title")}
        </h1>
      </div>

      <div
        className={`bg-[rgba(82,81,50,1)] flex flex-col items-center font-normal mt-6 py-8 sm:py-12 lg:py-16 px-4 sm:px-8 lg:px-20 border-[rgba(203,200,149,1)] border-dashed border-2 sm:border-[3px] transition-colors ${isDragOver ? "bg-[rgba(102,101,70,1)]" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
        onDrop={handleDrop}
      >
        <div className="flex w-full max-w-lg flex-col items-center">
          <div className="mb-6"><UploadIcon1 /></div>
          <div className="text-[rgba(235,226,60,1)] text-lg sm:text-xl lg:text-[22px] leading-tight text-center border border-black border-solid px-2 py-1">
            {t("assets.drop_here")}
          </div>
          <div className="text-white text-base sm:text-lg lg:text-xl leading-tight text-center mt-3 sm:mt-4">
            Images, Audio (MP3/WAV), and more — up to 50 MB
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-[rgba(221,209,177,1)] shadow-[0px_7px_2px_rgba(0,0,0,1)] flex min-h-[45px] sm:min-h-[53px] w-full sm:w-auto sm:min-w-[180px] lg:w-[202px] items-center gap-2 text-base sm:text-lg text-[rgba(25,26,34,1)] font-semibold leading-loose justify-center mt-8 sm:mt-12 lg:mt-[60px] px-3 sm:px-[13px] py-2 sm:py-[13px] rounded-none hover:bg-[rgba(231,219,187,1)] transition-colors disabled:opacity-50"
            type="button"
          >
            {uploading ? "Uploading…" : t("assets.select_files")}
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,audio/*,.mp3,.wav,.ogg"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </section>
  );
});
AssetUpload.displayName = "AssetUpload";

// ─── AssetFilters ─────────────────────────────────────────────────────────────
const AssetFilters = memo(({ onSearchChange, onTypeFilter, onCategoryFilter }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <section className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-5 text-base text-[rgba(25,26,34,1)] font-semibold leading-loose mt-4">
      <div className="bg-[rgba(156,150,58,1)] flex flex-col font-medium justify-center flex-1 min-w-0 px-4 sm:px-6 lg:px-[27px] py-3 sm:py-4 lg:py-[18px]">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); onSearchChange(e.target.value); }}
          placeholder={t("assets.search_placeholder")}
          className="bg-transparent border-none outline-none text-[rgba(25,26,34,1)] placeholder-[rgba(25,26,34,1)] w-full font-semibold"
        />
      </div>

      <div className="bg-[rgba(221,209,177,1)] shadow-[0px_7px_0px_rgba(140,129,0,1)] flex min-h-[50px] sm:min-h-[60px] items-center w-full sm:w-auto sm:min-w-[180px] lg:w-[201px] px-3 py-3 sm:py-4 relative">
        <select onChange={(e) => onTypeFilter(e.target.value)} className="bg-transparent border-none outline-none text-[rgba(25,26,34,1)] font-semibold cursor-pointer appearance-none w-full text-center pr-6">
          <option value="">All Types</option>
          <option value="audio">Audio</option>
          <option value="image">Image</option>
          <option value="video">Video</option>
          <option value="other">Other</option>
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"><ChevronDownIcon /></div>
      </div>

      <div className="bg-[rgba(221,209,177,1)] shadow-[0px_7px_0px_rgba(140,129,0,1)] flex min-h-[50px] sm:min-h-[60px] items-center w-full sm:w-auto sm:min-w-[180px] lg:w-[201px] px-3 py-3 sm:py-4 relative">
        <select onChange={(e) => onCategoryFilter(e.target.value)} className="bg-transparent border-none outline-none text-[rgba(25,26,34,1)] font-semibold cursor-pointer appearance-none w-full text-center pr-6">
          <option value="">All Sections</option>
          {SECTION_KEYS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"><ChevronDownIcon /></div>
      </div>
    </section>
  );
});
AssetFilters.displayName = "AssetFilters";

// ─── AssetRow ─────────────────────────────────────────────────────────────────
const AssetRow = memo(({ asset, onAction, sectionMusic }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  // Check if this audio is in the playlist for its own section
  const sectionKey = asset.section?.toLowerCase();
  const isActiveBGM = asset.fileType === "audio" && sectionKey && (() => {
    const val = sectionMusic?.[sectionKey] || "";
    return val.split(",").map(s => s.trim()).includes(asset.url);
  })();

  useEffect(() => {
    if (!isMenuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isMenuOpen]);

  const handleAction = (action) => {
    onAction(asset, action);
    setIsMenuOpen(false);
  };

  return (
    <div className="bg-[rgba(197,194,116,0.16)] border grid grid-cols-[50px_1fr_50px] sm:grid-cols-[60px_1fr_120px_80px] lg:grid-cols-[60px_1fr_120px_100px_120px_120px_80px] gap-4 w-full items-center text-sm sm:text-base text-white font-normal leading-tight px-3 sm:px-6 lg:px-[30px] py-3 sm:py-4 lg:py-5 border-[rgba(203,200,149,1)] border-solid">
      <div className="flex items-center justify-start">
        <div className="w-5 sm:w-6 flex items-center justify-start">
          {asset.fileType === "audio" ? (
            <span className={isActiveBGM ? "text-[rgba(223,215,79,1)]" : "text-[rgba(203,200,149,0.6)]"}>
              <MusicNoteIcon />
            </span>
          ) : (
            <MusicIcons1 />
          )}
        </div>
      </div>
      <div className="truncate text-left" title={asset.fileName}>
        <span className="truncate block">{asset.fileName}</span>
        {isActiveBGM && (
          <span className="text-[rgba(223,215,79,0.8)] text-xs">▶ Active BGM</span>
        )}
      </div>
      <div className="hidden sm:block text-left">{asset.section || "—"}</div>
      <div className="hidden lg:block text-left">{formatFileSize(asset.size)}</div>
      <div className="hidden lg:block text-left">{asset.uploadedBy || "Admin"}</div>
      <div className="hidden lg:block text-left">{asset.createdAt ? asset.createdAt.split("T")[0] : "—"}</div>

      <div className="flex items-center justify-start relative" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen((p) => !p)}
          className="text-[rgba(203,200,149,1)] hover:text-[rgba(223,220,169,1)] transition-colors p-1"
        >
          <ThreeDotsIcon />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 top-full mt-1 bg-[rgba(19,19,25,1)] border border-[rgba(203,200,149,1)] shadow-lg z-10 min-w-[140px]">
            <button onClick={() => handleAction("download")} className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[rgba(197,194,116,0.16)] transition-colors">
              Download
            </button>
            {asset.fileType === "audio" && (
              <button onClick={() => handleAction("set-bgm")} className="w-full text-left px-3 py-2 text-sm text-[rgba(223,215,79,1)] hover:bg-[rgba(197,194,116,0.16)] transition-colors">
                {isActiveBGM ? "Clear BGM" : "Set as BGM"}
              </button>
            )}
            <button onClick={() => handleAction("edit")} className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[rgba(197,194,116,0.16)] transition-colors">
              Edit
            </button>
            <button onClick={() => handleAction("delete")} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-[rgba(197,194,116,0.16)] transition-colors">
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
});
AssetRow.displayName = "AssetRow";

// ─── AssetTable ───────────────────────────────────────────────────────────────
const AssetTable = memo(({ assets, onAssetAction, loading, sectionMusic }) => (
  <div className="mt-4 sm:mt-[17px]">
    <div className="bg-[rgba(19,19,25,1)] grid grid-cols-[50px_1fr_50px] sm:grid-cols-[60px_1fr_120px_80px] lg:grid-cols-[60px_1fr_120px_100px_120px_120px_80px] gap-4 text-sm sm:text-base text-[rgba(203,200,149,1)] font-normal leading-tight px-3 sm:px-6 lg:px-[26px] py-2 sm:py-3 lg:py-4">
      <div>Preview</div>
      <div>File Name</div>
      <div className="hidden sm:block">Section</div>
      <div className="hidden lg:block">Size</div>
      <div className="hidden lg:block">Uploaded By</div>
      <div className="hidden lg:block">Date</div>
      <div>Actions</div>
    </div>

    {loading ? (
      <div className="bg-[rgba(197,194,116,0.16)] border border-[rgba(203,200,149,1)] px-6 py-12 text-center text-white">
        Loading assets…
      </div>
    ) : assets.length === 0 ? (
      <div className="bg-[rgba(197,194,116,0.16)] border border-[rgba(203,200,149,1)] px-6 py-12 text-center text-white">
        <p className="text-lg">No assets found</p>
        <p className="text-sm text-gray-300 mt-2">Upload files above to get started</p>
      </div>
    ) : (
      assets.map((asset) => (
        <AssetRow key={asset._id || asset.id} asset={asset} onAction={onAssetAction} sectionMusic={sectionMusic} />
      ))
    )}
  </div>
));
AssetTable.displayName = "AssetTable";

// ─── EditModal ─────────────────────────────────────────────────────────────────
const EditModal = ({ opened, asset, onClose, onSave, saving }) => {
  const [fileName, setFileName] = useState("");
  const [section, setSection] = useState("Other");

  useEffect(() => {
    if (asset) {
      setFileName(asset.fileName || "");
      setSection(asset.section || "Other");
    }
  }, [asset]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Edit Asset"
      centered
      styles={{
        content: { background: "#1a1b25", border: "1px solid #6b6b3a" },
        header: { background: "#1a1b25", borderBottom: "1px solid #3a3a1e" },
        title: { color: "#CBC895", fontFamily: "'Alexandria', sans-serif", fontSize: "16px" },
        close: { color: "#CBC895" },
      }}
      className="alexandria-font"
    >
      <Stack gap="md">
        <TextInput label="File Name" value={fileName} onChange={(e) => { const v = e.currentTarget.value; setFileName(v); }} styles={INPUT_STYLES} />
        <Select label="Section" value={section} onChange={setSection} data={SECTION_KEYS} styles={INPUT_STYLES} />
        <Group justify="flex-end" mt="sm">
          <Button variant="outline" onClick={onClose} styles={{ root: { borderColor: "#6b6b3a", color: "#CBC895" } }}>Cancel</Button>
          <Button loading={saving} onClick={() => onSave(asset._id || asset.id, { fileName, section })} styles={{ root: { background: "#CBC895", color: "#1a1b25" } }}>Save</Button>
        </Group>
      </Stack>
    </Modal>
  );
};

// ─── DeleteModal ───────────────────────────────────────────────────────────────
const DeleteModal = ({ opened, asset, onClose, onConfirm, deleting }) => (
  <Modal
    opened={opened}
    onClose={onClose}
    title="Delete Asset"
    centered
    styles={{
      content: { background: "#1a1b25", border: "1px solid #6b6b3a" },
      header: { background: "#1a1b25", borderBottom: "1px solid #3a3a1e" },
      title: { color: "#e74c3c", fontFamily: "'Alexandria', sans-serif", fontSize: "16px" },
      close: { color: "#CBC895" },
    }}
    className="alexandria-font"
  >
    <Stack gap="md">
      <Text c="gray.3">
        Are you sure you want to delete <strong style={{ color: "#CBC895" }}>{asset?.fileName}</strong>? This cannot be undone.
      </Text>
      <Group justify="flex-end">
        <Button variant="outline" onClick={onClose} styles={{ root: { borderColor: "#6b6b3a", color: "#CBC895" } }}>Cancel</Button>
        <Button loading={deleting} color="red" onClick={onConfirm}>Delete</Button>
      </Group>
    </Stack>
  </Modal>
);

// ─── Main Assets Component ────────────────────────────────────────────────────
const Assets = () => {
  const { settings } = useSettings();
  const [assets, setAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [editTarget, setEditTarget] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const sectionMusic = settings?.section_music || {};

  // ── fetch assets ──────────────────────────────────────────────────────────
  const fetchAssets = useCallback(async () => {
    setLoadingAssets(true);
    try {
      const res = await custAxios.get("/admin/assets");
      const data = res.data.data || [];
      _assetsCache = data;
      setAssets(data);
    } catch {
      setAssets([]);
    } finally {
      setLoadingAssets(false);
    }
  }, []);

  useEffect(() => {
    if (_assetsCache !== null) {
      setAssets(_assetsCache);
      setLoadingAssets(false);
      return;
    }
    fetchAssets();
  }, [fetchAssets]);

  // ── filtered list ─────────────────────────────────────────────────────────
  const filteredAssets = React.useMemo(() => {
    let list = assets;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((a) => (a.fileName || "").toLowerCase().includes(q) || (a.section || "").toLowerCase().includes(q));
    }
    if (typeFilter) list = list.filter((a) => a.fileType === typeFilter);
    if (categoryFilter) list = list.filter((a) => a.section === categoryFilter);
    return list;
  }, [assets, searchTerm, typeFilter, categoryFilter]);

  // Audio assets only (for the BGM picker in SiteConfigPanel)
  const audioAssets = React.useMemo(() => assets.filter((a) => a.fileType === "audio"), [assets]);

  // ── upload ────────────────────────────────────────────────────────────────
  const handleFileUpload = useCallback(async (files) => {
    setUploading(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("section", "Other"); // default; admin can reassign via edit or the section BGM grid
        await formAxios.post("/admin/upload-asset", fd);
      }
      notifications.show({ title: "Uploaded", message: `${files.length} file(s) uploaded`, color: "green" });
      fetchAssets();
    } catch (err) {
      notifications.show({ title: "Upload failed", message: err?.response?.data?.message || "Something went wrong", color: "red" });
    } finally {
      setUploading(false);
    }
  }, [fetchAssets]);

  // ── action dispatcher ────────────────────────────────────────────────────
  const handleAssetAction = useCallback(async (asset, action) => {
    if (action === "download") {
      const url = resolveUrl(asset.url);
      if (!url) { notifications.show({ title: "No URL", message: "Cannot resolve download URL", color: "yellow" }); return; }
      const a = document.createElement("a");
      a.href = url;
      a.download = asset.fileName || "download";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (action === "set-bgm") {
      const section = asset.section?.toLowerCase();
      const validSections = ["home", "menu", "beats", "comics", "shop", "games"];
      if (!section || !validSections.includes(section)) {
        notifications.show({ title: "No Section", message: "Edit this asset and assign it a section first, then use the section grid above.", color: "yellow" });
        return;
      }
      const currentVal = settings?.section_music?.[section] || "";
      const currentUrls = currentVal.split(",").map(s => s.trim()).filter(Boolean);
      const isInPlaylist = currentUrls.includes(asset.url);
      const newUrls = isInPlaylist
        ? currentUrls.filter(u => u !== asset.url)
        : [...currentUrls, asset.url];
      const newUrl = newUrls.join(",") || null;
      try {
        await custAxios.patch("/admin/settings/section-music", { section, url: newUrl });
        notifications.show({
          title: isInPlaylist ? `Removed from ${asset.section}` : `Added to ${asset.section}`,
          message: isInPlaylist
            ? `"${asset.fileName}" removed from playlist`
            : `"${asset.fileName}" added to ${asset.section} playlist`,
          color: "green",
        });
        window.dispatchEvent(new Event("settings-changed"));
      } catch {
        notifications.show({ title: "Error", message: "Failed to update BGM", color: "red" });
      }
    } else if (action === "edit") {
      setEditTarget(asset);
      setEditOpen(true);
    } else if (action === "delete") {
      setDeleteTarget(asset);
      setDeleteOpen(true);
    }
  }, [sectionMusic, settings]);

  // ── edit save ─────────────────────────────────────────────────────────────
  const handleEditSave = useCallback(async (id, data) => {
    setEditSaving(true);
    try {
      await custAxios.patch(`/admin/assets/${id}`, data);
      setAssets((prev) => prev.map((a) => (a._id === id || a.id === id ? { ...a, ...data } : a)));
      notifications.show({ title: "Saved", message: "Asset updated", color: "green" });
      setEditOpen(false);
    } catch (err) {
      notifications.show({ title: "Error", message: err?.response?.data?.message || "Update failed", color: "red" });
    } finally {
      setEditSaving(false);
    }
  }, []);

  // ── delete confirm ────────────────────────────────────────────────────────
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    const id = deleteTarget._id || deleteTarget.id;
    setDeleteLoading(true);
    try {
      await custAxios.delete(`/admin/assets/${id}`);
      setAssets((prev) => {
        const updated = prev.filter((a) => (a._id || a.id) !== id);
        _assetsCache = updated;
        return updated;
      });
      notifications.show({ title: "Deleted", message: "Asset removed", color: "green" });
      setDeleteOpen(false);
    } catch (err) {
      notifications.show({ title: "Error", message: err?.response?.data?.message || "Delete failed", color: "red" });
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteTarget]);

  return (
    <main className="w-full bg-[#1A1A23] p-2 sm:p-4 alexandria-font overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-4 sm:space-y-6">
          {/* ─── Site Configuration Panel ─── */}
          <SiteConfigPanel audioAssets={audioAssets} onRefresh={fetchAssets} />

          {/* ─── File Upload ─── */}
          <AssetUpload onFileUpload={handleFileUpload} uploading={uploading} />

          {/* ─── Filters ─── */}
          <AssetFilters
            onSearchChange={setSearchTerm}
            onTypeFilter={setTypeFilter}
            onCategoryFilter={setCategoryFilter}
          />

          {/* ─── Asset Table ─── */}
          <AssetTable
            assets={filteredAssets}
            onAssetAction={handleAssetAction}
            loading={loadingAssets}
            sectionMusic={sectionMusic}
          />
        </div>
      </div>

      <EditModal opened={editOpen} asset={editTarget} onClose={() => setEditOpen(false)} onSave={handleEditSave} saving={editSaving} />
      <DeleteModal opened={deleteOpen} asset={deleteTarget} onClose={() => setDeleteOpen(false)} onConfirm={handleDeleteConfirm} deleting={deleteLoading} />
    </main>
  );
};

export default Assets;
