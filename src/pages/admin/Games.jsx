import React, { useMemo, useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  FileInput,
  Group,
  Image,
  Loader,
  Modal,
  Select,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IconEdit, IconFolder, IconPhoto, IconPlus, IconRefresh, IconTrash } from "@tabler/icons-react";
import custAxios from "../../configs/axios.config";

/* ─── constants ─────────────────────────────────────────────── */

// Add new game folders here when you drop them in public/games/
const AVAILABLE_GAMES = [
  { value: "/games/EternalRun_Web/index.html", label: "EternalRun_Web" },
  { value: "/games/new_game/index.html", label: "new_game" },
];

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
  const createMutation = useMutation({
    mutationFn: (payload) => custAxios.post("/admin/addGame", payload),
    onSuccess: () => {
      notifications.show({ title: "Game added", message: "Created successfully.", color: "green" });
      queryClient.invalidateQueries({ queryKey: ["admin-games"] });
      closeFormModal();
    },
    onError: (err) =>
      notifications.show({ title: "Could not add game", message: getErrorMessage(err, "Please try again."), color: "red" }),
  });

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
    setModalOpen(true);
  };

  const closeFormModal = () => {
    setModalOpen(false);
    setEditingGame(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
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
    if (!form.name.trim() || !form.slug.trim() || !form.launch_url.trim()) {
      notifications.show({ title: "Missing fields", message: "Name, slug, and launch URL are required.", color: "red" });
      return;
    }
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
      launch_url: form.launch_url.trim(),
      status: statusPayload(form.status),
    };
    const id = getGameId(editingGame);
    if (id) { updateMutation.mutate({ id, payload }); return; }
    createMutation.mutate(payload);
  };

  const requestDelete = (game) => { setDeletingGame(game); setDeleteOpen(true); };

  /* ── table rows ── */
  const rows = games.map((game) => {
    const id = getGameId(game);
    const isActive = normalizeStatus(game.status);
    return (
      <Table.Tr key={id || game.slug}>
        <Table.Td><Text fw={700}>{game.name || "Untitled game"}</Text></Table.Td>
        <Table.Td><Text c="var(--tan)" ff="monospace">{game.slug || "-"}</Text></Table.Td>
        <Table.Td><Text lineClamp={2} c="#d9d8bd">{game.description || "No description"}</Text></Table.Td>
        <Table.Td>
          <Badge color={isActive ? "green" : "red"} variant="light">
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Group gap="xs" wrap="nowrap">
            <Switch
              checked={isActive}
              onChange={(e) => { const v = e.currentTarget.checked; toggleStatusMutation.mutate({ id, isActive: v }); }}
              disabled={!id || toggleStatusMutation.isPending}
              color="lime"
              size="md"
              aria-label={`Toggle ${game.name || "game"} status`}
              styles={{
                track: {
                  background: isActive ? "#4ade80" : "#3a3a3a",
                  border: isActive ? "1px solid #22c55e" : "1px solid #555",
                  cursor: "pointer",
                },
                thumb: { background: isActive ? "#fff" : "#aaa", border: "none" },
              }}
            />
            <ActionIcon className="a-btn a-yellow" variant="transparent" onClick={() => openEditModal(game)} aria-label="Edit game">
              <IconEdit size={18} />
            </ActionIcon>
            <ActionIcon className="a-btn a-red" variant="transparent" onClick={() => requestDelete(game)} aria-label="Delete game">
              <IconTrash size={18} />
            </ActionIcon>
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  });

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
        .app{min-height:100vh;background:var(--olive);color:var(--text)}
        .container{max-width:1200px;margin:0 auto;padding:0 1.5rem}
        .pixel{font-family:"Press Start 2P",monospace}
        .btn{background:var(--button);color:var(--ink);font-weight:700;border-radius:8px;box-shadow:0 7px 2px 0 #000;padding:.8rem 1.1rem;border:none;cursor:pointer}
        .btn:active{transform:translateY(2px);box-shadow:0 5px 2px 0 #000}
        .topbar{background:var(--header-dark);border-bottom:1px solid var(--tan)}
        .topbar-inner{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1.25rem 1.5rem}
        .title{font-size:23px;color:#fff}
        .stats{color:var(--yellow2);font-size:13px}
        .inventory{background:rgba(181,179,135,0.16);min-height:calc(100vh - 86px)}
        .table-wrap{overflow-x:auto;padding:1.5rem 0 2rem}
        .games-table{min-width:920px;border-collapse:separate;border-spacing:0}
        .games-table thead{background:var(--table-dark)}
        .games-table th{color:var(--tan);font-family:"Press Start 2P",monospace;font-size:14px;padding:1.15rem;text-align:left}
        .games-table td{background:rgba(197,194,116,0.16);border-bottom:1px solid var(--tan);padding:1rem 1.15rem;color:#fff}
        .a-btn{width:42px;height:37px;display:flex;align-items:center;justify-content:center;background:transparent;border:2px solid currentColor;cursor:pointer;border-radius:0}
        .a-yellow{color:#FFEF2E}
        .a-red{color:var(--red);background:rgba(235,24,27,0.13)}
        .modal-title{color:var(--yellow);font-size:16px;font-weight:700}
        .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
        .form-wide{grid-column:1 / -1}
        .mantine-Modal-content{background:var(--header-dark);border:2px solid var(--tan);color:#fff}
        .mantine-Modal-header{background:var(--header-dark);color:#fff}
        .empty-state{padding:3rem 1rem;text-align:center;background:rgba(197,194,116,0.16);border:1px solid var(--tan)}
        @media(max-width:760px){.topbar-inner{align-items:flex-start;flex-direction:column}.form-grid{grid-template-columns:1fr}}
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

      {/* ── table ── */}
      <section className="inventory">
        <div className="container table-wrap">
          {isLoading ? (
            <div className="empty-state"><Loader color="yellow" /></div>
          ) : isError ? (
            <div className="empty-state">
              <Text fw={700}>Could not load games.</Text>
              <Button mt="md" color="yellow" variant="light" onClick={() => refetch()}>Try again</Button>
            </div>
          ) : games.length === 0 ? (
            <div className="empty-state">
              <Text fw={700}>No games found.</Text>
              <Text c="var(--tan)" mt={6}>Create your first game to show it here.</Text>
            </div>
          ) : (
            <Table className="games-table">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Slug</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
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
            {/* row 1 — name + slug */}
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
                styles={INPUT_STYLES}
              />
            </div>

            {/* launch URL — smart folder picker */}
            <Select
              label="Select Game Folder"
              placeholder="Pick a folder…"
              data={AVAILABLE_GAMES}
              value={form.launch_url || null}
              onChange={(v) => setForm((c) => ({ ...c, launch_url: v || "" }))}
              leftSection={<IconFolder size={16} />}
              searchable
              clearable
              nothingFoundMessage="No folders found"
              styles={{
                input: { background: "#2a2e1e", border: "1px solid #6b6b3a", color: "#fff" },
                label: { color: "#CBC895", marginBottom: "4px" },
                dropdown: { background: "#1e2012", border: "1px solid #6b6b3a" },
                option: { color: "#fff", "&[dataSelected]": { background: "#3a3e1e" }, "&[dataHovered]": { background: "#2e3218" } },
              }}
            />

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
            <Button variant="outline" color="gray" onClick={closeFormModal}>Cancel</Button>
            <Button
              type="submit"
              variant="filled"
              style={{ background: "#DDD1B1", color: "#191A22", fontWeight: 700 }}
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editingGame ? "Save Changes" : "Add Game"}
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
          ? This action cannot be undone.
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
