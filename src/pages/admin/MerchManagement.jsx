import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getMerchs, createMerch, updateMerch, deleteMerch } from "../../store/actions/adminActions";
import { toast } from "sonner";
import ConfirmModal from "../../components/ConfirmModal";
import { useTranslation } from "react-i18next";

export default function MerchManagement() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [replaceIndex, setReplaceIndex] = useState(null);
  const [newMerch, setNewMerch] = useState({ name: "", description: "", price: 0, sizes: [] });

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editMerch, setEditMerch] = useState({ id: null, name: "", description: "", price: 0, sizes: [] });
  const [editSelectedFiles, setEditSelectedFiles] = useState([]);

  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });

  const toggleSize = (s) =>
    setNewMerch((m) =>
      m.sizes.includes(s)
        ? { ...m, sizes: m.sizes.filter((x) => x !== s) }
        : { ...m, sizes: [...m.sizes, s] }
    );
  const dispatch = useDispatch();
  const { merchs: merchItems, isLoadingMerchs, isCreatingMerch, isUpdatingMerch } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getMerchs());
  }, [dispatch]);

  const inStockCount = merchItems.filter((i) => i.stock === "in stock" || i.stock === "In Stock").length;

  const handleFileSelect = (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      if (replaceIndex !== null) {
        setSelectedFiles((prev) => {
          const newFiles = [...prev];
          newFiles.splice(replaceIndex, files.length, ...files);
          return newFiles.slice(0, 3);
        });
        setReplaceIndex(null);
      } else {
        setSelectedFiles((prev) => [...prev, ...files].slice(0, 3));
      }
    }
    e.target.value = null;
  };
  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files].slice(0, 3));
    }
    setReplaceIndex(null);
  };
  const handleDragOver = (e) => e.preventDefault();
  const handleUpload = async () => {
    if (!newMerch.name || !newMerch.price || newMerch.sizes.length === 0) {
      toast.error(t('merch.messages.missing_fields'));
      return;
    }
    if (selectedFiles.length === 0) {
      toast.error(t('merch.messages.missing_image'));
      return;
    }

    const formData = new FormData();
    formData.append("name", newMerch.name);
    formData.append("description", newMerch.description);
    formData.append("price", newMerch.price);
    formData.append("sizes", newMerch.sizes.join(","));

    formData.append("cover_img", selectedFiles[0]);
    selectedFiles.forEach((file) => {
      formData.append("image", file);
    });

    const res = await dispatch(createMerch(formData));

    if (res?.success) {
      toast.success(t('merch.messages.upload_success'));
      setNewMerch({ name: "", description: "", price: 0, sizes: [] });
      setSelectedFiles([]);
      dispatch(getMerchs()); // Refresh list
    } else {
      toast.error(res?.message || t('merch.messages.upload_failed'));
    }
  };

  const handleEditFileSelect = (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      if (replaceIndex !== null) {
        setEditSelectedFiles((prev) => {
          const newFiles = [...prev];
          newFiles.splice(replaceIndex, files.length, ...files);
          return newFiles.slice(0, 3);
        });
        setReplaceIndex(null);
      } else {
        setEditSelectedFiles((prev) => [...prev, ...files].slice(0, 3));
      }
    }
    e.target.value = null;
  };

  const handleEditUpload = async () => {
    if (!editMerch.name || !editMerch.price || editMerch.sizes.length === 0) {
      toast.error(t('merch.messages.missing_fields'));
      return;
    }

    const formData = new FormData();
    formData.append("name", editMerch.name);
    formData.append("description", editMerch.description);
    formData.append("price", editMerch.price);
    formData.append("sizes", editMerch.sizes.join(","));

    if (editSelectedFiles.length > 0) {
      if (editSelectedFiles[0] instanceof File) {
        formData.append("cover_img", editSelectedFiles[0]);
      } else {
        formData.append("existing_cover", editSelectedFiles[0]);
      }

      editSelectedFiles.forEach((file) => {
        if (file instanceof File) {
          formData.append("image", file);
          formData.append("existing_images", "NEW_FILE");
        } else {
          formData.append("existing_images", file);
        }
      });
    }

    const res = await dispatch(updateMerch(editMerch.id, formData));

    if (res?.success) {
      toast.success(t('merch.messages.update_success'));
      setEditMerch({ id: null, name: "", description: "", price: 0, sizes: [] });
      setEditSelectedFiles([]);
      setEditModalOpen(false);
      dispatch(getMerchs());
    } else {
      toast.error(res?.message || t('merch.messages.update_failed'));
    }
  };

  const handleEdit = (item) => {
    setEditMerch({
      id: item._id,
      name: item.name,
      description: item.description || "",
      price: item.price,
      sizes: item.sizes || [],
    });
    setEditSelectedFiles(item.images ? [...item.images] : (item.prod_image ? [item.prod_image] : []));
    setEditModalOpen(true);
  };

  const handleView = (item) => {
    setViewItem(item);
    setViewModalOpen(true);
  };

  const handleDelete = (id) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    const res = await dispatch(deleteMerch(deleteConfirm.id));
    if (res?.success) {
      toast.success(t('merch.messages.delete_success'));
    } else {
      toast.error(res?.message || t('merch.messages.delete_failed'));
    }
    setDeleteConfirm({ isOpen: false, id: null });
  };

  return (
    <div className="app alexandria-font">
      <style>{`
        :root{
          --olive:#525132;
          --tan:#CBC895;
          --yellow:#EBE23C;
          --yellow2:#FFF069;
          --yellow3:#FFF999;
          --header-dark:#2F2D0E;
          --table-dark:#131319;
          --green:#12E008;
          --green2:#55DF55;
          --cyan:#5ACFB5;
          --red:#EB181B;
          --button:#DDD1B1;
          --text:#ffffff;
          --ink:#191A22;
        }
        *{box-sizing:border-box}
        body,html,#root{height:100%}
        .app{
          min-height:100vh;
          background:var(--olive);
          color:var(--text);
        }
        .container{max-width:1200px;margin:0 auto;}
        .pixel{font-family:"Press Start 2P", monospace}
        .upload{
          border:3px dashed var(--tan);
        }
        .upload-inner{
          padding:4rem 1rem;
          display:flex;flex-direction:column;align-items:center;gap:2rem;
        }
        .upload-title{
          color:var(--yellow);
          text-align:center;
          font-size:22px;line-height:1.25;
          text-shadow:0 0 0 #000;
        }
        .icons{display:flex;gap:1rem}
        .icon-box{
          width:55px;height:55px;border:2.17px solid var(--tan);
          display:flex;align-items:center;justify-content:center;background:transparent
        }
        .btn{
          background:var(--button);color:var(--ink);
          font-weight:700;border-radius:8px;
          box-shadow:0 7px 2px 0 #000;
          padding:.9rem 1.75rem;border:none;cursor:pointer
        }
        .btn:active{transform:translateY(2px);box-shadow:0 5px 2px 0 #000}
        .inventory{background:rgba(181,179,135,0.16); border-top:1px solid var(--tan)}
        .inv-head{background:var(--header-dark);border-bottom:1px solid var(--tan)}
        .inv-head-row{display:flex;flex-direction:column;gap:1rem; padding:1.25rem 0}
        .inv-title{font-size:23px}
        .stats{color:var(--yellow2)}
        .table-head{background:var(--table-dark)}
        .head-grid{
          display:grid;align-items:center;
          grid-template-columns:80px 1fr 200px 200px 200px 180px;
          gap:2rem;padding:1.25rem 0;
        }
        .head-cell{color:var(--tan);font-size:20px}
        .row{
          border-bottom:1px solid var(--tan);
          background:rgba(197,194,116,0.16);
        }
        .row-grid{
          display:grid;align-items:center;
          grid-template-columns:80px 1fr 200px 200px 200px 180px;
          gap:2rem;padding:1.25rem 0;
        }
        .size{background:rgba(188,185,137,0.24);min-width:42px;padding:.5rem .75rem;
          text-align:center;color:var(--yellow3)}
        .price{color:var(--cyan)}
        .stock.in{color:var(--green)}
        .stock.out{color:var(--red)}
        .actions{display:flex;gap:.5rem}
        .a-btn{
          width:42px;height:37px;display:flex;align-items:center;justify-content:center;background:transparent;
          border:2px solid currentColor;cursor:pointer
        }
        .a-green{color:var(--green2)}
        .a-yellow{color:#FFEF2E}
        .a-red{color:var(--red); background:rgba(235,24,27,0.13)}
        .preview{width:57px;height:57px;object-fit:cover}

        /* Modal specific styles */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.85);
          display: flex; justify-content: center; align-items: center;
          z-index: 1000; padding: 1rem;
        }
        .modal-content {
          background: var(--header-dark); border: 2px solid var(--tan);
          border-radius: 8px; width: 100%; max-width: 600px;
          max-height: 90vh; overflow-y: auto; padding: 2rem;
          position: relative; box-shadow: 0 10px 25px rgba(0,0,0,0.8);
        }
        .modal-close {
          position: absolute; top: 1rem; right: 1rem;
          background: transparent; border: none; color: var(--tan);
          cursor: pointer; padding: 0.5rem; display: flex;
        }
        .modal-close:hover { color: var(--red); }

        /* Responsive - keep table horizontal with scroll */
        @media (max-width: 1199px){
          .table-head{display:block}
          .container{overflow-x:auto}
          .head-grid,.row-grid{
            display:grid;
            grid-template-columns:80px minmax(200px,1fr) 140px 140px 140px 120px;
            gap:1rem;
            padding:1rem 0;
            min-width:840px;
          }
          .row{border:1px solid var(--tan); margin:.75rem 0; padding:.75rem; border-radius:10px}
          .card-top{display:none}
        }
      `}</style>

      {/* Upload */}
      <section className="upload">
        <div className="container">
          <div
            className="upload-inner"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/2e4a5db8a86a7da228747b29219a3f98d0d41ea7?width=181"
              alt="tshirt icon"
              width={90}
              height={90}
            />
            <h1 className="upload-title pixel">
              {t('merch.upload.drag_drop')}
            </h1>

            <div
              className="icons"
              onClick={() => {
                setReplaceIndex(null);
                document.getElementById("file-input")?.click();
              }}
            >
              {[0, 1, 2].map((i) => (
                <div 
                  className="icon-box" 
                  key={i} 
                  aria-hidden
                  onClick={(e) => {
                    e.stopPropagation();
                    setReplaceIndex(i);
                    document.getElementById("file-input")?.click();
                  }}
                >
                  {selectedFiles[i] ? (
                    <img 
                      src={URL.createObjectURL(selectedFiles[i])} 
                      alt={`preview-${i}`} 
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                    />
                  ) : (
                    <TeeIcon />
                  )}
                </div>
              ))}
            </div>

            <input
              id="file-input"
              type="file"
              accept="image/png,image/jpeg"
              multiple
              onChange={handleFileSelect}
              hidden
            />

            <button className="btn" onClick={() => document.getElementById("file-input")?.click()}>{t('merch.upload.select_files')}</button>
            {selectedFiles.length > 0 && (
              <div className="stats" style={{ fontSize: 14 }}>
                {t('merch.upload.files_selected', { count: selectedFiles.length })}
              </div>
            )}     
                                                                                                                                                                                                       
            {/* Inline form fields */}
            <div style={{ width: "100%", maxWidth: 720, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <label style={{ display: "grid", gap: "0.4rem", color: "var(--tan)" }}>
                <span style={{ fontSize: 11, fontFamily: '"Press Start 2P", monospace', textTransform: "uppercase" }}>{t('merch.upload.name_label')}</span>
                <input
                  value={newMerch.name}
                  onChange={(e) => setNewMerch((m) => ({ ...m, name: e.target.value }))}
                  placeholder={t('merch.upload.name_placeholder')}
                  style={{ background: "#0f1016", color: "#fff", border: "2px solid var(--tan)", borderRadius: 6, padding: "0.7rem 0.85rem", width: "100%" }}
                />                                                                                                                                                              
              </label>
              <label style={{ display: "grid", gap: "0.4rem", color: "var(--tan)" }}>
                <span style={{ fontSize: 11, fontFamily: '"Press Start 2P", monospace', textTransform: "uppercase" }}>{t('merch.upload.price_label')}</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={newMerch.price}
                  onChange={(e) => setNewMerch((m) => ({ ...m, price: Number(e.target.value) }))}
                  style={{ background: "#0f1016", color: "#fff", border: "2px solid var(--tan)", borderRadius: 6, padding: "0.7rem 0.85rem", width: "100%" }}
                />                                                                                 
              </label>
              <label style={{ display: "grid", gap: "0.4rem", color: "var(--tan)", gridColumn: "1 / -1" }}>
                <span style={{ fontSize: 11, fontFamily: '"Press Start 2P", monospace', textTransform: "uppercase" }}>{t('merch.upload.description_label')}</span>
                <textarea
                  value={newMerch.description}
                  onChange={(e) => setNewMerch((m) => ({ ...m, description: e.target.value }))}
                  placeholder={t('merch.upload.description_placeholder')}
                  rows={3}
                  style={{ background: "#0f1016", color: "#fff", border: "2px solid var(--tan)", borderRadius: 6, padding: "0.7rem 0.85rem", width: "100%", resize: "vertical" }}
                />
              </label>
              <div style={{ display: "grid", gap: "0.4rem", color: "var(--tan)", gridColumn: "1 / -1" }}>
                <span style={{ fontSize: 11, fontFamily: '"Press Start 2P", monospace', textTransform: "uppercase" }}>{t('merch.upload.sizes_label')}</span>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {["S", "M", "L", "XL"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSize(s)}
                      style={{
                        background: newMerch.sizes.includes(s) ? "var(--yellow2)" : "#0f1016",
                        color: newMerch.sizes.includes(s) ? "#191A22" : "#fff",
                        border: "2px solid var(--tan)",
                        borderRadius: 6,
                        padding: "0.5rem 0.85rem",
                        minWidth: 44,
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
              <button 
                className="btn" 
                onClick={handleUpload} 
                disabled={isCreatingMerch}
                style={{ background: "var(--yellow)", color: "var(--ink)", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: 14, opacity: isCreatingMerch ? 0.7 : 1 }}
              >
                <UploadArrowIcon /> {isCreatingMerch ? t('merch.upload.uploading') : t('merch.upload.button')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Inventory */}
      <section className="inventory">
        <div className="inv-head">
          <div className="container inv-head-row">
            <div
              className="pixel inv-title"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <span>{t('merch.inventory.title')}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span className="stats">
                  {t('merch.inventory.stats.total_items', { count: merchItems.length })} | {t('merch.inventory.stats.in_stock', { count: inStockCount })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop header */}
        <div className="table-head">
          <div className="container">
            <div className="head-grid">
              {["PREVIEW", "PRODUCT NAME", "PRICE", "SIZES", "STOCK", "ACTIONS"].map(
                (h) => (
                  <div key={h} className="pixel head-cell">
                    {t(`merch.inventory.table.${h.toLowerCase().replace(' ', '_')}`)}
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Rows */}
        <div className="container">
          {merchItems.map((item) => (
            <div className="row" key={item.id}>
              {/* Desktop row */}
              <div className="row-grid">
                <img className="preview" src={item.prod_image || item.image} alt={item.name} />
                <div style={{ fontSize: 20 }}>{item.name}</div>
                <div className="price" style={{ fontSize: 20 }}>
                  €{item.price}
                </div>
                <div className="sizes" style={{ display: "flex", gap: "8px" }}>
                  {(item.sizes || []).map((s) => (
                    <div className="size" key={s}>
                      {s}
                    </div>
                  ))}
                </div>
                <div
                  className={`stock ${item.stock === "in stock" || item.stock === "In Stock" ? "in" : "out"}`}
                  style={{ fontSize: 20, textTransform: "capitalize" }}
                >
                  {item.stock}
                </div>
                <div className="actions">
                  <button className="a-btn a-green" aria-label="View" onClick={() => handleView(item)}>
                    <EyeIcon />
                  </button>
                  <button className="a-btn a-yellow" aria-label="Edit" onClick={() => handleEdit(item)}>
                    <PencilIcon />
                  </button>
                  <button 
                    className="a-btn a-red" 
                    aria-label="Delete"
                    onClick={() => handleDelete(item._id)}
                  >
                    <XIcon />
                  </button>
                </div>
              </div>

              {/* Mobile card layout */}
              <div className="card-top" style={{ display: "none" }} />
            </div>
          ))}
        </div>
      </section>

      {/* View Modal */}
      {viewModalOpen && viewItem && (
        <div className="modal-overlay" onClick={() => setViewModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setViewModalOpen(false)}>
              <XIcon />
            </button>
            <h2 className="pixel" style={{ color: "var(--yellow)", marginBottom: "1.5rem" }}>{t('merch.modals.view_title')}</h2>
            <div style={{ display: "flex", gap: "2rem", flexDirection: "column", alignItems: "center" }}>
              <img src={viewItem.prod_image || viewItem.image} alt={viewItem.name} style={{ width: "200px", height: "200px", objectFit: "contain", background: "rgba(0,0,0,0.5)", borderRadius: "8px", padding: "1rem" }} />
              <div style={{ width: "100%", display: "grid", gap: "1rem" }}>
                <div><span style={{ color: "var(--tan)", fontSize: "12px", textTransform: "uppercase", fontFamily: '"Press Start 2P"' }}>{t('merch.upload.name_label')}</span><div style={{ fontSize: "20px", marginTop: "0.25rem" }}>{viewItem.name}</div></div>
                <div><span style={{ color: "var(--tan)", fontSize: "12px", textTransform: "uppercase", fontFamily: '"Press Start 2P"' }}>{t('merch.upload.price_label')}</span><div style={{ fontSize: "20px", marginTop: "0.25rem", color: "var(--cyan)" }}>€{viewItem.price}</div></div>
                <div><span style={{ color: "var(--tan)", fontSize: "12px", textTransform: "uppercase", fontFamily: '"Press Start 2P"' }}>{t('merch.upload.sizes_label')}</span><div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>{(viewItem.sizes || []).map(s => <span className="size" key={s}>{s}</span>)}</div></div>
                <div><span style={{ color: "var(--tan)", fontSize: "12px", textTransform: "uppercase", fontFamily: '"Press Start 2P"' }}>{t('merch.inventory.table.stock')}</span><div className={`stock ${(viewItem.stock || "").toLowerCase() === "in stock" ? "in" : "out"}`} style={{ fontSize: "20px", marginTop: "0.25rem", textTransform: "capitalize" }}>{viewItem.stock}</div></div>
                <div><span style={{ color: "var(--tan)", fontSize: "12px", textTransform: "uppercase", fontFamily: '"Press Start 2P"' }}>{t('merch.upload.description_label')}</span><div style={{ fontSize: "16px", marginTop: "0.25rem", color: "#ccc", whiteSpace: "pre-wrap" }}>{viewItem.description || "N/A"}</div></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && editMerch && (
        <div className="modal-overlay" onClick={() => setEditModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setEditModalOpen(false)}>
              <XIcon />
            </button>
            <h2 className="pixel" style={{ color: "var(--yellow)", marginBottom: "1.5rem" }}>{t('merch.modals.edit_title')}</h2>
            
            <div style={{ display: "grid", gap: "1rem" }}>
              <label style={{ display: "grid", gap: "0.4rem", color: "var(--tan)" }}>
                <span style={{ fontSize: 11, fontFamily: '"Press Start 2P", monospace', textTransform: "uppercase" }}>{t('merch.upload.name_label')}</span>
                <input
                  value={editMerch.name}
                  onChange={(e) => setEditMerch((m) => ({ ...m, name: e.target.value }))}
                  style={{ background: "#0f1016", color: "#fff", border: "2px solid var(--tan)", borderRadius: 6, padding: "0.7rem 0.85rem", width: "100%" }}
                />                                                                                                                                                              
              </label>
              <label style={{ display: "grid", gap: "0.4rem", color: "var(--tan)" }}>
                <span style={{ fontSize: 11, fontFamily: '"Press Start 2P", monospace', textTransform: "uppercase" }}>{t('merch.upload.price_label')}</span>
                <input
                  type="number" min={0} step="0.01"
                  value={editMerch.price}
                  onChange={(e) => setEditMerch((m) => ({ ...m, price: Number(e.target.value) }))}
                  style={{ background: "#0f1016", color: "#fff", border: "2px solid var(--tan)", borderRadius: 6, padding: "0.7rem 0.85rem", width: "100%" }}
                />                                                                                 
              </label>
              <label style={{ display: "grid", gap: "0.4rem", color: "var(--tan)" }}>
                <span style={{ fontSize: 11, fontFamily: '"Press Start 2P", monospace', textTransform: "uppercase" }}>{t('merch.upload.description_label')}</span>
                <textarea
                  value={editMerch.description}
                  onChange={(e) => setEditMerch((m) => ({ ...m, description: e.target.value }))}
                  rows={3}
                  style={{ background: "#0f1016", color: "#fff", border: "2px solid var(--tan)", borderRadius: 6, padding: "0.7rem 0.85rem", width: "100%", resize: "vertical" }}
                />
              </label>

              <div style={{ display: "grid", gap: "0.4rem", color: "var(--tan)" }}>
                <span style={{ fontSize: 11, fontFamily: '"Press Start 2P", monospace', textTransform: "uppercase" }}>{t('merch.upload.sizes_label')}</span>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {["S", "M", "L", "XL"].map((s) => (
                    <button
                      key={s} type="button"
                      onClick={() => setEditMerch(m => ({ ...m, sizes: m.sizes.includes(s) ? m.sizes.filter(x => x !== s) : [...m.sizes, s] }))}
                      style={{
                        background: editMerch.sizes.includes(s) ? "var(--yellow2)" : "#0f1016",
                        color: editMerch.sizes.includes(s) ? "#191A22" : "#fff",
                        border: "2px solid var(--tan)", borderRadius: 6, padding: "0.5rem 0.85rem", cursor: "pointer", fontWeight: 700, fontSize: 13,
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gap: "0.4rem", color: "var(--tan)" }}>
                <span style={{ fontSize: 11, fontFamily: '"Press Start 2P", monospace', textTransform: "uppercase" }}>{t('merch.upload.merch_images_label') || "Merch Images"}</span>
                <div
                  className="icons"
                  style={{ justifyContent: "center" }}
                  onClick={() => {
                    setReplaceIndex(null);
                    document.getElementById("edit-file-input")?.click();
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <div 
                      className="icon-box" 
                      key={i} 
                      aria-hidden
                      onClick={(e) => {
                        e.stopPropagation();
                        setReplaceIndex(i);
                        document.getElementById("edit-file-input")?.click();
                      }}
                    >
                      {editSelectedFiles[i] ? (
                        <img 
                          src={typeof editSelectedFiles[i] === 'string' ? editSelectedFiles[i] : URL.createObjectURL(editSelectedFiles[i])} 
                          alt={`preview-${i}`} 
                          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                        />
                      ) : (
                        <TeeIcon />
                      )}
                    </div>
                  ))}
                </div>
                <input
                  id="edit-file-input"
                  type="file" accept="image/png,image/jpeg" multiple
                  onChange={handleEditFileSelect}
                  hidden
                />
                <div style={{ textAlign: "center", color: "var(--green2)", fontSize: 12 }}>
                  {t('merch.upload.files_selected', { count: editSelectedFiles.length })}
                </div>
              </div>

              <button 
                className="btn" 
                onClick={handleEditUpload} 
                disabled={isUpdatingMerch}
                style={{ marginTop: "1rem", background: "var(--yellow)", color: "var(--ink)", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.8rem", fontSize: 14, opacity: isUpdatingMerch ? 0.7 : 1 }}
              >
                <PencilIcon /> {isUpdatingMerch ? t('merch.modals.updating') : t('merch.modals.save_changes')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal 
        isOpen={deleteConfirm.isOpen}
        title={t('merch.modals.delete_title')}
        message={t('merch.modals.delete_message')}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null })}
      />

    </div>
  );
}

/* Inline SVGs (no external deps) */
function UploadArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
function TeeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
      <path
        d="M30 6l10 4a3 3 0 011.9 2.8V18h-5v18a4 4 0 01-4 4H15a4 4 0 01-4-4V18H6v-5.2A3 3 0 017.9 10L18 6a6 6 0 006 4 6 6 0 006-4z"
        fill="#CBC895"
      />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
      <path
        d="M20 8C11 8 4.5 16 4 20c.5 4 7 12 16 12s15.5-8 16-12c-.5-4-7-12-16-12zm0 18a6 6 0 110-12 6 6 0 010 12z"
        fill="currentColor"
      />
    </svg>
  );
}
function PencilIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
      <path
        d="M24 8l8 8-16 16H8v-8L24 8zm10-2a3 3 0 00-4 0l-2 2 8 8 2-2a3 3 0 000-4l-4-4z"
        fill="currentColor"
      />
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
      <path
        d="M12 12l16 16M28 12L12 28"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
