import React, { useMemo, useState } from "react";
import {
  ActionIcon,
  Alert,
  Button,
  FileInput,
  Group,
  Image,
  Loader,
  Modal,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IconAlertTriangle, IconEdit, IconPhoto, IconPlus, IconRefresh, IconTrash, IconUpload } from "@tabler/icons-react";
import custAxios from "../../configs/axios.config";

/* ─── constants ─────────────────────────────────────────────── */

const EMPTY_FORM = {
  name: "",
  slug: "",
  description: "",
  image: "",
  launch_url: "",
  status: true,
  imageFit: "contain",
};

const INPUT_STYLES = {
  input: { background: "#2a2e1e", border: "1px solid #6b6b3a", color: "#fff" },
  label: { color: "#CBC895", marginBottom: "4px" },
};

/* ─── helpers ────────────────────────────────────────────────── */
const getGameId = (game) => game?._id || game?.id;

const normalizeStatus = (status) => {
  if (typeof status === "boolean") return status;
  if (typeof status === "number") return status === 1;
  return String(status || "").toLowerCase() === "active";
};

const statusPayload = (isActive) => (isActive ? "active" : "inactive");

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.response?.data?.error || error?.message || fallback;

const getGamesFromResponse = (response) => {
  const payload = response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.games)) return payload.games;
  if (Array.isArray(payload?.data?.games)) return payload.data.games;
  return [];
};

/* ─── component ──────────────────────────────────────────────── */
export default function Games() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [deletingGame, setDeletingGame] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [zipFile, setZipFile] = useState(null);

  /* ── games list ── */
  const {
    data: games = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["admin-games"],
    queryFn: async () => getGamesFromResponse(await custAxios.get("/admin/getGames")),
  });

  const activeCount = useMemo(
    () => games.filter((g) => normalizeStatus(g.status)).length,
    [games]
  );

  /* ── mutations ── */

  // Create via zip upload → R2
  const uploadMutation = useMutation({
    mutationFn: (fd) =>
      custAxios.post("/admin/uploadGame", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    onSuccess: () => {
      notifications.show({ title: "Game uploaded", message: "Game deployed to R2 successfully.", color: "green" });
      queryClient.invalidateQueries({ queryKey: ["admin-games"] });
      closeFormModal();
    },
    onError: (err) =>
      notifications.show({ title: "Upload failed", message: getErrorMessage(err, "Could not upload game."), color: "red" }),
  });

  // Edit existing game → JSON PATCH
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => custAxios.patch(`/admin/updateGame/${id}`, payload),
    onSuccess: () => {
      notifications.show({ title: "Game updated", message: "Updated successfully.", color: "green" });
      queryClient.invalidateQueries({ queryKey: ["admin-games"] });
      closeFormModal();
    },
    onError: (err) =>
      notifications.show({ title: "Could not update game", message: getErrorMessage(err, "Please try again."), color: "red" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => custAxios.delete(`/admin/deleteGame/${id}`),
    onSuccess: () => {
      notifications.show({ title: "Game deleted", message: "Removed successfully.", color: "green" });
      queryClient.invalidateQueries({ queryKey: ["admin-games"] });
      setDeleteOpen(false);
      setDeletingGame(null);
    },
    onError: (err) =>
      notifications.show({ title: "Could not delete game", message: getErrorMessage(err, "Please try again."), color: "red" }),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }) =>
      custAxios.patch(`/admin/updateGame/${id}`, { status: statusPayload(isActive) }),
    onSuccess: () => {
      notifications.show({ title: "Status updated", message: "Game status changed.", color: "green" });
      queryClient.invalidateQueries({ queryKey: ["admin-games"] });
    },
    onError: (err) =>
      notifications.show({ title: "Could not change status", message: getErrorMessage(err, "Please try again."), color: "red" }),
  });

  /* ── modal open / close ── */
  const openCreateModal = () => {
    setEditingGame(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setZipFile(null);
    setModalOpen(true);
  };

  const openEditModal = (game) => {
    setEditingGame(game);
    setForm({
      name: game.name || "",
      slug: game.slug || "",
      description: game.description || "",
      image: game.image || game.image_url || "",
      launch_url: game.launch_url || game.launchUrl || "",
      status: normalizeStatus(game.status),
      imageFit: game.imageFit || "contain",
    });
    setImageFile(null);
    setZipFile(null);
    setModalOpen(true);
  };

  const closeFormModal = () => {
    setModalOpen(false);
    setEditingGame(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setZipFile(null);
  };

  /* ── image upload ── */
  const handleImageUpload = async (file) => {
    if (!file) return;
    setImageFile(file);
    setImageUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await custAxios.post("/admin/upload-asset", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = res?.data?.url || res?.data?.data?.url || res?.data?.imageUrl || "";
      setForm((c) => ({ ...c, image: url }));
    } catch (err) {
      notifications.show({
        title: "Upload failed",
        message: err?.response?.data?.message || "Could not upload image.",
        color: "red",
      });
    } finally {
      setImageUploading(false);
    }
  };

  /* ── submit ── */
  const handleSubmit = (event) => {
    event.preventDefault();
    const id = getGameId(editingGame);

    if (id) {
      // Edit mode — JSON PATCH, no zip needed
      if (!form.name.trim() || !form.slug.trim()) {
        notifications.show({ title: "Missing fields", message: "Name and slug are required.", color: "red" });
        return;
      }
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        image: form.image.trim(),
        status: statusPayload(form.status),
      };
      updateMutation.mutate({ id, payload });
      return;
    }

    // Create mode — FormData with zip
    if (!form.name.trim() || !form.slug.trim()) {
      notifications.show({ title: "Missing fields", message: "Name and slug are required.", color: "red" });
      return;
    }
    if (!zipFile) {
      notifications.show({ title: "Missing zip file", message: "Please select a game zip file.", color: "red" });
      return;
    }
    const fd = new FormData();
    fd.append("gameZip", zipFile);
    fd.append("name", form.name.trim());
    fd.append("slug", form.slug.trim());
    fd.append("description", form.description.trim());
    fd.append("image", form.image.trim());
    fd.append("status", statusPayload(form.status));
    uploadMutation.mutate(fd);
  };

  const requestDelete = (game) => { setDeletingGame(game); setDeleteOpen(true); };

  /* ── game cards ── */
  const GameCard = ({ game }) => {
    const id = getGameId(game);
    const isActive = normalizeStatus(game.status);
    const img = game.image || game.image_url || "";
    return (
      <div className="game-card" style={{ position: "relative", background: "#131319", border: "1px solid rgba(203,200,149,0.3)", display: "flex", flexDirection: "column" }}>
        {/* corner accents */}
        {[{ top: -3, left: -3 }, { top: -3, right: -3 }, { bottom: -3, left: -3 }, { bottom: -3, right: -3 }].map((pos, i) => (
          <div className="card-corner" key={i} style={{ position: "absolute", width: 7, height: 7, background: "#CBC895", zIndex: 1, transition: "background .22s ease", ...pos }} />
        ))}

        {/* thumbnail */}
        <div className="card-thumb-wrap">
          {img ? (
            <img className="card-thumb-img" src={img} alt={game.name} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#CBC895" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="2"/>
                <path d="M12 12h.01M8 10v4M6 12h4"/>
                <circle cx="16" cy="12" r="1" fill="#CBC895"/>
                <circle cx="18" cy="10" r="1" fill="#CBC895"/>
              </svg>
              <span style={{ fontFamily: '"Press Start 2P"', fontSize: 7, color: "#4a4a3a" }}>NO PREVIEW</span>
            </div>
          )}
          {/* status pill on image */}
          <div style={{
            position: "absolute", top: 10, right: 10,
            background: isActive ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
            border: `1px solid ${isActive ? "#22c55e" : "#ef4444"}`,
            color: isActive ? "#4ade80" : "#f87171",
            fontFamily: '"Press Start 2P"', fontSize: 7,
            padding: "4px 8px", letterSpacing: "0.05em",
          }}>
            {isActive ? "ACTIVE" : "OFFLINE"}
          </div>
        </div>

        {/* info */}
        <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontFamily: '"Press Start 2P"', fontSize: 10, color: "#F6F4D3", lineHeight: 1.6 }}>
            {game.name || "Untitled"}
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: "#CBC895", background: "rgba(203,200,149,0.08)", padding: "3px 8px", alignSelf: "flex-start", letterSpacing: "0.04em" }}>
            /{game.slug || "—"}
          </div>
          <div style={{ fontSize: 12, color: "#8a8870", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {game.description || "No description provided."}
          </div>
        </div>

        {/* actions bar */}
        <div style={{ borderTop: "1px solid rgba(203,200,149,0.15)", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.2)" }}>
          <Switch
            checked={isActive}
            onChange={(e) => { const v = e.currentTarget.checked; toggleStatusMutation.mutate({ id, isActive: v }); }}
            disabled={!id || toggleStatusMutation.isPending}
            color="lime"
            size="sm"
            label={<span style={{ fontFamily: '"Press Start 2P"', fontSize: 7, color: isActive ? "#4ade80" : "#666" }}>{isActive ? "ON" : "OFF"}</span>}
            styles={{
              track: { background: isActive ? "#166534" : "#2a2a2a", border: isActive ? "1px solid #22c55e" : "1px solid #444" },
              thumb: { background: isActive ? "#4ade80" : "#555" },
            }}
          />
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => openEditModal(game)}
              style={{ width: 34, height: 34, background: "rgba(255,239,46,0.08)", border: "1px solid #FFEF2E", color: "#FFEF2E", display: "flex", alignItems: "center", justifyContent: "center" }}
              title="Edit"
            >
              <IconEdit size={15} />
            </button>
            <button
              onClick={() => requestDelete(game)}
              style={{ width: 34, height: 34, background: "rgba(235,24,27,0.1)", border: "1px solid #EB181B", color: "#EB181B", display: "flex", alignItems: "center", justifyContent: "center" }}
              title="Delete"
            >
              <IconTrash size={15} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const isSaving = uploadMutation.isPending || updateMutation.isPending;

  /* ── render ── */
  return (
    <div className="app alexandria-font">
      <style>{`
        :root{
          --olive:#525132;--tan:#CBC895;--yellow:#EBE23C;--yellow2:#FFF069;
          --header-dark:#2F2D0E;--table-dark:#131319;
          --green:#55DF55;--red:#EB181B;--button:#DDD1B1;--text:#ffffff;--ink:#191A22;
        }
        *{box-sizing:border-box}
        .app{min-height:100vh;background:#0f1016;color:var(--text)}
        .container{max-width:1300px;margin:0 auto;padding:0 1.5rem}
        .pixel{font-family:"Press Start 2P",monospace}
        .btn{background:var(--button);color:var(--ink);font-weight:700;border-radius:0;box-shadow:0 5px 0 #000;padding:.75rem 1.2rem;border:none;cursor:pointer;font-family:"Press Start 2P",monospace;font-size:10px;letter-spacing:.04em}
        .btn:active{transform:translateY(2px);box-shadow:0 3px 0 #000}
        .topbar{background:#131319;border-bottom:1px solid rgba(203,200,149,0.3)}
        .topbar-inner{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1.25rem 1.5rem}
        .title{font-size:18px;color:#F6F4D3}
        .stats{color:var(--yellow2);font-size:11px;font-family:"Press Start 2P",monospace;margin-top:6px}
        .inventory{background:#0f1016;min-height:calc(100vh - 86px)}
        .games-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
        .game-card{transition:transform .22s ease,border-color .22s ease,box-shadow .22s ease}
        .game-card:hover{transform:translateY(-7px);border-color:rgba(203,200,149,0.8) !important;box-shadow:0 16px 40px rgba(0,0,0,0.55),0 0 0 1px rgba(203,200,149,0.25)}
        .game-card:hover .card-corner{background:#F6F4D3 !important}
        .game-card:hover .card-thumb-img{transform:scale(1.07)}
        .card-thumb-img{transition:transform .35s ease;width:100%;height:100%;object-fit:cover;display:block}
        .card-thumb-wrap{overflow:hidden;background:#ffffff;position:relative;height:170px;flex-shrink:0}
        .a-btn{width:38px;height:34px;display:flex;align-items:center;justify-content:center;background:transparent;border:1px solid currentColor;cursor:pointer;border-radius:0}
        .a-yellow{color:#FFEF2E;background:rgba(255,239,46,0.06)}
        .a-red{color:var(--red);background:rgba(235,24,27,0.1)}
        .modal-title{color:var(--yellow);font-size:14px;font-weight:700;font-family:"Press Start 2P",monospace}
        .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
        .form-wide{grid-column:1 / -1}
        .mantine-Modal-content{background:#131319;border:1px solid rgba(203,200,149,0.4);color:#fff}
        .mantine-Modal-header{background:#131319;color:#fff;border-bottom:1px solid rgba(203,200,149,0.2)}
        .empty-state{padding:4rem 1rem;text-align:center;border:1px solid rgba(203,200,149,0.2)}
        @media(max-width:1100px){.games-grid{grid-template-columns:repeat(3,1fr)}}
        @media(max-width:760px){.topbar-inner{align-items:flex-start;flex-direction:column}.form-grid{grid-template-columns:1fr}.games-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:480px){.games-grid{grid-template-columns:1fr}}
      `}</style>

      {/* ── topbar ── */}
      <section className="topbar">
        <div className="container topbar-inner">
          <div>
            <div className="pixel title">Games Management</div>
            <Text className="stats" mt={8}>Total games: {games.length} | Active: {activeCount}</Text>
          </div>
          <Group>
            <ActionIcon className="a-btn a-yellow" variant="transparent" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh">
              {isFetching ? <Loader size={16} color="yellow" /> : <IconRefresh size={18} />}
            </ActionIcon>
            <button className="btn" onClick={openCreateModal}>
              <Group gap="xs" wrap="nowrap"><IconPlus size={18} /> Add New Game</Group>
            </button>
          </Group>
        </div>
      </section>

      {/* ── grid ── */}
      <section className="inventory">
        <div className="container" style={{ padding: "2rem 1.5rem" }}>
          {isLoading ? (
            <div className="empty-state"><Loader color="yellow" /></div>
          ) : isError ? (
            <div className="empty-state">
              <Text fw={700}>Could not load games.</Text>
              <Button mt="md" color="yellow" variant="light" onClick={() => refetch()}>Try again</Button>
            </div>
          ) : games.length === 0 ? (
            <div className="empty-state">
              <Text fw={700} style={{ fontFamily: '"Press Start 2P"', fontSize: 12, color: "#CBC895" }}>NO GAMES FOUND</Text>
              <Text c="var(--tan)" mt={10} style={{ fontSize: 13 }}>Upload your first game to see it here.</Text>
            </div>
          ) : (
            <div className="games-grid">
              {games.map((game) => <GameCard key={getGameId(game) || game.slug} game={game} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── Add / Edit modal ── */}
      <Modal
        opened={modalOpen}
        onClose={closeFormModal}
        title={<span className="modal-title alexandria-font">{editingGame ? "Edit Game" : "Add New Game"}</span>}
        centered
        size="lg"
        classNames={{ content: "alexandria-font" }}
      >
        <form onSubmit={handleSubmit} className="alexandria-font">
          <Stack gap="md">
            {/* name + slug */}
            <div className="form-grid">
              <TextInput
                label="Name"
                placeholder="Eternal Run"
                value={form.name}
                onChange={(e) => { const v = e.currentTarget.value; setForm((c) => ({ ...c, name: v })); }}
                required
                styles={INPUT_STYLES}
              />
              <TextInput
                label="Slug"
                placeholder="eternal-run"
                value={form.slug}
                onChange={(e) => { const v = e.currentTarget.value; setForm((c) => ({ ...c, slug: v })); }}
                required
                disabled={!!editingGame}
                styles={INPUT_STYLES}
              />
            </div>

            {/* Zip upload — create only */}
            {!editingGame && (
              <>
                <FileInput
                  label="Game Zip File"
                  placeholder="Click to select a .zip file…"
                  accept=".zip,application/zip,application/x-zip-compressed"
                  value={zipFile}
                  onChange={setZipFile}
                  leftSection={<IconUpload size={16} />}
                  required
                  styles={INPUT_STYLES}
                />
                <Alert
                  icon={<IconAlertTriangle size={16} />}
                  color="yellow"
                  variant="light"
                  styles={{ message: { color: "#CBC895", fontSize: 13 } }}
                >
                  Make sure <strong>index.html</strong> is at the root level of your zip file, not inside a subfolder.
                </Alert>
              </>
            )}

            {/* Edit mode — show current launch URL read-only */}
            {editingGame && form.launch_url && (
              <div>
                <Text size="sm" style={{ color: "#CBC895", marginBottom: 4 }}>Launch URL</Text>
                <Text
                  size="xs"
                  ff="monospace"
                  style={{
                    color: "#9C963A",
                    background: "#2a2e1e",
                    border: "1px solid #6b6b3a",
                    padding: "10px 12px",
                    wordBreak: "break-all",
                  }}
                >
                  {form.launch_url}
                </Text>
              </div>
            )}

            {/* thumbnail uploader */}
            <div>
              <FileInput
                label="Thumbnail"
                placeholder="Click to pick an image…"
                accept="image/*"
                value={imageFile}
                onChange={handleImageUpload}
                leftSection={imageUploading ? <Loader size={14} color="yellow" /> : <IconPhoto size={16} />}
                disabled={imageUploading}
                styles={INPUT_STYLES}
              />
              {imageUploading && (
                <Text size="xs" mt={4} style={{ color: "#CBC895" }}>Uploading…</Text>
              )}
              {!imageUploading && form.image && (
                <>
                  <Select
                    label="Image fit"
                    placeholder="Choose how the thumbnail is displayed"
                    data={[
                      { value: "contain", label: "Fit full image (preserve borders)" },
                      { value: "cover", label: "Fill card (crop edges)" },
                    ]}
                    value={form.imageFit}
                    onChange={(v) => setForm((c) => ({ ...c, imageFit: v || "contain" }))}
                    styles={INPUT_STYLES}
                    mt="sm"
                  />
                  <div style={{ marginTop: "0.5rem" }}>
                    <Image
                      src={form.image}
                      alt="Thumbnail preview"
                      radius="sm"
                      h={80}
                      w="auto"
                      fit={form.imageFit}
                      style={{ border: "1px solid #6b6b3a", borderRadius: 6, background: "#1a1c10" }}
                    />
                  </div>
                </>
              )}
            </div>

            {/* description */}
            <Textarea
              label="Description"
              placeholder="Short game description"
              minRows={3}
              value={form.description}
              onChange={(e) => { const v = e.currentTarget.value; setForm((c) => ({ ...c, description: v })); }}
              styles={INPUT_STYLES}
            />

            {/* active toggle */}
            <Switch
              label={form.status ? "Active" : "Inactive"}
              checked={form.status}
              onChange={(e) => { const v = e.currentTarget.checked; setForm((c) => ({ ...c, status: v })); }}
              color="lime"
              styles={{ label: { color: "#CBC895" } }}
            />
          </Stack>

          <Group justify="flex-end" mt="xl">
            <Button variant="outline" color="gray" onClick={closeFormModal} disabled={isSaving}>Cancel</Button>
            <Button
              type="submit"
              variant="filled"
              style={{ background: "#DDD1B1", color: "#191A22", fontWeight: 700 }}
              loading={isSaving}
            >
              {editingGame ? "Save Changes" : isSaving ? "Uploading…" : "Upload Game"}
            </Button>
          </Group>
        </form>
      </Modal>

      {/* ── Delete modal ── */}
      <Modal
        opened={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={<span className="modal-title alexandria-font">Delete Game</span>}
        centered
        classNames={{ content: "alexandria-font" }}
      >
        <Text className="alexandria-font" style={{ color: "#d9d8bd" }}>
          Are you sure you want to delete{" "}
          <span style={{ color: "#EBE23C", fontWeight: 700 }}>
            {deletingGame?.name ? `"${deletingGame.name}"` : "this game"}
          </span>
          ? This will also remove the game files from storage.
        </Text>
        <Group justify="flex-end" mt="xl">
          <Button variant="outline" color="gray" onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button
            variant="filled"
            color="red"
            loading={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate(getGameId(deletingGame))}
          >
            Delete
          </Button>
        </Group>
      </Modal>
    </div>
  );
}
