import React, { useState, useEffect, useCallback, useRef } from "react";
import { DiskIcon, MusicIcon, UploadIcon } from "../../customIcons";
import { useBeatController } from "../../hooks/useBeatController";
import { toast } from "sonner";
import { Modal } from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import { dashboard } from "../../store/actions/adminActions";
import { playBeatAction } from "../../store/actions/beatActions";
import ConfirmModal from "../../components/ConfirmModal";
import CategoryAPI from "../../services/category.service";
import { useTranslation } from "react-i18next";
import { t } from "i18next";

const AudioVisualizer = ({ isDark }) => (
  <div className="flex items-end gap-[2px] h-4 mb-1">
    {[0, 0.2, 0.1, 0.3].map((delay, i) => (
      <div
        key={i}
        className={`w-[3px] rounded-full ${isDark ? "bg-black" : "bg-[#FFD700]"} animate-musicBar`}
        style={{
          animationDelay: `${delay}s`,
          animationDuration: `${0.5 + (i % 2) * 0.2}s`,
        }}
      ></div>
    ))}
  </div>
);

const getBeatGenres = (beat) => {
  const rawGenres = Array.isArray(beat.genre)
    ? beat.genre
    : beat.genre
      ? beat.genre.split(",")
      : [];

  return rawGenres.map((genre) => genre.trim()).filter(Boolean);
};

const normalizeGenrePayload = (genre) => {
  if (Array.isArray(genre)) {
    return genre.join(",");
  }
  return genre || "";
};

const GenreMultiSelect = ({
  genres,
  value,
  onChange,
  labelClassName = "text-[10px] font-bold uppercase text-[#B5B387]",
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleGenre = (genreName) => {
    const nextGenres = value.includes(genreName)
      ? value.filter((genre) => genre !== genreName)
      : [...value, genreName];

    onChange(nextGenres);
  };

  return (
    <div className="space-y-1 relative" ref={dropdownRef}>
      <label className={labelClassName}>{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full min-h-12 bg-[#333] border border-[#D4D4B0] px-4 py-2 text-white focus:outline-none focus:border-[#FFD700] cursor-pointer flex items-center justify-between gap-3"
        style={{ fontFamily: "monospace" }}
      >
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          {value.length > 0 ? (
            value.map((genre) => (
              <span
                key={genre}
                className="px-2 py-1 text-[10px] font-bold uppercase bg-[#191A22] text-[#FFD700] border border-[#FFD700]"
              >
                {genre}
              </span>
            ))
          ) : (
            <span className="text-sm font-bold text-[#D4D4B0] uppercase">
              Select genres
            </span>
          )}
        </div>
        <svg
          width="12"
          height="8"
          className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path d="M1 1L6 6L11 1" stroke="#FFD700" strokeWidth="2" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-[#191A22] border-2 border-[#FFD700] shadow-2xl max-h-56 overflow-y-auto">
          {genres.map((genre) => {
            const isSelected = value.includes(genre.name);
            return (
              <button
                key={genre._id}
                type="button"
                onClick={() => toggleGenre(genre.name)}
                className={`w-full px-4 py-3 text-left font-bold uppercase flex items-center justify-between gap-3 border-b border-[#4A4A3C] hover:bg-[#4A4A3C] ${isSelected ? "text-[#FFD700]" : "text-[#D4D4B0]"}`}
                style={{ fontFamily: "monospace" }}
              >
                <span>{genre.name}</span>
                <span className={`w-5 h-5 border flex items-center justify-center ${isSelected ? "bg-[#FFD700] border-[#FFD700]" : "border-[#D4D4B0]"}`}>
                  {isSelected && (
                    <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                      <path
                        d="M1 4.5L4.5 8L11 1"
                        stroke="black"
                        strokeWidth="2"
                        strokeLinecap="square"
                      />
                    </svg>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const BeatRow = ({
  beat,
  isPlaying,
  currentTime,
  duration,
  formatTime,
  handlePlayToggle,
  handleOpenEditModal,
  handleDeleteBeat,
}) => {
  const genres = getBeatGenres(beat);
  const date = beat.createdAt
    ? new Date(beat.createdAt).toLocaleDateString()
    : "N/A";

  const [localDuration, setLocalDuration] = useState(0);

  useEffect(() => {
    if (beat.mp3_url && !beat.duration) {
      const tempAudio = new Audio(beat.mp3_url);
      const handleLoadedMetadata = () => {
        setLocalDuration(tempAudio.duration);
      };
      tempAudio.addEventListener("loadedmetadata", handleLoadedMetadata);
      return () =>
        tempAudio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    }
  }, [beat.mp3_url, beat.duration]);

  // Use the global duration state when this beat is playing, otherwise use local/beat duration
  const displayDuration =
    isPlaying && duration > 0
      ? formatTime(duration)
      : beat.duration
        ? typeof beat.duration === "number"
          ? formatTime(beat.duration)
          : beat.duration
        : formatTime(localDuration);

  return (
    <tr
      className={`w-full h-20 lg:h-24 border-b border-[#D4D4B0] transition-all duration-200 ${isPlaying ? "bg-[#C5C274]" : "bg-[#4A4A3C] hover:bg-[#525244]"}`}
    >
      <td className="px-3 lg:px-6 py-2">
        <div className="flex flex-col justify-center items-start gap-1">
          <div
            className={`text-sm lg:text-lg font-bold ${isPlaying ? "text-black" : "text-[#D4D4B0]"}`}
            style={{ fontFamily: "monospace" }}
          >
            {beat.name}
          </div>
          <div
            className={`text-xs w-52 lg:text-sm font-normal flex items-center gap-2 ${isPlaying ? "text-black opacity-70" : "text-[#D4D4B0] opacity-70"}`}
            style={{ fontFamily: "monospace" }}
          >
            {isPlaying && <AudioVisualizer isDark={true} />}
            {isPlaying
              ? `${formatTime(currentTime)} / ${displayDuration}`
              : displayDuration}{" "}
            · {date}
          </div>
        </div>
      </td>
      <td className="px-3 lg:px-6 py-2">
        <div className="flex flex-col justify-center items-start gap-2">
          <div
            className={`text-sm lg:text-lg font-bold ${isPlaying ? "text-black" : "text-[#D4D4B0]"}`}
            style={{ fontFamily: "monospace" }}
          >
            {genres.length > 0 ? genres[0] : "HIP-HOP"}
          </div>
          <div
            className={`text-[10px] lg:text-xs font-bold ${isPlaying ? "text-black opacity-80" : "text-[#D4D4B0] opacity-80"}`}
            style={{ fontFamily: "monospace" }}
          >
            {beat.category?.toUpperCase().replace("_", " ") || "SAPHIRE"}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {genres.map((genre, i) => (
              <span
                key={i}
                className={`text-[10px] lg:text-xs px-2 py-0.5 border ${isPlaying ? "border-black text-black" : "border-[#D4D4B0] text-[#D4D4B0]"}`}
                style={{ fontFamily: "monospace" }}
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      </td>
      <td
        className="px-3 lg:px-6 py-2 text-[#D4D4B0] font-bold"
        style={{ fontFamily: "monospace" }}
      >
        {(beat.plays || 0).toLocaleString()}
      </td>
      <td
        className="px-3 lg:px-6 py-2 text-[#D4D4B0] font-bold"
        style={{ fontFamily: "monospace" }}
      >
        {beat.no_of_downloads || 0}
      </td>
      <td
        className="px-3 lg:px-6 py-2 text-[#D4D4B0] font-bold"
        style={{ fontFamily: "monospace" }}
      >
        €{(beat.donations?.amount || 0).toFixed(2)}
      </td>
      <td className="px-3 lg:px-6 py-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => handlePlayToggle(beat.id)}
            className="w-10 h-10 lg:w-12 lg:h-12 bg-[#FFD700] hover:bg-[#E4DA33] transition-colors flex items-center justify-center"
          >
            {isPlaying ? (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="black">
                <rect x="3" y="2" width="3" height="12" />
                <rect x="10" y="2" width="3" height="12" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="black">
                <path d="M4 2L14 8L4 14V2Z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => handleOpenEditModal(beat)}
            className="w-10 h-10 lg:w-12 lg:h-12 bg-[#4A4A3C] hover:bg-[#D4D1A0] hover:text-black text-[#D4D4B0] border border-[#D4D4B0] transition-colors flex items-center justify-center"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </button>
          <button
            onClick={() => handleDeleteBeat(beat.id)}
            className="w-10 h-10 lg:w-12 lg:h-12 bg-[#DC143C] hover:bg-[#B22222] transition-colors flex items-center justify-center"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="white"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M12 4L4 12M4 4L12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
};

const Beat = () => {
  const { t } = useTranslation();
  const {
    beats: reduxBeats,
    isLoading: isBeatsLoading,
    isCreating,
    beatsLoaded,
    fetchBeats,
    addBeat,
    removeBeat,
    editBeat,
  } = useBeatController();

  const dispatch = useDispatch();
  const { dashboardData } = useSelector((state) => state.admin);

  const [beats, setBeats] = useState([]);

  const [newBeatForm, setNewBeatForm] = useState({
    name: "",
    genre: [],
    category: "saphire",
    beat: null,
  });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [editBeatForm, setEditBeatForm] = useState({
    name: "",
    genre: [],
    category: "saphire",
    beat: null,
  });

  const [volume, setVolume] = useState(75);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null);
  const [pausedTime, setPausedTime] = useState(0);

  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });

  const audioRef = useRef(new Audio());
  const animationFrameRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All Genres");
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const genreFilterRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const [availableGenres, setAvailableGenres] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);

  // Category management state (#21)
  const [catActiveType, setCatActiveType] = useState("genre");
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [newCat, setNewCat] = useState({ name: "" });
  const [editingCat, setEditingCat] = useState(null);
  const [catDeleteConfirm, setCatDeleteConfirm] = useState({ isOpen: false, id: null });

  const fetchSelectOptions = useCallback(async () => {
    try {
      const [genresRes, categoriesRes] = await Promise.all([
        CategoryAPI.getAll('genre'),
        CategoryAPI.getAll('category')
      ]);
      setAvailableGenres(genresRes.data.data);
      setAvailableCategories(categoriesRes.data.data);
      return { genres: genresRes.data.data, categories: categoriesRes.data.data };
    } catch (error) {
      console.error("Error fetching category options:", error);
      return { genres: [], categories: [] };
    }
  }, []);

  useEffect(() => {
    fetchSelectOptions().then(({ genres, categories }) => {
      if (genres.length > 0) setNewBeatForm(prev => ({ ...prev, genre: [genres[0].name] }));
      if (categories.length > 0) setNewBeatForm(prev => ({ ...prev, category: categories[0].name }));
    });
  }, [fetchSelectOptions]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (genreFilterRef.current && !genreFilterRef.current.contains(event.target)) {
        setShowGenreDropdown(false);
      }
    };

    if (showGenreDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showGenreDropdown]);

  const currentlyPlayingIdRef = useRef(currentlyPlayingId);
  useEffect(() => {
    currentlyPlayingIdRef.current = currentlyPlayingId;
  }, [currentlyPlayingId]);

  const updateTime = useCallback(() => {
    if (audioRef.current && currentlyPlayingIdRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setPausedTime(audioRef.current.currentTime);
      animationFrameRef.current = requestAnimationFrame(updateTime);
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;

    const onDurationChange = () => {
      setDuration(audio.duration);
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const onEnded = () => {
      setCurrentlyPlayingId(null);
      setPausedTime(0);
      setCurrentTime(0);
      setBeats((prev) => prev.map((b) => ({ ...b, isPlaying: false })));
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    const onPlay = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(updateTime);
    };

    const onPause = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    const onTimeUpdate = () => {
      if (currentlyPlayingIdRef.current) {
        setCurrentTime(audio.currentTime);
        setPausedTime(audio.currentTime);
      }
    };

    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTimeUpdate);

    return () => {
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updateTime]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    audioRef.current.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;

    if (currentlyPlayingId) {
      const playingBeat = beats.find((b) => b.id === currentlyPlayingId);
      if (playingBeat && playingBeat.mp3_url) {
        const currentSrc = audio.src;
        const newSrc = playingBeat.mp3_url;

        if (!currentSrc || !currentSrc.includes(newSrc)) {
          audio.src = newSrc;
          audio.load();
          setPausedTime(0);
          setCurrentTime(0);

          const playAudio = () => {
            audio.play().catch((err) => {
              console.error("Playback error:", err);
              toast.error(t('beatmaker.messages.playback_error') || "Audio playback blocked or failed");
            });
          };

          if (audio.readyState >= 1) {
            playAudio();
          } else {
            audio.addEventListener("canplay", playAudio, { once: true });
          }
        } else {
          if (
            pausedTime > 0 &&
            Math.abs(audio.currentTime - pausedTime) > 0.1
          ) {
            audio.currentTime = pausedTime;
          }
          audio.play().catch((err) => {
            console.error("Playback error:", err);
            toast.error(t('beatmaker.messages.playback_error') || "Audio playback blocked or failed");
          });
        }
      }
    } else {
      audio.pause();
    }
  }, [currentlyPlayingId, beats, pausedTime]);

  useEffect(() => {
    if (reduxBeats) {
      setBeats(
        reduxBeats.map((beat) => ({
          ...beat,
          id: beat._id || beat.id,
          isPlaying: false,
        })),
      );
    }
  }, [reduxBeats]);

  useEffect(() => {
    if (!beatsLoaded) fetchBeats();
    if (!dashboardData) dispatch(dashboard());
  }, [beatsLoaded, dashboardData, fetchBeats, dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedGenre]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (
      file &&
      (file.type === "audio/mpeg" ||
        file.type === "audio/wav" ||
        file.name.endsWith(".mp3") ||
        file.name.endsWith(".wav"))
    ) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error(t('beatmaker.messages.file_size_error'));
        return;
      }
      setNewBeatForm((prev) => ({ ...prev, beat: file }));
      toast.success(t('beatmaker.messages.file_selected', { name: file.name }));
    } else {
      toast.error(t('beatmaker.messages.invalid_file'));
    }
  };

  const onButtonClick = () => fileInputRef.current.click();

  const handleInputChange = (e) => {
    const { name, value, selectedOptions, multiple } = e.target;
    setNewBeatForm((prev) => ({
      ...prev,
      [name]: multiple
        ? Array.from(selectedOptions, (option) => option.value)
        : value,
    }));
  };

  const handleAddBeat = async (e) => {
    e.preventDefault();
    if (!newBeatForm.name || !newBeatForm.beat || newBeatForm.genre.length === 0) {
      toast.error(t('beatmaker.messages.missing_fields'));
      return;
    }

    const formData = new FormData();
    formData.append("name", newBeatForm.name);
    formData.append("beat", newBeatForm.beat);
    formData.append("genre", normalizeGenrePayload(newBeatForm.genre));
    formData.append("category", newBeatForm.category);

    const res = await addBeat(formData);
    if (res?.success) {
      toast.success(t('beatmaker.messages.upload_success'));
      setNewBeatForm({
        name: "",
        genre: availableGenres[0]?.name ? [availableGenres[0].name] : [],
        beat: null,
        category: availableCategories[0]?.name || "saphire",
      });
      fetchBeats();
    } else {
      toast.error(res?.message || t('beatmaker.messages.upload_failed'));
    }
  };

  const handleDeleteBeat = (id) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const confirmDeleteBeat = async () => {
    if (!deleteConfirm.id) return;
    const id = deleteConfirm.id;

    if (currentlyPlayingId === id) {
      audioRef.current.pause();
      setCurrentlyPlayingId(null);
      setPausedTime(0);
      setCurrentTime(0);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    const res = await removeBeat(id);
    if (res?.success) {
      toast.success(t('beatmaker.messages.delete_success'));
      fetchBeats();
    } else {
      toast.error(res?.message || t('beatmaker.messages.delete_failed'));
    }
    setDeleteConfirm({ isOpen: false, id: null });
  };

  const handleOpenEditModal = (beat) => {
    setCurrentEditId(beat._id || beat.id);
    setEditBeatForm({
      name: beat.name || "",
      genre: getBeatGenres(beat),
      category: beat.category || "saphire",
      beat: null,
    });
    setIsEditModalOpen(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value, selectedOptions, multiple } = e.target;
    setEditBeatForm((prev) => ({
      ...prev,
      [name]: multiple
        ? Array.from(selectedOptions, (option) => option.value)
        : value,
    }));
  };

  const handleEditBeat = async (e) => {
    e.preventDefault();
    if (!editBeatForm.name) {
      toast.error(t('beatmaker.messages.name_required') || "Name is required");
      return;
    }
    if (editBeatForm.genre.length === 0) {
      toast.error(t('beatmaker.messages.missing_fields'));
      return;
    }

    const formData = new FormData();
    formData.append("name", editBeatForm.name);
    formData.append("genre", normalizeGenrePayload(editBeatForm.genre));
    formData.append("category", editBeatForm.category);
    if (editBeatForm.beat) {
      formData.append("beat", editBeatForm.beat);
    }

    const res = await editBeat(currentEditId, formData);
    if (res?.success) {
      toast.success(t('beatmaker.messages.update_success'));
      setIsEditModalOpen(false);
      setCurrentEditId(null);
      fetchBeats();
    } else {
      toast.error(res?.message || t('beatmaker.messages.update_failed'));
    }
  };

  const handlePlayToggle = (id) => {
    setBeats((prevBeats) => {
      const currentBeat = prevBeats.find((beat) => beat.id === id);
      const isCurrentlyPlaying = currentBeat?.isPlaying || false;

      if (isCurrentlyPlaying) {
        setPausedTime(audioRef.current.currentTime);
        setCurrentlyPlayingId(null);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        return prevBeats.map((beat) => ({ ...beat, isPlaying: false }));
      } else {
        if (currentlyPlayingId && currentlyPlayingId !== id) {
          audioRef.current.pause();
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }
        }
        if (currentlyPlayingId === id && pausedTime > 0) {
          audioRef.current.currentTime = pausedTime;
        }

        dispatch(playBeatAction(id, false));

        setCurrentlyPlayingId(id);
        return prevBeats.map((beat) => ({
          ...beat,
          isPlaying: beat.id === id,
        }));
      }
    });
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const filteredBeats = beats.filter((beat) => {
    const matchesSearch = beat.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesGenre =
      selectedGenre === "All Genres" ||
      getBeatGenres(beat).some(
        (genre) => genre.toUpperCase() === selectedGenre.toUpperCase(),
      );
    return matchesSearch && matchesGenre;
  });

  const totalPages = Math.ceil(filteredBeats.length / rowsPerPage);
  const paginatedBeats = filteredBeats.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const stats = [
    {
      value: (dashboardData?.stats?.totalBeats || beats.length).toString(),
      label: t('beatmaker.repository.stats.total_beats'),
    },
    {
      value: (
        dashboardData?.stats?.totalPlays ||
        beats.reduce((acc, b) => acc + (b.plays || 0), 0)
      ).toLocaleString(),
      label: t('beatmaker.repository.stats.total_plays'),
    },
    {
      value: (
        dashboardData?.stats?.totalDownloads ||
        beats.reduce((acc, b) => acc + (b.no_of_downloads || 0), 0)
      ).toLocaleString(),
      label: t('beatmaker.repository.stats.total_downloads'),
    },
    {
      value: `€${(
        dashboardData?.stats?.totalDonations ||
        beats.reduce((acc, b) => acc + (b.donations?.amount || 0), 0)
      ).toFixed(2)}`,
      label: t('beatmaker.repository.stats.total_donations'),
    },
  ];

  // Category management handlers (#21)
  const handleSaveCat = async (e) => {
    e.preventDefault();
    if (!newCat.name.trim()) { toast.error("Name is required"); return; }
    try {
      if (editingCat) {
        await CategoryAPI.update(editingCat._id, { name: newCat.name, type: catActiveType });
        toast.success(`${catActiveType === "genre" ? "Genre" : "Category"} updated`);
      } else {
        await CategoryAPI.create({ name: newCat.name, type: catActiveType });
        toast.success(`${catActiveType === "genre" ? "Genre" : "Category"} added`);
      }
      setNewCat({ name: "" });
      setEditingCat(null);
      setIsAddingCat(false);
      fetchSelectOptions();
    } catch {
      toast.error(editingCat ? "Update failed" : "Add failed");
    }
  };

  const handleEditCat = (cat) => {
    setEditingCat(cat);
    setNewCat({ name: cat.name });
    setIsAddingCat(true);
  };

  const confirmDeleteCat = async () => {
    if (!catDeleteConfirm.id) return;
    try {
      await CategoryAPI.delete(catDeleteConfirm.id);
      toast.success("Deleted");
      fetchSelectOptions();
    } catch {
      toast.error("Delete failed");
    } finally {
      setCatDeleteConfirm({ isOpen: false, id: null });
    }
  };

  const animationStyles = `
    @keyframes musicBar {
      0%, 100% { height: 4px; }
      50% { height: 12px; }
    }
    .animate-musicBar {
      animation: musicBar 0.6s ease-in-out infinite;
    }
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .animate-slideDown {
      animation: slideDown 0.2s ease-out;
    }
  `;

  return (
    <div className="min-h-screen alexandria-font space-y-10">
      <style>{animationStyles}</style>

      <section
        className={`w-full border-dashed transition-all duration-300 p-8 flex flex-col items-center gap-8 relative ${dragActive ? "border border-[#FFEF2E]/60 bg-[#2F2E24]" : "bg-[#2F2E24] border border-[#B5B387]/30"}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="absolute top-0 left-0 w-2 h-2 bg-[#F6F4D3]" />
        <div className="absolute top-0 right-0 w-2 h-2 bg-[#F6F4D3]" />
        <div className="absolute bottom-0 left-0 w-2 h-2 bg-[#F6F4D3]" />
        <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#F6F4D3]" />
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".mp3,.wav"
          onChange={(e) => handleFileSelect(e.target.files[0])}
        />

        <div
          className="flex flex-col items-center cursor-pointer group"
          onClick={onButtonClick}
        >
          <div className="transform group-hover:rotate-12 transition-transform duration-500">
            <DiskIcon />
          </div>
          <p
            className="mt-4 text-[#B5B387] font-bold text-center tracking-tighter"
            style={{ fontFamily: "monospace" }}
          >
            {newBeatForm.beat
              ? t('beatmaker.upload.selected', { name: newBeatForm.beat.name })
              : t('beatmaker.upload.drag_drop')}
          </p>
        </div>

        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-[#B5B387]">
              {t('beatmaker.upload.name_label')}
            </label>
            <input
              type="text"
              name="name"
              value={newBeatForm.name}
              onChange={handleInputChange}
              placeholder={t('beatmaker.upload.name_placeholder')}
              className="w-full h-12 bg-[#1A1A23] border border-[#B5B387]/30 px-4 text-white focus:outline-none focus:border-[#FFD700] placeholder:text-[#B5B387]/50"
              style={{ fontFamily: "monospace" }}
            />
          </div>
          <GenreMultiSelect
            genres={availableGenres}
            value={newBeatForm.genre}
            onChange={(genre) => setNewBeatForm((prev) => ({ ...prev, genre }))}
            label={t('beatmaker.upload.genre_label')}
          />
          <div className="md:col-span-2 space-y-1">
            <label className="text-[10px] font-bold uppercase text-[#B5B387]">
              {t('beatmaker.upload.category_label')}
            </label>
            <select
              name="category"
              value={newBeatForm.category}
              onChange={handleInputChange}
              className="w-full h-12 bg-[#1A1A23] border border-[#B5B387]/30 px-4 text-white focus:outline-none focus:border-[#FFD700] appearance-none cursor-pointer"
              style={{ fontFamily: "monospace" }}
            >
              {availableCategories.map((c) => (
                <option key={c._id} value={c.name}>
                  {c.name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleAddBeat}
          disabled={isCreating}
          className={`px-12 py-4 bg-[#FFD700] text-black font-black uppercase tracking-[3px] hover:bg-[#E4DA33] transition-all shadow-xl disabled:opacity-50 flex items-center gap-4`}
          style={{ fontFamily: "monospace" }}
        >
          {isCreating ? (
            <div className="w-4 h-4 border-2 border-black border-t-transparent animate-spin rounded-full"></div>
          ) : (
            <UploadIcon />
          )}
          {isCreating ? t('beatmaker.upload.uploading') : t('beatmaker.upload.button')}
        </button>
      </section>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder={t('beatmaker.repository.filters.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-16 bg-[#1A1A23] border border-[#B5B387]/30 px-6 text-[#F6F4D3] font-bold focus:outline-none focus:border-[#E4DA33] placeholder:text-[#B5B387]/50"
            style={{ fontFamily: "monospace" }}
          />
        </div>
        <div className="relative w-full lg:w-64" ref={genreFilterRef}>
          <button
            onClick={() => setShowGenreDropdown(!showGenreDropdown)}
            className="w-full h-16 bg-[#1A1A23] text-[#F6F4D3] font-black uppercase flex items-center justify-between px-6 border border-[#B5B387]/30 transition-all"
            style={{ fontFamily: "monospace" }}
          >
            {selectedGenre}{" "}
            <svg width="12" height="8">
              <path d="M1 1L6 6L11 1" stroke="#F6F4D3" strokeWidth="2" />
            </svg>
          </button>
          {showGenreDropdown && (
            <div className="absolute top-18 left-0 w-full bg-[#1A1A23] border border-[#B5B387]/30 z-50 shadow-2xl">
              {[
                t('beatmaker.repository.filters.all_genres'),
                ...availableGenres.map((genre) => genre.name),
              ].map((g) => (
                <div
                  key={g}
                  onClick={() => {
                    setSelectedGenre(g);
                    setShowGenreDropdown(false);
                  }}
                  className="p-4 text-[#F6F4D3] font-bold border-b border-[#B5B387]/30 hover:bg-[#2F2E24] cursor-pointer"
                  style={{ fontFamily: "monospace" }}
                >
                  {g}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-full overflow-hidden border border-[#B5B387]/30 shadow-2xl relative">
        <div className="absolute top-0 left-0 w-2 h-2 bg-[#F6F4D3] z-10" />
        <div className="absolute top-0 right-0 w-2 h-2 bg-[#F6F4D3] z-10" />
        <div className="absolute bottom-0 left-0 w-2 h-2 bg-[#F6F4D3] z-10" />
        <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#F6F4D3] z-10" />
        <div className="bg-[#4A4A3C]">
          {isBeatsLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-[#FFD700] border-t-transparent animate-spin rounded-full"></div>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[800px] overflow-y-auto hidden-scrollbar">
              <table className="w-full min-w-[800px] text-left border-collapse">
                <thead className="bg-black sticky top-0 z-10 shadow-md">
                  <tr
                    className="pixel-font text-[#FFD700] text-[10px] lg:text-[11px] tracking-widest uppercase"
                    style={{ fontWeight: 400 }}
                  >
                    <th className="px-3 lg:px-6 py-6">
                      <div className="flex items-center gap-2">
                        {t('beatmaker.repository.table.name')} <MusicIcon />
                      </div>
                    </th>
                    <th className="px-3 lg:px-6 py-6">{t('beatmaker.repository.table.genre_category')}</th>
                    <th className="px-3 lg:px-6 py-6">{t('beatmaker.repository.table.plays')}</th>
                    <th className="px-3 lg:px-6 py-6">{t('beatmaker.repository.table.downloads')}</th>
                    <th className="px-3 lg:px-6 py-6">{t('beatmaker.repository.table.donations')}</th>
                    <th className="px-3 lg:px-6 py-6 shadow-[inset_0_-2px_0_black]">
                      {t('beatmaker.repository.table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBeats.length > 0 ? (
                    paginatedBeats.map((b) => (
                      <BeatRow
                        key={b.id}
                        beat={b}
                        isPlaying={b.id === currentlyPlayingId}
                        currentTime={currentTime}
                        duration={duration}
                        formatTime={formatTime}
                        handlePlayToggle={handlePlayToggle}
                        handleOpenEditModal={handleOpenEditModal}
                        handleDeleteBeat={handleDeleteBeat}
                      />
                    ))
                  ) : (
                    <tr className="h-48 text-center text-[#D4D4B0] font-bold">
                      <td colSpan="6">{t('beatmaker.repository.table.no_tracks')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="bg-[#191A22] border-t-2 border-[#D4D4B0] p-4 flex items-center justify-between px-6">
            <div className="text-[#D4D4B0] text-sm font-bold tracking-widest uppercase">
              {t('beatmaker.repository.table.showing', {
                start: (currentPage - 1) * rowsPerPage + 1,
                end: Math.min(currentPage * rowsPerPage, filteredBeats.length),
                total: filteredBeats.length
              })}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center bg-[#4A4A3C] text-[#FFD700] border border-[#D4D4B0] disabled:opacity-50 hover:bg-[#525244] transition-colors"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <div className="w-10 h-10 flex items-center justify-center bg-[#FFD700] text-black font-black text-sm">
                {currentPage}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center bg-[#4A4A3C] text-[#FFD700] border border-[#D4D4B0] disabled:opacity-50 hover:bg-[#525244] transition-colors"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-[#2F2E24] border border-[#B5B387]/30 p-6 flex flex-col items-center justify-center relative"
          >
            <div className="absolute top-0 left-0 w-2 h-2 bg-[#F6F4D3]" />
            <div className="absolute top-0 right-0 w-2 h-2 bg-[#F6F4D3]" />
            <div className="absolute bottom-0 left-0 w-2 h-2 bg-[#F6F4D3]" />
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#F6F4D3]" />
            <div
              className="text-[#FFD700] text-2xl lg:text-3xl font-black mb-1"
              style={{ fontFamily: "monospace" }}
            >
              {s.value}
            </div>
            <div
              className="text-[#B5B387] text-[10px] lg:text-xs font-bold uppercase tracking-widest"
              style={{ fontFamily: "monospace" }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <Modal
        opened={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        withCloseButton={false}
        padding={0}
        size="lg"
        centered
        overlayProps={{ color: "black", opacity: 0.85, blur: 2 }}
        styles={{
          content: { backgroundColor: "transparent", boxShadow: "none", border: "none", overflow: "visible" },
          body: { padding: 0 },
        }}
      >
        <div className="w-full bg-[#131319] border border-[#CBC895]/40 shadow-2xl overflow-visible relative alexandria-font">
          {/* corner accents */}
          <div className="absolute top-0 left-0 w-2 h-2 bg-[#CBC895]" />
          <div className="absolute top-0 right-0 w-2 h-2 bg-[#CBC895]" />
          <div className="absolute bottom-0 left-0 w-2 h-2 bg-[#CBC895]" />
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#CBC895]" />

          {/* header */}
          <div className="bg-[#CBC895] px-5 py-3 flex justify-between items-center">
            <span className="pixel-font text-[#191A22] text-[10px] tracking-widest uppercase">
              {t('beatmaker.edit_modal.title')}
            </span>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="w-7 h-7 flex items-center justify-center bg-[#191A22] hover:bg-[#2a2a35] transition-colors"
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#CBC895" strokeWidth="2" strokeLinecap="round">
                <path d="M10 2L2 10M2 2l8 8" />
              </svg>
            </button>
          </div>

          {/* body */}
          <div className="p-6 space-y-5">
            {/* Beat name */}
            <div className="space-y-1.5">
              <label className="block text-[9px] pixel-font uppercase text-[#CBC895]/80 tracking-widest">
                {t('beatmaker.upload.name_label')}
              </label>
              <input
                type="text"
                name="name"
                value={editBeatForm.name}
                onChange={handleEditInputChange}
                placeholder="Midnight Vibes"
                className="w-full h-11 bg-[#1E1E2A] border border-[#CBC895]/25 px-4 text-[#F6F4D3] font-bold focus:outline-none focus:border-[#CBC895]/70 transition-colors text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <GenreMultiSelect
                genres={availableGenres}
                value={editBeatForm.genre}
                onChange={(genre) => setEditBeatForm((prev) => ({ ...prev, genre }))}
                label={t('beatmaker.upload.genre_label')}
                labelClassName="text-[9px] pixel-font uppercase text-[#CBC895]/80 tracking-widest"
              />

              <div className="space-y-1.5">
                <label className="block text-[9px] pixel-font uppercase text-[#CBC895]/80 tracking-widest">
                  {t('beatmaker.upload.category_label')}
                </label>
                <div className="relative">
                  <select
                    name="category"
                    value={editBeatForm.category}
                    onChange={handleEditInputChange}
                    className="w-full h-11 bg-[#1E1E2A] border border-[#CBC895]/25 px-4 text-[#F6F4D3] focus:outline-none focus:border-[#CBC895]/70 appearance-none cursor-pointer text-sm font-bold"
                  >
                    {availableCategories.map((c) => (
                      <option key={c._id} value={c.name} className="bg-[#1E1E2A]">
                        {c.name.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="10" height="6" viewBox="0 0 10 6"><path d="M1 1L5 5L9 1" stroke="#CBC895" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Replace audio file */}
            <div className="space-y-1.5">
              <label className="block text-[9px] pixel-font uppercase text-[#CBC895]/80 tracking-widest">
                {t('beatmaker.edit_modal.replace_file')}
              </label>
              <label className="flex items-center gap-3 cursor-pointer bg-[#1E1E2A] border border-[#CBC895]/25 px-4 py-3 hover:border-[#CBC895]/60 transition-colors group">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#CBC895" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                <span className="text-xs text-[#B5B387] font-bold truncate group-hover:text-[#F6F4D3] transition-colors">
                  {editBeatForm.beat ? editBeatForm.beat.name : t('beatmaker.edit_modal.choose_file')}
                </span>
                <input
                  type="file"
                  accept=".mp3,.wav"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) setEditBeatForm(prev => ({ ...prev, beat: file }));
                  }}
                />
              </label>
              {editBeatForm.beat && (
                <button
                  type="button"
                  onClick={() => setEditBeatForm(prev => ({ ...prev, beat: null }))}
                  className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase tracking-widest"
                >
                  ✕ Remove
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-[#CBC895]/15 flex justify-end gap-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-5 py-2 bg-transparent border border-[#CBC895]/40 text-[#CBC895]/70 font-bold uppercase tracking-widest hover:border-[#CBC895]/80 hover:text-[#CBC895] transition-colors text-[10px]"
              >
                {t('beatmaker.edit_modal.cancel')}
              </button>
              <button
                onClick={handleEditBeat}
                disabled={isCreating}
                className="px-5 py-2 bg-[#CBC895] text-[#191A22] font-black uppercase tracking-widest hover:bg-[#B5B387] transition-colors disabled:opacity-50 flex items-center gap-2 text-[10px]"
              >
                {isCreating ? (
                  <div className="w-3 h-3 border-2 border-[#191A22] border-t-transparent animate-spin rounded-full" />
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
                {isCreating ? t('beatmaker.edit_modal.updating') : t('beatmaker.edit_modal.save')}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Category / Genre Management (#21) */}
      <div className="bg-[#2F2E24] border border-[#B5B387]/30 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-2 h-2 bg-[#F6F4D3]" />
        <div className="absolute top-0 right-0 w-2 h-2 bg-[#F6F4D3]" />
        <div className="absolute bottom-0 left-0 w-2 h-2 bg-[#F6F4D3]" />
        <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#F6F4D3]" />
        <div className="bg-black px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          <span className="text-[#FFD700] font-black uppercase tracking-widest text-sm pixel-font">
            Genre / Category Management
          </span>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex bg-[#1A1A23] border border-[#B5B387]/30 overflow-hidden">
              <button
                onClick={() => { setCatActiveType("genre"); setIsAddingCat(false); setEditingCat(null); setNewCat({ name: "" }); }}
                className={`px-4 py-1.5 text-xs font-bold uppercase transition-colors ${catActiveType === "genre" ? "bg-[#FFD700] text-black" : "text-[#D4D4B0]"}`}
              >
                Genres
              </button>
              <button
                onClick={() => { setCatActiveType("category"); setIsAddingCat(false); setEditingCat(null); setNewCat({ name: "" }); }}
                className={`px-4 py-1.5 text-xs font-bold uppercase transition-colors ${catActiveType === "category" ? "bg-[#FFD700] text-black" : "text-[#D4D4B0]"}`}
              >
                Categories
              </button>
            </div>
            <button
              onClick={() => { setEditingCat(null); setNewCat({ name: "" }); setIsAddingCat(true); }}
              className="px-4 py-1.5 bg-[#FFD700] text-black font-black uppercase text-xs hover:bg-[#E4DA33] transition-colors"
            >
              + Add {catActiveType === "genre" ? "Genre" : "Category"}
            </button>
          </div>
        </div>

        {isAddingCat && (
          <form onSubmit={handleSaveCat} className="flex gap-3 items-end bg-[#191A22] border-b border-[#D4D4B0] px-6 py-4">
            <div className="flex-1">
              <label className="block text-[10px] font-bold uppercase text-[#D4D4B0] mb-1">Name</label>
              <input
                type="text"
                value={newCat.name}
                onChange={e => setNewCat({ name: e.target.value })}
                placeholder={catActiveType === "genre" ? "e.g. Trap" : "e.g. Saphire"}
                className="w-full h-10 bg-[#4A4A3C] border border-[#D4D4B0] px-3 text-white focus:outline-none focus:border-[#FFD700] font-bold"
                style={{ fontFamily: "monospace" }}
                autoFocus
              />
            </div>
            <button type="submit" className="px-5 py-2 bg-[#FFD700] text-black font-black uppercase text-xs hover:bg-[#E4DA33] h-10">
              {editingCat ? "Update" : "Save"}
            </button>
            <button type="button" onClick={() => { setIsAddingCat(false); setEditingCat(null); setNewCat({ name: "" }); }} className="px-5 py-2 bg-red-700 text-white font-black uppercase text-xs hover:bg-red-600 h-10">
              Cancel
            </button>
          </form>
        )}

        <div>
          {(catActiveType === "genre" ? availableGenres : availableCategories).length === 0 ? (
            <div className="px-6 py-8 text-center text-[#D4D4B0] text-sm font-bold">
              No {catActiveType}s found. Add one above.
            </div>
          ) : (
            (catActiveType === "genre" ? availableGenres : availableCategories).map((item) => (
              <div key={item._id} className="flex items-center justify-between px-6 py-3 border-b border-[#B5B387]/20 hover:bg-[#1A1A23] transition-colors">
                <div>
                  <span className="text-white font-bold text-sm" style={{ fontFamily: "monospace" }}>{item.name}</span>
                  <span className="ml-3 text-[10px] text-[#D4D4B0] uppercase opacity-60">{item.type}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditCat(item)}
                    className="w-8 h-8 bg-[#4A4A3C] border border-[#D4D4B0] hover:bg-[#D4D1A0] hover:text-black text-[#D4D4B0] flex items-center justify-center transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCatDeleteConfirm({ isOpen: true, id: item._id })}
                    className="w-8 h-8 bg-red-800 hover:bg-red-600 flex items-center justify-center transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="white" stroke="white" strokeWidth="2">
                      <path d="M12 4L4 12M4 4L12 12" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title={t('beatmaker.delete_modal.title')}
        message={t('beatmaker.delete_modal.message')}
        onConfirm={confirmDeleteBeat}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null })}
      />

      <ConfirmModal
        isOpen={catDeleteConfirm.isOpen}
        title={`Delete ${catActiveType}`}
        message={`Are you sure you want to delete this ${catActiveType}? Beats using it will not be affected.`}
        onConfirm={confirmDeleteCat}
        onCancel={() => setCatDeleteConfirm({ isOpen: false, id: null })}
      />
    </div>
  );
};

export default Beat;
