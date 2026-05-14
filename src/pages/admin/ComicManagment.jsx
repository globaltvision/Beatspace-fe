import React, { useState, useRef, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getComics,
  createComic,
  updateComic,
  deleteComic,
} from "../../store/actions/adminActions";
import { toast } from "sonner";
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
      className="relative group aspect-[3/4] bg-[#191A22] border border-[#C1BE91]/30 rounded-lg overflow-hidden flex flex-col"
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
    <article className="w-full flex flex-col bg-[#C0BC75] border border-[#C0BC75] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 alexandria-font">
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
    className="alexandria-font flex items-center justify-center gap-2 px-3 py-2 min-w-[100px] h-10 rounded-md bg-[#CBC895] shadow-[0_4px_1px_0_#000] hover:bg-[#B8B482] transition-all"
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

// --- Main Modal Component (FIXED - Pages now load correctly when editing) ---
const ComicDetailsModal = ({ isOpen, onClose, editingComic, onSave }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("details");
  const [formData, setFormData] = useState({
    author_name: "",
    title: "",
    chapter_title: "",
    description: "",
    status: "active",
  });

  // pages structure: { id, url, file, isThumbnail, order, isNew }
  const [pages, setPages] = useState([]);
  const [coverFile, setCoverFile] = useState(null);
  const [coverUrl, setCoverUrl] = useState("");

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // FIXED: Properly load pages when editing comic
  useEffect(() => {
    if (isOpen && editingComic) {
      setFormData({
        author_name: editingComic.author_name || "",
        title: editingComic.title || "",
        chapter_title: editingComic.chapter_info?.[0]?.chapter_title || "",
        description: editingComic.description || "",
        status: editingComic.status || "active",
      });

      // FIXED: Properly map existing pages from chapter_info with legacy fallback
      const chapter = editingComic.chapter_info?.[0];
      const existingPages = chapter?.pages || [];

      let mappedPages = [];
      if (existingPages.length > 0) {
        mappedPages = existingPages.map((p, idx) => ({
          id: p._id || `existing-${idx}-${Date.now()}`,
          url: p.url,
          isThumbnail: p.isThumbnail || false,
          order: p.order || idx + 1,
          isNew: false,
        }));
      } else if (chapter?.images?.length > 0) {
        // Support for comics created with the old string array structure
        mappedPages = chapter.images.map((url, idx) => ({
          id: `legacy-${idx}-${Date.now()}`,
          url: url,
          isThumbnail: idx === 0,
          order: idx + 1,
          isNew: false,
        }));
      }

      setPages(mappedPages);

      // Set cover image from comic data
      const coverImage = editingComic.thumbnailUrl || editingComic.image || "";
      setCoverUrl(coverImage);
      setCoverFile(null);
    } else if (isOpen && !editingComic) {
      // Reset form for new comic
      setFormData({
        author_name: "",
        title: "",
        chapter_title: "",
        description: "",
        status: "active",
      });
      setPages([]);
      setCoverFile(null);
      setCoverUrl("");
    }
  }, [editingComic, isOpen]);

  // FIXED: Reset active tab when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setActiveTab("details");
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const newPages = files.map((file, index) => ({
      id: `new-${Date.now()}-${index}-${Math.random()}`,
      url: URL.createObjectURL(file),
      file: file,
      isThumbnail: false,
      order: pages.length + index + 1,
      isNew: true,
    }));
    setPages((prev) => [...prev, ...newPages]);
    e.target.value = "";
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Cleanup old object URL
      if (typeof coverUrl === "string" && coverUrl.startsWith("blob:")) {
        URL.revokeObjectURL(coverUrl);
      }
      setCoverFile(file);
      setCoverUrl(URL.createObjectURL(file));
    }
  };

  const handleRemovePage = (id) => {
    setPages((prev) => {
      const pageToRemove = prev.find((p) => p.id === id);
      // Cleanup object URL for new pages
      if (
        pageToRemove?.isNew &&
        typeof pageToRemove.url === "string" &&
        pageToRemove.url.startsWith("blob:")
      ) {
        URL.revokeObjectURL(pageToRemove.url);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleSetThumbnail = (id) => {
    setPages((prev) =>
      prev.map((p) => ({
        ...p,
        isThumbnail: p.id === id,
      })),
    );
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setPages((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        return reordered.map((p, idx) => ({ ...p, order: idx + 1 }));
      });
    }
  };

  // Cleanup object URLs on modal close
  const handleModalClose = () => {
    // Cleanup all blob URLs for new pages
    pages.forEach((page) => {
      if (
        page.isNew &&
        typeof page.url === "string" &&
        page.url.startsWith("blob:")
      ) {
        URL.revokeObjectURL(page.url);
      }
    });
    if (typeof coverUrl === "string" && coverUrl.startsWith("blob:")) {
      URL.revokeObjectURL(coverUrl);
    }
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pages.length === 0) {
      toast.error(t('comics.messages.upload_required'));
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("author_name", formData.author_name);
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("status", formData.status);

      // Prepare chapter info with proper page data
      const chapterPages = pages.map((p, idx) => ({
        order: p.order || idx + 1,
        isThumbnail: p.isThumbnail || false,
        ...(p.isNew ? {} : { url: p.url }), // Only include url for existing pages
      }));

      const chapter = {
        chapter_title: formData.chapter_title,
        pages: chapterPages,
        // Backend Zod schema requires images array
        images: pages.filter((p) => !p.isNew).map((p) => p.url),
      };

      data.append("chapter_info", JSON.stringify([chapter]));

      // Append new image files
      pages.forEach((p) => {
        if (p.isNew && p.file) {
          data.append("gallery", p.file);
        }
      });

      // Handle Cover image
      if (coverFile) {
        data.append("image", coverFile);
      }

      await onSave(data);

      // Cleanup URLs after successful save
      pages.forEach((page) => {
        if (
          page.isNew &&
          typeof page.url === "string" &&
          page.url.startsWith("blob:")
        ) {
          URL.revokeObjectURL(page.url);
        }
      });
      if (typeof coverUrl === "string" && coverUrl.startsWith("blob:")) {
        URL.revokeObjectURL(coverUrl);
      }
    } catch (error) {
      console.error(error);
      toast.error(t('comics.messages.save_failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal
        opened={isOpen}
        onClose={handleModalClose}
        size="70%"
        padding="xl"
        centered
        className="alexandria-font "
        classNames={{
          content: "custom-scrollbar",
        }}
        title={
          <Text size="xl" weight={800} className="tracking-widest uppercase">
            {editingComic ? t('comics.edit_comic') : t('comics.create_comic')}
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
            maxHeight: "90vh",
            overflowY: "auto",
          },
          close: { color: "#F6F4D3" },
          body: {
            padding: "20px",
          },
        }}
        overlayProps={{ color: "#000", opacity: 0.85, blur: 3 }}
      >
        <Tabs
          defaultValue="details"
          value={activeTab}
          onChange={setActiveTab}
          color="yellow"
          variant="outline"
          className="alexandria-font "
        >
          <Tabs.List className="mb-6">
            <Tabs.Tab
              value="details"
              leftSection={<IconSettings size={18} />}
              className="font-bold !text-[#F6F4D3]"
            >
              {t('comics.tabs.details')}
            </Tabs.Tab>
            <Tabs.Tab
              value="media"
              leftSection={<IconPhoto size={18} />}
              className="font-bold !text-[#F6F4D3]"
            >
              {t('comics.tabs.media')}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="details" className="alexandria-font">
            <Box className="space-y-4">
              <Group grow>
                <Box>
                  <Text color="#F6F4D3" size="sm" mb={5} weight={700}>
                    {t('comics.form.title')}
                  </Text>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder={t('comics.form.title_placeholder')}
                    className="w-full h-12 rounded-lg bg-[#191A22] text-[#F6F4D3] px-4 outline-none border border-white/10 alexandria-font"
                  />
                </Box>
                <Box>
                  <Text color="#F6F4D3" size="sm" mb={5} weight={700}>
                    {t('comics.form.artist')}
                  </Text>
                  <input
                    name="author_name"
                    value={formData.author_name}
                    onChange={handleInputChange}
                    placeholder={t('comics.form.artist_placeholder')}
                    className="w-full h-12 rounded-lg bg-[#191A22] text-[#F6F4D3] px-4 outline-none border border-white/10 alexandria-font"
                  />
                </Box>
              </Group>

              <Box>
                <Text
                  color="#F6F4D3"
                  size="sm"
                  mb={5}
                  weight={700}
                  className="uppercase"
                >
                  {t('comics.form.chapter_title')}
                </Text>
                <input
                  name="chapter_title"
                  value={formData.chapter_title}
                  onChange={handleInputChange}
                  placeholder={t('comics.form.chapter_placeholder')}
                  className="w-full h-12 rounded-lg bg-[#191A22] text-[#F6F4D3] px-4 outline-none border border-white/10 alexandria-font font-bold"
                />
              </Box>

              <Box>
                <Text
                  color="#F6F4D3"
                  size="sm"
                  mb={5}
                  weight={700}
                  className="uppercase"
                >
                  {t('comics.form.description')}
                </Text>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder={t('comics.form.description_placeholder')}
                  className="w-full rounded-lg bg-[#191A22] text-[#F6F4D3] p-4 outline-none border border-white/10 resize-none alexandria-font font-bold"
                />
              </Box>

              <Box>
                <Text
                  color="#F6F4D3"
                  size="sm"
                  mb={5}
                  weight={700}
                  className="uppercase"
                >
                  {t('comics.form.status')}
                </Text>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full h-12 rounded-lg bg-[#191A22] text-[#F6F4D3] px-4 outline-none border border-white/10 alexandria-font font-bold"
                >
                  <option value="active">{t('comics.form.active')}</option>
                  <option value="inactive">{t('comics.form.inactive')}</option>
                </select>
              </Box>
            </Box>
          </Tabs.Panel>

          <Tabs.Panel value="media">
            <Box className="space-y-6">
              {/* Cover Upload */}
              <Box className="p-4 bg-[#191A22] rounded-lg border border-dashed border-[#C1BE91]">
                <Text
                  color="#F6F4D3"
                  size="sm"
                  mb={10}
                  weight={700}
                  className="uppercase"
                >
                  {t('comics.form.cover_label')}
                </Text>
                <Group>
                  {coverUrl && (
                    <Image
                      src={coverUrl}
                      w={100}
                      h={140}
                      fit="cover"
                      radius="sm"
                      className="border border-[#C1BE91]"
                    />
                  )}
                  <Button
                    variant="light"
                    color="yellow"
                    onClick={() => coverInputRef.current?.click()}
                    leftSection={<IconPlus size={18} />}
                    className="font-bold uppercase"
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
                </Group>
              </Box>

              {/* Pages Grid with DND */}
              <Box>
                <Group justify="space-between" mb={10}>
                  <Text
                    color="#F6F4D3"
                    size="sm"
                    weight={700}
                    className="uppercase"
                  >
                    {t('comics.form.upload_pages')} ({pages.length})
                  </Text>
                  <Button
                    size="xs"
                    color="yellow"
                    onClick={() => fileInputRef.current?.click()}
                    leftSection={<IconPlus size={16} />}
                    className="font-bold uppercase"
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

                <Box className="bg-[#191A22] p-4 rounded-lg min-h-[300px]">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={pages.map((p) => p.id)}
                      strategy={rectSortingStrategy}
                    >
                      <Box className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                        {pages.map((page, index) => (
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

                  {pages.length === 0 && (
                    <Box className="flex flex-col items-center justify-center h-[200px] opacity-40 alexandria-font">
                      <IconPhoto size={48} color="#CBC895" />
                      <Text color="#CBC895" mt={10} weight={700}>
                        {t('comics.messages.no_comics')}
                      </Text>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Tabs.Panel>
        </Tabs>

        {/* Footer Actions */}
        <Box className="mt-10 border-t border-white/10 pt-6 flex justify-end gap-4 alexandria-font">
          <Button
            variant="subtle"
            color="gray"
            onClick={handleModalClose}
            disabled={isSubmitting}
          >
            {t('comics.actions.cancel')}
          </Button>
          <Button
            color="yellow"
            onClick={handleSubmit}
            loading={isSubmitting}
            className="px-10 font-bold"
            styles={{ root: { backgroundColor: "#CBC895", color: "#191A22" } }}
          >
            {editingComic ? t('comics.actions.save') : t('comics.actions.create')}
          </Button>
        </Box>
      </Modal>

      <PagePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        pages={pages}
        currentIndex={previewIndex}
        onNavigate={setPreviewIndex}
      />
    </>
  );
};

// --- List View Component ---
const Comic = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { comics, isLoadingComics } = useSelector((state) => state.admin);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComic, setEditingComic] = useState(null);

  useEffect(() => {
    dispatch(getComics());
  }, [dispatch]);

  const handleCreateNew = () => {
    setEditingComic(null);
    setIsModalOpen(true);
  };

  const handleEditComic = (comic) => {
    setEditingComic(comic);
    setIsModalOpen(true);
  };

  const handleDeleteComic = async (comic) => {
    if (window.confirm(t('comics.messages.delete_confirm', { title: comic.title }))) {
      const res = await dispatch(deleteComic(comic._id));
      if (res?.success) toast.success(t('orders.messages.update_success'));
    }
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
      dispatch(getComics()); // Refresh the list
    }
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
    </main>
  );
};

export default Comic;
