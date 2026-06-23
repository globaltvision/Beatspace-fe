import React, { useState, useRef, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getComics,
  createComic,
  updateComic,
  deleteComic,
  getAdminComics,
} from "../../store/actions/adminActions";
import { toast } from "sonner";
import ConfirmModal from "../../components/ConfirmModal";
import { useTranslation } from "react-i18next";
import {
  Tabs,
  Box,
  Text,
  Image,
  Button,
  Modal,
  Group,
  ActionIcon,
  Badge,
  Tooltip,
  TextInput,
} from "@mantine/core";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconPhoto,
  IconSettings,
  IconTrash,
  IconPlus,
  IconArrowLeft,
  IconArrowRight,
  IconStar,
  IconStarFilled,
  IconDragDrop,
  IconX,
} from "@tabler/icons-react";

// Constants for consistent styling
const COLORS = {
  primary: "#CBC895",
  primaryHover: "#B8B482",
  secondary: "#C0BC75",
  background: "#040404",
  text: "#F6F4D3",
  textSecondary: "#E0BC5A",
  textAccent: "#5ACFB5",
  danger: "#EB181B",
  dangerHover: "#D41519",
  dark: "#191A22",
  overlay: "rgba(16,15,0,0.62)",
  modalBg: "#242730",
  modalBorder: "#C1BE91",
};

// --- Sortable Item Component ---
const SortablePage = ({ page, index, onSetThumbnail, onRemove, onPreview }) => {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      className="relative group aspect-[3/4] bg-[#191A22] border border-[#C1BE91]/30 rounded-none overflow-hidden flex flex-col"
    >
      {/* Page Image */}
      <Box
        className="flex-1 cursor-pointer overflow-hidden"
        onClick={() => onPreview(index)}
      >
        <Image
          src={page.url}
          alt={`Page ${index + 1}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          fit="cover"
        />
        <Badge
          className="absolute top-2 left-2 z-10"
          color="dark"
          variant="filled"
          styles={{
            root: {
              backgroundColor: "rgba(0,0,0,0.7)",
              border: "1px solid #CBC895",
            },
          }}
        >
          #{index + 1}
        </Badge>

        {page.isThumbnail && (
          <Badge
            className="absolute top-2 right-2 z-10"
            color="yellow"
            variant="filled"
            leftSection={<IconStarFilled size={12} />}
          >
            {t('comics.cover')}
          </Badge>
        )}
      </Box>

      {/* Controls Overlay */}
      <Box className="alexandria-font absolute bottom-0 left-0 right-0 bg-black/70 p-1 flex justify-around opacity-0 group-hover:opacity-100 transition-opacity">
        <Tooltip label={t('comics.drag_reorder')} className="alexandria-font">
          <ActionIcon
            size="sm"
            variant="transparent"
            {...attributes}
            {...listeners}
            className="cursor-grab"
          >
            <IconDragDrop size={16} color="#CBC895" />
          </ActionIcon>
        </Tooltip>

        <Tooltip
          label={page.isThumbnail ? t('comics.current_thumbnail') : t('comics.set_thumbnail')}
          className="alexandria-font"
        >
          <ActionIcon
            size="sm"
            variant="transparent"
            onClick={() => onSetThumbnail(page.id)}
            disabled={page.isThumbnail}
          >
            {page.isThumbnail ? (
              <IconStarFilled size={16} color="#E0BC5A" />
            ) : (
              <IconStar size={16} color="#CBC895" />
            )}
          </ActionIcon>
        </Tooltip>

        <Tooltip label={t('comics.delete_page')} className="alexandria-font">
          <ActionIcon
            size="sm"
            variant="transparent"
            onClick={() => onRemove(page.id)}
          >
            <IconTrash size={16} color="#EB181B" />
          </ActionIcon>
        </Tooltip>
      </Box>
    </Box>
  );
};

// --- Page Preview Modal Component (FIXED - Proper z-index and layering) ---
const PagePreviewModal = ({
  isOpen,
  onClose,
  pages,
  currentIndex,
  onNavigate,
}) => {
  const { t } = useTranslation();
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === "ArrowRight") onNavigate((currentIndex + 1) % pages.length);
      if (e.key === "ArrowLeft")
        onNavigate((currentIndex - 1 + pages.length) % pages.length);
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, pages.length, onNavigate, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !pages[currentIndex]) return null;

  return (
    <Box
      className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 select-none"
      onClick={onClose}
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <ActionIcon
        className="absolute top-6 right-6 z-[10000]"
        size="xl"
        variant="transparent"
        onClick={onClose}
      >
        <Text color="white" size="xl">
          ✕
        </Text>
      </ActionIcon>

      <Box
        className="relative max-w-full max-h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Navigation Arrows */}
        <ActionIcon
          className="absolute left-[-60px] top-1/2 -translate-y-1/2 hidden md:flex z-[10000]"
          size={50}
          variant="transparent"
          onClick={() =>
            onNavigate((currentIndex - 1 + pages.length) % pages.length)
          }
        >
          <IconArrowLeft size={40} color="white" />
        </ActionIcon>

        <Image
          src={pages[currentIndex].url}
          alt={`Page ${currentIndex + 1}`}
          className="max-h-[85vh] w-auto shadow-2xl rounded-sm"
          fit="contain"
        />

        <ActionIcon
          className="absolute right-[-60px] top-1/2 -translate-y-1/2 hidden md:flex z-[10000]"
          size={50}
          variant="transparent"
          onClick={() => onNavigate((currentIndex + 1) % pages.length)}
        >
          <IconArrowRight size={40} color="white" />
        </ActionIcon>
      </Box>

      {/* Info Bar */}
      <Box className="alexandria-font absolute bottom-6 left-0 right-0 text-center z-[10000]">
        <Text color="white" size="lg" className="font-bold">
          {t('comics.page_info', { current: currentIndex + 1, total: pages.length })}
        </Text>
        <Text color="dimmed" size="xs">
          {t('comics.navigation_hint')}
        </Text>
      </Box>
    </Box>
  );
};

// --- Comic Card Component ---
const ComicCard = ({ comic, onEdit, onDelete }) => {
  const { t } = useTranslation();
  return (
    <article className="w-full flex flex-col bg-[#C0BC75] border border-[#C0BC75] rounded-none overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      {/* Cover Image Container */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-900">
        <img
          src={comic.thumbnailUrl || comic.image}
          alt={`${comic.title} cover`}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Content Container */}
      <div className="flex-1 bg-[#040404] p-4 flex flex-col">
        {/* Header */}
        <header className="mb-4">
          <Tooltip label={comic.title}>
            <h2 className="text-2xl font-bold leading-tight tracking-tight text-white mb-2 truncate">
              {comic.title}
            </h2>
          </Tooltip>
          <p className="text-[#E0BC5A] text-sm font-normal">
            by {comic.author_name}
          </p>
        </header>

        {/* Divider */}
        <div className="w-full h-px bg-[#C0BC75] mb-4 opacity-30" />

        {/* Comic Info */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-[#E0BC5A] text-xs font-normal opacity-80 uppercase tracking-wider">
              {t('comics.chapters')}
            </span>
            <span className="text-[#F6F4D3] text-sm font-bold">
              {comic.chapter_info?.length || 0}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#E0BC5A] text-xs font-normal opacity-80 uppercase tracking-wider">
              Status
            </span>
            <Badge
              color={comic.status === "active" ? "green" : "gray"}
              size="sm"
              variant="outline"
              styles={{
                root: { textTransform: "uppercase", letterSpacing: "2px" },
              }}
            >
              {comic.status}
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          <EditButton onClick={() => onEdit(comic)} />
          <DeleteButton onClick={() => onDelete(comic)} />
        </div>
      </div>
    </article>
  );
};

// --- Action Buttons ---
const EditButton = ({ onClick }) => {
  const { t } = useTranslation();
  return (
  <button
    onClick={onClick}
    className="flex items-center justify-center gap-2 px-3 py-2 min-w-[100px] h-10 rounded-none bg-[#CBC895] shadow-[0_4px_1px_0_#000] hover:bg-[#B8B482] transition-all"
  >
    <IconSettings size={20} color="#191A22" />
    <span className="text-[#191A22] text-sm font-bold uppercase">{t('comics.edit')}</span>
  </button>
  );
};

const DeleteButton = ({ onClick }) => {
  const { t } = useTranslation();
  return (
  <button
    onClick={onClick}
    className="alexandria-font flex justify-center items-center gap-2 px-3 py-2 min-w-[100px] h-10 shadow-[0_4px_1px_0_#000] bg-[#EB181B] rounded-md hover:bg-[#D41519] transition-all"
  >
    <IconTrash size={20} color="white" />
    <span className="text-white text-sm font-bold uppercase">{t('comics.delete')}</span>
  </button>
  );
};

const ChapterTabs = ({
  chapters,
  activeChapterIndex,
  onTabClick,
  onAddChapter,
  onDeleteChapter,
  onChapterTitleChange,
  disabled,
}) => {
  const { t } = useTranslation();

  return (
    <Box className="flex items-center border-b border-[#cbc89533] mb-4">
      {/* Scrollable container for tabs */}
      <div className="flex-grow flex items-center overflow-x-auto">
        {chapters.map((chapter, index) => (
          <div
            key={chapter.id || `chapter-${index}`}
            className={`flex items-center justify-center h-12 px-4 cursor-pointer relative group transition-all duration-200
              ${
                activeChapterIndex === index
                  ? "bg-[#CBC895] text-[#191A22]"
                  : "bg-transparent text-[#F6F4D3] hover:bg-[#191a22]"
              }`}
            onClick={() => onTabClick(index)}
          >
            <TextInput
              value={chapter.chapter_title}
              onChange={(event) =>
                onChapterTitleChange(index, event.currentTarget.value)
              }
              disabled={disabled}
              variant="unstyled"
              className="w-24"
              styles={{
                input: {
                  color: activeChapterIndex === index ? "#191A22" : "#F6F4D3",
                  textAlign: "center",
                  fontWeight: "bold",
                  cursor: disabled ? "not-allowed" : "text",
                },
              }}
            />
            {chapters.length > 1 && (
              <Tooltip label={t("comics.delete_chapter")} withArrow>
                <ActionIcon
                  size="xs"
                  variant="transparent"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChapter(index);
                  }}
                  disabled={disabled}
                  className="ml-2"
                >
                  <IconX
                    size={14}
                    color={
                      activeChapterIndex === index ? "#191A22" : "#F6F4D3"
                    }
                  />
                </ActionIcon>
              </Tooltip>
            )}
          </div>
        ))}
      </div>

      {/* Add Chapter Button */}
      <Tooltip label={t("comics.add_chapter")} withArrow>
        <ActionIcon
          onClick={onAddChapter}
          size="lg"
          variant="transparent"
          disabled={disabled}
          className="mx-2"
        >
          <IconPlus size={20} color="#CBC895" />
        </ActionIcon>
      </Tooltip>
    </Box>
  );
};

// --- Main Modal Component (FIXED - Pages now load correctly when editing) ---
const ComicDetailsModal = ({ isOpen, onClose, editingComic, onSave }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    author_name: "",
    title: "",
    description: "",
    status: "draft",
  });

  const [coverFile, setCoverFile] = useState(null);
  const [coverUrl, setCoverUrl] = useState("");

  // Chapters state: Array of { id, chapter_title, pages: [{ id, url, file, isThumbnail, order, isNew }] }
  const [chapters, setChapters] = useState([
    {
      id: `chap-${Date.now()}-0`,
      chapter_title: "Chapter 1",
      pages: []
    }
  ]);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const [confirmProps, setConfirmProps] = useState({ isOpen: false, title: "", message: "", onConfirm: () => {} });
  const [isSubmitting, setIsSubmitting] = useState(null); // 'draft' | 'published' | 'save' | null

  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Load editing comic or initialize
  useEffect(() => {
    if (isOpen && editingComic) {
      setFormData({
        author_name: editingComic.author_name || "",
        title: editingComic.title || "",
        description: editingComic.description || "",
        status: editingComic.status || "draft",
      });

      // Set cover image from comic data
      const coverImage = editingComic.thumbnailUrl || editingComic.image || "";
      setCoverUrl(coverImage);
      setCoverFile(null);

      // Load chapters
      const existingChapters = editingComic.chapter_info || [];
      const mappedChapters = existingChapters.map((chap, chapIdx) => {
        const existingPages = chap.pages || [];
        let mappedPages = [];
        if (existingPages.length > 0) {
          mappedPages = existingPages.map((p, idx) => ({
            id: p._id || `existing-${chapIdx}-${idx}-${Date.now()}`,
            url: p.url,
            isThumbnail: p.isThumbnail || false,
            order: p.order || idx + 1,
            isNew: false,
          }));
        } else if (chap.images?.length > 0) {
          mappedPages = chap.images.map((url, idx) => ({
            id: `legacy-${chapIdx}-${idx}-${Date.now()}`,
            url: url,
            isThumbnail: idx === 0,
            order: idx + 1,
            isNew: false,
          }));
        }
        return {
          id: chap._id || `chap-existing-${chapIdx}-${Date.now()}`,
          chapter_title: chap.chapter_title || `Chapter ${chapIdx + 1}`,
          pages: mappedPages
        };
      });

      if (mappedChapters.length === 0) {
        mappedChapters.push({
          id: `chap-new-${Date.now()}`,
          chapter_title: "Chapter 1",
          pages: []
        });
      }
      setChapters(mappedChapters);
      setActiveChapterIndex(0);
    }
    // We deliberately do NOT reset the state when !editingComic and reopening,
    // to preserve unsaved changes if they close the modal.
  }, [editingComic, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setChapters((prevChapters) =>
      prevChapters.map((chap, idx) => {
        if (idx !== activeChapterIndex) return chap;

        const newPages = files.map((file, index) => ({
          id: `new-${Date.now()}-${index}-${Math.random()}`,
          url: URL.createObjectURL(file),
          file: file,
          isThumbnail: false,
          order: chap.pages.length + index + 1,
          isNew: true,
        }));

        return {
          ...chap,
          pages: [...chap.pages, ...newPages]
        };
      })
    );
    e.target.value = "";
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (typeof coverUrl === "string" && coverUrl.startsWith("blob:")) {
        URL.revokeObjectURL(coverUrl);
      }
      setCoverFile(file);
      setCoverUrl(URL.createObjectURL(file));
    }
  };

  const handleRemovePage = (id) => {
    setChapters((prevChapters) =>
      prevChapters.map((chap, idx) => {
        if (idx !== activeChapterIndex) return chap;

        const pageToRemove = chap.pages.find((p) => p.id === id);
        if (
          pageToRemove?.isNew &&
          typeof pageToRemove.url === "string" &&
          pageToRemove.url.startsWith("blob:")
        ) {
          URL.revokeObjectURL(pageToRemove.url);
        }

        const filteredPages = chap.pages.filter((p) => p.id !== id);
        return {
          ...chap,
          pages: filteredPages.map((p, index) => ({ ...p, order: index + 1 }))
        };
      })
    );
  };

  const handleSetThumbnail = (id) => {
    setChapters((prevChapters) =>
      prevChapters.map((chap, idx) => {
        if (idx !== activeChapterIndex) return chap;

        return {
          ...chap,
          pages: chap.pages.map((p) => ({
            ...p,
            isThumbnail: p.id === id,
          }))
        };
      })
    );
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setChapters((prevChapters) =>
        prevChapters.map((chap, idx) => {
          if (idx !== activeChapterIndex) return chap;

          const oldIndex = chap.pages.findIndex((i) => i.id === active.id);
          const newIndex = chap.pages.findIndex((i) => i.id === over.id);
          const reordered = arrayMove(chap.pages, oldIndex, newIndex);
          return {
            ...chap,
            pages: reordered.map((p, index) => ({ ...p, order: index + 1 }))
          };
        })
      );
    }
  };

  const handleAddChapter = () => {
    const nextNum = chapters.length + 1;
    const newChapter = {
      id: `chap-${Date.now()}-${chapters.length}-${Math.random()}`,
      chapter_title: `Chapter ${nextNum}`,
      pages: []
    };
    setChapters([...chapters, newChapter]);
    setActiveChapterIndex(chapters.length);
  };

  const handleDeleteChapter = (indexToDelete) => {
    if (chapters.length === 1) return;
    setConfirmProps({
      isOpen: true,
      title: "DELETE CHAPTER",
      message: "Are you sure you want to delete this chapter? All pages and data in this chapter will be lost.",
      onConfirm: () => {
        const targetChapter = chapters[indexToDelete];
        targetChapter?.pages?.forEach(p => {
          if (p.isNew && typeof p.url === "string" && p.url.startsWith("blob:")) {
            URL.revokeObjectURL(p.url);
          }
        });
        const updated = chapters.filter((_, idx) => idx !== indexToDelete);
        setChapters(updated);
        if (activeChapterIndex >= updated.length) {
          setActiveChapterIndex(updated.length - 1);
        }
      }
    });
  };

  const handleResetForm = () => {
    setConfirmProps({
      isOpen: true,
      title: "CLEAR FORM",
      message: "Are you sure you want to clear all entered form data? This will reset all fields and uploaded pages.",
      onConfirm: () => {
        // Cleanup blob URLs
        chapters.forEach(chap => {
          chap.pages.forEach(p => {
            if (p.isNew && typeof p.url === "string" && p.url.startsWith("blob:")) {
              URL.revokeObjectURL(p.url);
            }
          });
        });
        if (typeof coverUrl === "string" && coverUrl.startsWith("blob:")) {
          URL.revokeObjectURL(coverUrl);
        }

        setFormData({
          author_name: "",
          title: "",
          description: "",
          status: "draft",
        });
        setChapters([
          {
            id: `chap-${Date.now()}-0`,
            chapter_title: "Chapter 1",
            pages: []
          }
        ]);
        setActiveChapterIndex(0);
        setCoverFile(null);
        setCoverUrl("");
      }
    });
  };

  const handleCleanupAfterSave = () => {
    setFormData({
      author_name: "",
      title: "",
      description: "",
      status: "draft",
    });
    setChapters([
      {
        id: `chap-${Date.now()}-0`,
        chapter_title: "Chapter 1",
        pages: []
      }
    ]);
    setActiveChapterIndex(0);
    setCoverFile(null);
    setCoverUrl("");
  };

  const handleModalClose = () => {
    // Keep form states intact on close to allow resuming later
    onClose();
  };

  const handleSubmit = async (submitStatus) => {
    if (!formData.title.trim()) {
      toast.error("Comic Title is required");
      return;
    }

    if (submitStatus === "published" || submitStatus === "active") {
      if (!formData.author_name.trim()) {
        toast.error("Author Name is required for publishing");
        return;
      }
      if (chapters.length === 0) {
        toast.error("At least one chapter is required to publish");
        return;
      }
      const emptyChapter = chapters.find(c => c.pages.length === 0);
      if (emptyChapter) {
        toast.error(`Chapter "${emptyChapter.chapter_title}" has no pages. Please upload at least one page or delete the empty chapter.`);
        return;
      }
    }

    const isAlreadyPublished = editingComic && (editingComic.status === "published" || editingComic.status === "active");
    const submitType = isAlreadyPublished ? "save" : (submitStatus === "published" ? "published" : "draft");
    setIsSubmitting(submitType);
    try {
      const data = new FormData();
      data.append("author_name", formData.author_name);
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("status", submitStatus);

      // Prepare chapters payload
      const chaptersPayload = chapters.map((chap, chapIdx) => {
        const chapterPages = chap.pages.map((p, idx) => ({
          order: p.order || idx + 1,
          isThumbnail: p.isThumbnail || false,
          ...(p.isNew ? {} : { url: p.url }),
        }));

        return {
          chapter_title: chap.chapter_title,
          chapter_number: chapIdx + 1,
          pages: chapterPages,
          images: chap.pages.filter((p) => !p.isNew).map((p) => p.url),
        };
      });

      data.append("chapter_info", JSON.stringify(chaptersPayload));

      // Append new image files sequentially across all chapters
      chapters.forEach((chap) => {
        chap.pages.forEach((p) => {
          if (p.isNew && p.file) {
            data.append("gallery", p.file);
          }
        });
      });

      if (coverFile) {
        data.append("image", coverFile);
      }

      const success = await onSave(data);
      if (success) {
        handleCleanupAfterSave();
      }
    } catch (error) {
      console.error(error);
      toast.error(t('comics.messages.save_failed'));
    } finally {
      setIsSubmitting(null);
    }
  };

  const activeChapter = chapters[activeChapterIndex] || { id: "temp", chapter_title: "", pages: [] };

  if (!isOpen) return null;

  return (
    <>
      <Modal
        opened={isOpen}
        onClose={handleModalClose}
        size="90%"
        padding="xl"
        centered
        className="alexandria-font"
        classNames={{
          content: "custom-scrollbar",
        }}
        title={
          <Text size="xl" weight={800} className="tracking-widest uppercase">
            {editingComic ? t('comics.modals.edit_title') : t('comics.modals.add_title')}
          </Text>
        }
        styles={{
          header: {
            backgroundColor: "#242730",
            color: "#F6F4D3",
            borderBottom: "1px solid #C1BE91",
            padding: "20px",
          },
          content: {
            backgroundColor: "#242730",
            border: "2px solid #C1BE91",
            borderRadius: "12px",
            maxHeight: "92vh",
            overflowY: "auto",
          },
          close: { color: "#F6F4D3" },
          body: {
            padding: "20px",
          },
        }}
        overlayProps={{ color: "#000", opacity: 0.85, blur: 3 }}
      >
        {/* Chapter Tabs Section */}
        <Box className="flex items-center flex-wrap gap-2 mb-6 pb-4 border-b border-white/10 select-none">
          {chapters.map((chap, idx) => (
            <div
              key={chap.id}
              onClick={() => setActiveChapterIndex(idx)}
              className={`alexandria-font uppercase flex items-center gap-3 px-4 h-10 cursor-pointer border transition-all duration-200 hover:scale-[1.02] shadow-sm ${
                activeChapterIndex === idx
                  ? "bg-[#CBC895] text-[#191A22] border-[#CBC895]"
                  : "bg-transparent text-[#F6F4D3] border-[#CBC895]/40 hover:border-[#CBC895]"
              }`}
              style={{
                fontWeight: 700,
              }}
            >
              <span>{chap.chapter_title || `Chapter ${idx + 1}`}</span>
              {chapters.length > 1 && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChapter(idx);
                  }}
                  className="hover:bg-black/10 text-[#EB181B] hover:text-[#D41519] rounded-full w-4 h-4 flex items-center justify-center text-[10px] ml-1 transition-colors p-0.5"
                  title="Delete chapter"
                >
                  ✕
                </span>
              )}
            </div>
          ))}
          <Button
            onClick={handleAddChapter}
            variant="subtle"
            color="yellow"
            leftSection={<IconPlus size={16} />}
            className="alexandria-font font-bold uppercase h-10"
            styles={{ root: { color: "#CBC895" } }}
          >
            Add New Chapter
          </Button>
        </Box>

        {/* 2-Column Responsive Workspace */}
        <Box className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Cover Upload, Chapter Pages Upload & Grid */}
          <Box className="lg:col-span-5 space-y-6">
            
            {/* Comic Cover Upload (Comic level metadata) */}
            <Box className="p-4 bg-[#191A22] border border-dashed border-[#C1BE91]/40 rounded-sm space-y-3">
              <Text color="#F6F4D3" size="sm" className="font-bold uppercase tracking-wider">
                {t('comics.form.cover_label')}
              </Text>
              <Group align="flex-start" className="flex-nowrap">
                {coverUrl ? (
                  <Box className="relative group w-[100px] h-[140px] flex-shrink-0">
                    <Image
                      src={coverUrl}
                      w={100}
                      h={140}
                      fit="cover"
                      radius="none"
                      className="border border-[#C1BE91]/30"
                    />
                    <Box className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ActionIcon
                        color="red"
                        onClick={() => {
                          setCoverFile(null);
                          setCoverUrl("");
                        }}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    onClick={() => coverInputRef.current?.click()}
                    className="w-[100px] h-[140px] border border-dashed border-white/20 hover:border-[#CBC895] transition-colors flex flex-col items-center justify-center cursor-pointer bg-[#040404] flex-shrink-0"
                  >
                    <IconPlus size={24} color="#CBC895" />
                    <Text size="xs" color="dimmed" mt={5}>Cover</Text>
                  </Box>
                )}
                <Box className="flex-1 space-y-2">
                  <Text size="xs" color="dimmed">
                    Upload a cover image representing this comic. JPG, PNG, GIF.
                  </Text>
                  <Button
                    variant="light"
                    color="yellow"
                    size="xs"
                    onClick={() => coverInputRef.current?.click()}
                    leftSection={<IconPlus size={14} />}
                    className="font-bold uppercase"
                    styles={{ root: { backgroundColor: "rgba(203, 200, 149, 0.1)", color: "#CBC895" } }}
                  >
                    {coverUrl ? t('comics.form.change_cover') : t('comics.form.upload_cover')}
                  </Button>
                  <input
                    ref={coverInputRef}
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleCoverUpload}
                  />
                </Box>
              </Group>
            </Box>

            {/* Chapter Pages Upload & Reordering (Chapter level data) */}
            <Box className="space-y-4">
              <Group justify="space-between" className="border-b border-white/10 pb-2">
                <Box>
                  <Text color="#F6F4D3" size="sm" className="font-bold uppercase tracking-wider">
                    {t('comics.form.upload_pages')}
                  </Text>
                  <Text size="xs" color="dimmed">
                    Current pages: {activeChapter.pages?.length || 0}
                  </Text>
                </Box>
                <Button
                  size="xs"
                  color="yellow"
                  onClick={() => fileInputRef.current?.click()}
                  leftSection={<IconPlus size={16} />}
                  className="font-bold uppercase"
                  styles={{ root: { backgroundColor: "#CBC895", color: "#191A22" } }}
                >
                  {t('comics.form.upload_pages')}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  hidden
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </Group>

              {/* Pages Grid with Drag & Drop */}
              <Box className="bg-[#191A22] p-4 rounded-none min-h-[300px] max-h-[500px] overflow-y-auto custom-scrollbar border border-white/5">
                {activeChapter.pages && activeChapter.pages.length > 0 ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={activeChapter.pages.map((p) => p.id)}
                      strategy={rectSortingStrategy}
                    >
                      <Box className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {activeChapter.pages.map((page, index) => (
                          <SortablePage
                            key={page.id}
                            page={page}
                            index={index}
                            onSetThumbnail={handleSetThumbnail}
                            onRemove={handleRemovePage}
                            onPreview={(idx) => {
                              setPreviewIndex(idx);
                              setIsPreviewOpen(true);
                            }}
                          />
                        ))}
                      </Box>
                    </SortableContext>
                  </DndContext>
                ) : (
                  <Box className="flex flex-col items-center justify-center h-[250px] opacity-40 text-center alexandria-font">
                    <IconPhoto size={48} color="#CBC895" />
                    <Text color="#CBC895" mt={10} weight={700}>
                      No pages uploaded yet for this chapter
                    </Text>
                    <Text size="xs" color="dimmed" mt={5}>
                      Click Upload Pages to add comic pages
                    </Text>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          {/* RIGHT COLUMN: Comic Metadata & Active Chapter Title */}
          <Box className="lg:col-span-7 space-y-6">
            <Box className="space-y-6">
              <Text size="md" color="#CBC895" className="font-bold uppercase tracking-widest border-b border-[#CBC895]/20 pb-2" style={{ marginBottom: "1.5rem" }}>
                Comic Series Info
              </Text>
              
              <Group grow className="gap-4" style={{ marginBottom: "1.25rem" }}>
                <Box>
                  <Text color="#F6F4D3" size="sm" mb={5} className="font-bold uppercase">
                    {t('comics.form.title')}
                  </Text>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder={t('comics.form.title_placeholder')}
                    className="w-full h-12 rounded-none bg-[#191A22] text-[#F6F4D3] px-4 outline-none border border-white/10 focus:border-[#CBC895] transition-colors"
                  />
                </Box>
                <Box>
                  <Text color="#F6F4D3" size="sm" mb={5} className="font-bold uppercase">
                    {t('comics.form.artist')}
                  </Text>
                  <input
                    name="author_name"
                    value={formData.author_name}
                    onChange={handleInputChange}
                    placeholder={t('comics.form.artist_placeholder')}
                    className="w-full h-12 rounded-none bg-[#191A22] text-[#F6F4D3] px-4 outline-none border border-white/10 focus:border-[#CBC895] transition-colors"
                  />
                </Box>
              </Group>

              <Box style={{ marginBottom: "1.25rem" }}>
                <Text color="#F6F4D3" size="sm" mb={5} className="font-bold uppercase">
                  {t('comics.form.description')}
                </Text>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder={t('comics.form.description_placeholder')}
                  className="w-full rounded-none bg-[#191A22] text-[#F6F4D3] p-4 outline-none border border-white/10 resize-none focus:border-[#CBC895] transition-colors"
                />
              </Box>

              <Box style={{ marginBottom: "1.25rem" }}>
                <Text color="#F6F4D3" size="sm" mb={5} className="font-bold uppercase">
                  Comic Visibility Status
                </Text>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full h-12 rounded-none bg-[#191A22] text-[#F6F4D3] px-4 outline-none border border-white/10 focus:border-[#CBC895] transition-colors font-bold"
                >
                  <option value="draft">Draft (Hidden from public)</option>
                  <option value="published">Published (Visible to public)</option>
                  <option value="active">Active (Legacy Published)</option>
                  <option value="inactive">Inactive (Legacy Draft)</option>
                </select>
              </Box>
            </Box>

            <Box className="space-y-6 pt-6 border-t border-white/5">
              <Text size="md" color="#CBC895" className="font-bold uppercase tracking-widest border-b border-[#CBC895]/20 pb-2" style={{ marginBottom: "1.5rem" }}>
                Active Chapter Info
              </Text>
              
              <Box>
                <Text color="#F6F4D3" size="sm" mb={5} className="font-bold uppercase">
                  {t('comics.form.chapter_title')}
                </Text>
                <input
                  value={activeChapter.chapter_title || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setChapters((prev) =>
                      prev.map((chap, idx) =>
                        idx === activeChapterIndex
                          ? { ...chap, chapter_title: val }
                          : chap
                      )
                    );
                  }}
                  placeholder={t('comics.form.chapter_placeholder')}
                  className="w-full h-12 rounded-none bg-[#191A22] text-[#F6F4D3] px-4 outline-none border border-white/10 focus:border-[#CBC895] transition-colors font-bold"
                />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Footer Actions */}
        <Box className="mt-10 border-t border-white/10 pt-6 flex justify-between items-center flex-wrap gap-4 alexandria-font">
          <Button
            variant="subtle"
            color="red"
            onClick={handleResetForm}
            disabled={isSubmitting !== null}
            className="font-bold uppercase text-xs"
          >
            Clear Form
          </Button>

          <Box className="flex gap-4">
            <Button
              variant="subtle"
              color="gray"
              onClick={handleModalClose}
              disabled={isSubmitting !== null}
            >
              {t('comics.actions.cancel')}
            </Button>
            
            {editingComic && (editingComic.status === "published" || editingComic.status === "active") ? (
              <Button
                color="yellow"
                onClick={() => handleSubmit(formData.status)}
                loading={isSubmitting === "save"}
                disabled={isSubmitting !== null && isSubmitting !== "save"}
                className="px-10 font-bold uppercase h-[42px]"
                styles={{ root: { backgroundColor: "#CBC895", color: "#191A22" } }}
              >
                Save Changes
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  color="yellow"
                  onClick={() => handleSubmit("draft")}
                  loading={isSubmitting === "draft"}
                  disabled={isSubmitting !== null && isSubmitting !== "draft"}
                  className="font-bold uppercase"
                  styles={{
                    root: {
                      borderColor: "#CBC895",
                      color: "#CBC895",
                      backgroundColor: "transparent",
                      height: "42px",
                    }
                  }}
                >
                  Save Draft
                </Button>

                <Button
                  color="yellow"
                  onClick={() => handleSubmit("published")}
                  loading={isSubmitting === "published"}
                  disabled={isSubmitting !== null && isSubmitting !== "published"}
                  className="px-10 font-bold uppercase h-[42px]"
                  styles={{ root: { backgroundColor: "#CBC895", color: "#191A22" } }}
                >
                  Publish Comic
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Modal>

      <PagePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        pages={activeChapter.pages || []}
        currentIndex={previewIndex}
        onNavigate={setPreviewIndex}
      />
      <ConfirmModal
        isOpen={confirmProps.isOpen}
        title={confirmProps.title}
        message={confirmProps.message}
        onConfirm={confirmProps.onConfirm}
        onCancel={() => setConfirmProps({ ...confirmProps, isOpen: false })}
      />
    </>
  );
};

// --- List View Component ---
const Comic = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { comics, isLoadingComics, comicsLoaded } = useSelector((state) => state.admin);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComic, setEditingComic] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, comic: null });

  useEffect(() => {
    if (!comicsLoaded) dispatch(getAdminComics());
  }, [comicsLoaded, dispatch]);

  const handleCreateNew = () => {
    setEditingComic(null);
    setIsModalOpen(true);
  };

  const handleEditComic = (comic) => {
    setEditingComic(comic);
    setIsModalOpen(true);
  };

  const handleDeleteComic = async (comic) => {
    setDeleteConfirm({ isOpen: true, comic });
  };

  const handleSaveComic = async (formData) => {
    const action = editingComic
      ? updateComic(editingComic._id, formData)
      : createComic(formData);
    const res = await dispatch(action);
    if (res?.success) {
      toast.success(t('orders.messages.update_success'));
      setIsModalOpen(false);
      setEditingComic(null);
      dispatch(getAdminComics()); // Refresh list with draft support
      return true;
    }
    return false;
  };

  return (
    <main className="w-full min-h-screen bg-[rgba(16,15,0,0.62)] alexandria-font p-8">
      <Box className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-10 border-b border-[#CBC895]/30 pb-6">
          <Box>
            <h1 className="text-4xl font-bold tracking-widest text-[#F6F4D3]">
              {t('comics.title_page')}
            </h1>
            <p className="text-[#E0BC5A] opacity-70">
              Manage your series, chapters, and pages
            </p>
          </Box>
          <Button
            size="lg"
            variant="filled"
            styles={{ root: { backgroundColor: "#CBC895", color: "#191A22" } }}
            leftSection={<IconPlus />}
            onClick={handleCreateNew}
            className="shadow-[0_4px_1px_0_#000]"
          >
            {t('comics.actions.create')}
          </Button>
        </header>

        {isLoadingComics ? (
          <Box className="py-20 text-center">
            <Text color="#CBC895" size="xl">
              Loading system records...
            </Text>
          </Box>
        ) : (
          <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {comics.map((comic) => (
              <ComicCard
                key={comic._id}
                comic={comic}
                onEdit={handleEditComic}
                onDelete={handleDeleteComic}
              />
            ))}

            {comics.length === 0 && (
              <Box className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-2xl">
                <Text color="dimmed">{t('comics.messages.no_comics')}</Text>
                <Button
                  variant="subtle"
                  color="yellow"
                  mt={10}
                  onClick={handleCreateNew}
                >
                  Add your first series
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Box>

      <ComicDetailsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingComic(null);
        }}
        editingComic={editingComic}
        onSave={handleSaveComic}
      />
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="DELETE COMIC"
        message={t('comics.messages.delete_confirm', { title: deleteConfirm.comic?.title })}
        onConfirm={async () => {
          if (deleteConfirm.comic) {
            const res = await dispatch(deleteComic(deleteConfirm.comic._id));
            if (res?.success) {
              toast.success(t('orders.messages.update_success'));
              dispatch(getAdminComics());
            }
          }
        }}
        onCancel={() => setDeleteConfirm({ isOpen: false, comic: null })}
      />
    </main>
  );
};

export default Comic;