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
  const [coverIndex, setCoverIndex] = useState(0);
  const AVAIL_SIZES = ["S", "M", "L", "XL"];
  const [newMerch, setNewMerch] = useState({ name: "", description: "", price: 0, sizes: [], sizeQtys: { S: 0, M: 0, L: 0, XL: 0 }, stock: "in stock" });

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editMerch, setEditMerch] = useState({ id: null, name: "", description: "", price: 0, sizes: [], sizeQtys: { S: 0, M: 0, L: 0, XL: 0 }, stock: "in stock" });
  const [editSelectedFiles, setEditSelectedFiles] = useState([]);
  const [editCoverIndex, setEditCoverIndex] = useState(0);

  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });

  const dispatch = useDispatch();
  const { merchs: merchItems, isLoadingMerchs, isCreatingMerch, isUpdatingMerch } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getMerchs());
  }, [dispatch]);

  const inStockCount = merchItems.filter((i) => i.stock === "in stock" || i.stock === "In Stock").length;

  const handleFileSelect = (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);
    }
    e.target.value = null;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const moveImage = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= selectedFiles.length) return;
    setSelectedFiles((prev) => {
      const newList = [...prev];
      const temp = newList[index];
      newList[index] = newList[targetIndex];
      newList[targetIndex] = temp;
      return newList;
    });
    if (coverIndex === index) {
      setCoverIndex(targetIndex);
    } else if (coverIndex === targetIndex) {
      setCoverIndex(index);
    }
  };

  const removeImage = (index) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== index));
    if (coverIndex === index) {
      setCoverIndex(0);
    } else if (coverIndex > index) {
      setCoverIndex((prev) => prev - 1);
    }
  };

  const handleUpload = async () => {
    if (!newMerch.name || !newMerch.price) {
      toast.error(t('merch.messages.missing_fields'));
      return;
    }
    if (selectedFiles.length === 0) {
      toast.error(t('merch.messages.missing_image'));
      return;
    }

    const sizes = AVAIL_SIZES.filter(s => (newMerch.sizeQtys[s] || 0) > 0);
    const formData = new FormData();
    formData.append("name", newMerch.name);
    formData.append("description", newMerch.description);
    formData.append("price", newMerch.price);
    formData.append("sizes", sizes.join(","));
    formData.append("size_quantities", JSON.stringify(newMerch.sizeQtys));
    formData.append("stock", newMerch.stock || "in stock");

    formData.append("cover_img", selectedFiles[coverIndex]);
    selectedFiles.forEach((file) => {
      formData.append("image", file);
    });

    const res = await dispatch(createMerch(formData));

    if (res?.success) {
      toast.success(t('merch.messages.upload_success'));
      setNewMerch({ name: "", description: "", price: 0, sizes: [], sizeQtys: { S: 0, M: 0, L: 0, XL: 0 }, stock: "in stock" });
      setSelectedFiles([]);
      setCoverIndex(0);
      dispatch(getMerchs()); // Refresh list
    } else {
      toast.error(res?.message || t('merch.messages.upload_failed'));
    }
  };

  const handleEditFileSelect = (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      setEditSelectedFiles((prev) => [...prev, ...files]);
    }
    e.target.value = null;
  };

  const moveEditImage = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= editSelectedFiles.length) return;
    setEditSelectedFiles((prev) => {
      const newList = [...prev];
      const temp = newList[index];
      newList[index] = newList[targetIndex];
      newList[targetIndex] = temp;
      return newList;
    });
    if (editCoverIndex === index) {
      setEditCoverIndex(targetIndex);
    } else if (editCoverIndex === targetIndex) {
      setEditCoverIndex(index);
    }
  };

  const removeEditImage = (index) => {
    setEditSelectedFiles((prev) => prev.filter((_, idx) => idx !== index));
    if (editCoverIndex === index) {
      setEditCoverIndex(0);
    } else if (editCoverIndex > index) {
      setEditCoverIndex((prev) => prev - 1);
    }
  };

  const handleEditUpload = async () => {
    if (!editMerch.name || !editMerch.price) {
      toast.error(t('merch.messages.missing_fields'));
      return;
    }

    const editSizes = AVAIL_SIZES.filter(s => (editMerch.sizeQtys[s] || 0) > 0);
    const formData = new FormData();
    formData.append("name", editMerch.name);
    formData.append("description", editMerch.description);
    formData.append("price", editMerch.price);
    formData.append("sizes", editSizes.join(","));
    formData.append("size_quantities", JSON.stringify(editMerch.sizeQtys));
    formData.append("stock", editMerch.stock || "in stock");

    if (editSelectedFiles.length > 0) {
      const coverItem = editSelectedFiles[editCoverIndex];
      if (coverItem instanceof File) {
        formData.append("cover_img", coverItem);
      } else {
        formData.append("existing_cover", coverItem);
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
      setEditMerch({ id: null, name: "", description: "", price: 0, sizes: [], sizeQtys: { S: 0, M: 0, L: 0, XL: 0 }, stock: "in stock" });
      setEditSelectedFiles([]);
      setEditCoverIndex(0);
      setEditModalOpen(false);
      dispatch(getMerchs());
    } else {
      toast.error(res?.message || t('merch.messages.update_failed'));
    }
  };

  const handleEdit = (item) => {
    const sizeQtys = { S: 0, M: 0, L: 0, XL: 0 };
    if (item.size_quantities && typeof item.size_quantities === "object") {
      Object.assign(sizeQtys, item.size_quantities);
    } else {
      (item.sizes || []).forEach(s => { if (s in sizeQtys) sizeQtys[s] = 1; });
    }
    setEditMerch({
      id: item._id,
      name: item.name,
      description: item.description || "",
      price: item.price,
      sizes: item.sizes || [],
      sizeQtys,
      stock: item.stock || "in stock",
    });
    const images = item.images ? [...item.images] : (item.prod_image ? [item.prod_image] : []);
    setEditSelectedFiles(images);
    const coverIdx = images.findIndex(img => img === item.prod_image);
    setEditCoverIndex(coverIdx >= 0 ? coverIdx : 0);
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
          --olive:#1A1A23;
          --tan:#B5B387;
          --yellow:#EBE23C;
          --yellow2:#F6F4D3;
          --yellow3:#FFF999;
          --header-dark:#2F2E24;
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
          border:2px dashed rgba(181,179,135,0.35);
          background:var(--header-dark);
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
          width:55px;height:55px;border:2.17px solid rgba(181,179,135,0.4);
          display:flex;align-items:center;justify-content:center;background:transparent
        }
        .btn{
          background:var(--button);color:var(--ink);
          font-weight:700;border-radius:0;
          box-shadow:0 7px 2px 0 #000;
          padding:.9rem 1.75rem;border:none;cursor:pointer
        }
        .btn:active{transform:translateY(2px);box-shadow:0 5px 2px 0 #000}
        .inventory{background:var(--olive); border-top:1px solid rgba(181,179,135,0.3)}
        .inv-head{background:var(--header-dark);border-bottom:1px solid rgba(181,179,135,0.3)}
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
          border-bottom:1px solid rgba(181,179,135,0.2);
          background:rgba(181,179,135,0.04);
        }
        .row-grid{
          display:grid;align-items:center;
          grid-template-columns:80px 1fr 200px 200px 200px 180px;
          gap:2rem;padding:1.25rem 0;
        }
        .size{background:rgba(181,179,135,0.15);min-width:42px;padding:.5rem .75rem;
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
        .hover-overlay { opacity: 0; }
        div:hover > .hover-overlay { opacity: 1 !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }

        /* Modal specific styles */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.85);
          display: flex; justify-content: center; align-items: center;
          z-index: 1000; padding: 1rem;
        }
        .modal-content {
          background: var(--header-dark); border: 2px solid rgba(181,179,135,0.35);
          border-radius: 0; width: 100%; max-width: 600px;
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
          .row{border:1px solid rgba(181,179,135,0.2); margin:.75rem 0; padding:.75rem; border-radius:0}
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

            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center", width: "100%", maxWidth: "720px", marginBottom: "1.5rem" }}>
              {selectedFiles.map((file, idx) => {
                const isMain = coverIndex === idx;
                const previewUrl = URL.createObjectURL(file);
                return (
                  <div 
                    key={idx}
                    style={{ 
                      width: "120px", 
                      height: "120px", 
                      border: isMain ? "3px solid var(--yellow)" : "2px solid rgba(181,179,135,0.4)",
                      position: "relative",
                      background: "rgba(0,0,0,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      borderRadius: "0"
                    }}
                  >
                    <img src={previewUrl} alt={`preview-${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    
                    {/* Top Main Badge */}
                    {isMain && (
                      <span style={{ position: "absolute", top: "4px", left: "4px", background: "var(--yellow)", color: "var(--ink)", padding: "2px 6px", fontSize: "9px", fontFamily: '"Press Start 2P"', fontWeight: "bold", borderRadius: "3px" }}>
                        MAIN
                      </span>
                    )}

                    {/* Hover controls overlay */}
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "4px", opacity: 0, transition: "opacity 0.2s" }} className="hover-overlay">
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        {!isMain && (
                          <button 
                            type="button"
                            onClick={() => setCoverIndex(idx)}
                            style={{ background: "var(--yellow)", border: "none", color: "var(--ink)", fontSize: "9px", padding: "2px 4px", cursor: "pointer", fontWeight: "bold" }}
                          >
                            Set Main
                          </button>
                        )}
                        <button 
                          type="button"
                          onClick={() => removeImage(idx)}
                          style={{ background: "var(--red)", border: "none", color: "white", fontSize: "10px", padding: "2px 6px", cursor: "pointer", fontWeight: "bold", marginLeft: "auto" }}
                        >
                          X
                        </button>
                      </div>
                      
                      {/* Left/Right movement buttons */}
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                        <button 
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveImage(idx, -1)}
                          style={{ background: idx === 0 ? "#555" : "var(--button)", color: "var(--ink)", border: "none", width: "24px", height: "24px", cursor: idx === 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}
                        >
                          &lt;
                        </button>
                        <button 
                          type="button"
                          disabled={idx === selectedFiles.length - 1}
                          onClick={() => moveImage(idx, 1)}
                          style={{ background: idx === selectedFiles.length - 1 ? "#555" : "var(--button)", color: "var(--ink)", border: "none", width: "24px", height: "24px", cursor: idx === selectedFiles.length - 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}
                        >
                          &gt;
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* "+ Add Image" button */}
              <div 
                onClick={() => document.getElementById("file-input")?.click()}
                style={{ 
                  width: "120px", 
                  height: "120px", 
                  border: "2px dashed rgba(181,179,135,0.35)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  borderRadius: "0",
                  background: "rgba(181,179,135,0.06)",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(181,179,135,0.12)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(181,179,135,0.06)"}
              >
                <span style={{ fontSize: "28px", color: "var(--tan)", lineHeight: 1 }}>+</span>
                <span style={{ fontSize: "9px", fontFamily: '"Press Start 2P"', color: "var(--tan)", marginTop: "4px" }}>ADD IMAGE</span>
              </div>
            </div>

            <input
              id="file-input"
              type="file"
              accept="image/png,image/jpeg"
              multiple
              onChange={handleFileSelect}
              hidden
            />
            
            <div style={{ width: "100%", maxWidth: 720, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <label style={{ display: "grid", gap: "0.4rem", color: "var(--tan)" }}>
                <span style={{ fontSize: 11, fontFamily: '"Press Start 2P", monospace', textTransform: "uppercase" }}>{t('merch.upload.name_label')}</span>
                <input
                  value={newMerch.name}
                  onChange={(e) => setNewMerch((m) => ({ ...m, name: e.target.value }))}
                  placeholder={t('merch.upload.name_placeholder')}
                  style={{ background: "#0f1016", color: "#fff", border: "1px solid rgba(181,179,135,0.35)", borderRadius: 0, padding: "0.7rem 0.85rem", width: "100%" }}
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
                  style={{ background: "#0f1016", color: "#fff", border: "1px solid rgba(181,179,135,0.35)", borderRadius: 0, padding: "0.7rem 0.85rem", width: "100%" }}
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
              <div style={{ display: "grid", gap: "0.4rem", color: "var(--tan)" }}>
                <span style={{ fontSize: 11, fontFamily: '"Press Start 2P", monospace', textTransform: "uppercase" }}>{t('merch.upload.sizes_label')}</span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, maxWidth: 320 }}>
                  {AVAIL_SIZES.map((s) => {
                    const qty = newMerch.sizeQtys[s] || 0;
                    const active = qty > 0;
                    return (
                      <div key={s} style={{ display: "flex", alignItems: "center", background: "#0f1016", border: `1px solid ${active ? "var(--tan)" : "rgba(203,200,149,0.3)"}`, overflow: "hidden" }}>
                        <div style={{ width: 36, height: 40, display: "flex", alignItems: "center", justifyContent: "center", background: active ? "var(--tan)" : "rgba(203,200,149,0.1)", color: active ? "#191A22" : "rgba(203,200,149,0.5)", fontFamily: '"Press Start 2P"', fontSize: 9, fontWeight: 700, flexShrink: 0, transition: "all 0.15s" }}>
                          {s}
                        </div>
                        <button
                          type="button"
                          onClick={() => { const v = Math.max(0, qty - 1); setNewMerch(m => ({ ...m, sizeQtys: { ...m.sizeQtys, [s]: v } })); }}
                          style={{ width: 32, height: 40, background: "transparent", border: "none", borderLeft: "1px solid rgba(203,200,149,0.15)", color: "var(--tan)", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, flexShrink: 0 }}
                        >−</button>
                        <div style={{ flex: 1, height: 40, display: "flex", alignItems: "center", justifyContent: "center", color: active ? "#fff" : "rgba(255,255,255,0.25)", fontWeight: 700, fontSize: 14, borderLeft: "1px solid rgba(203,200,149,0.15)", borderRight: "1px solid rgba(203,200,149,0.15)" }}>
                          {qty}
                        </div>
                        <button
                          type="button"
                          onClick={() => setNewMerch(m => ({ ...m, sizeQtys: { ...m.sizeQtys, [s]: qty + 1 } }))}
                          style={{ width: 32, height: 40, background: "transparent", border: "none", color: "var(--tan)", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, flexShrink: 0 }}
                        >+</button>
                      </div>
                    );
                  })}
                </div>
                <span style={{ fontSize: 9, color: "var(--tan)", opacity: 0.65, fontFamily: '"Press Start 2P"' }}>QTY PER SIZE · 0 = UNAVAILABLE</span>
              </div>
              <div style={{ display: "grid", gap: "0.4rem", color: "var(--tan)" }}>
                <span style={{ fontSize: 11, fontFamily: '"Press Start 2P", monospace', textTransform: "uppercase" }}>Stock Status</span>
                <div style={{ position: "relative", height: 44 }}>
                  <select
                    value={newMerch.stock || "in stock"}
                    onChange={(e) => setNewMerch((m) => ({ ...m, stock: e.target.value }))}
                    style={{ width: "100%", height: 44, background: "#0f1016", color: "#fff", border: "1px solid rgba(181,179,135,0.35)", padding: "0 36px 0 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", appearance: "none", outline: "none" }}
                  >
                    <option value="in stock" style={{ background: "#0f1016" }}>In Stock</option>
                    <option value="out of stock" style={{ background: "#0f1016" }}>Out of Stock</option>
                  </select>
                  <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 7L11 1" stroke="#CBC895" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
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
                  {item.stock === "in stock" || item.stock === "In Stock" ? t('merch.inventory.stats.in_stock', { count: "" }).replace("  ", " ").trim() : item.stock}
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
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "1rem" }}
          onClick={() => setEditModalOpen(false)}
        >
          <div
            style={{ background: "#131319", border: "1px solid rgba(203,200,149,0.4)", width: "100%", maxWidth: 860, maxHeight: "92vh", overflowY: "auto", position: "relative", boxShadow: "0 25px 60px rgba(0,0,0,0.9)" }}
            onClick={e => e.stopPropagation()}
          >
            {/* corner accents */}
            {[["0","0"],["0","auto"],["auto","0"],["auto","auto"]].map(([t,r],i) => (
              <div key={i} style={{ position:"absolute", top:t==="0"?0:"auto", bottom:t==="auto"?0:"auto", left:r==="0"?0:"auto", right:r==="auto"?0:"auto", width:8, height:8, background:"#CBC895" }} />
            ))}

            {/* Header */}
            <div style={{ background: "#CBC895", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: '"Press Start 2P"', fontSize: 10, color: "#191A22", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                {t('merch.modals.edit_title')}
              </span>
              <button
                onClick={() => setEditModalOpen(false)}
                style={{ width: 28, height: 28, background: "#191A22", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#CBC895" strokeWidth="2" strokeLinecap="round"><path d="M10 2L2 10M2 2l8 8" /></svg>
              </button>
            </div>

            {/* Body — 2 columns: LEFT=details, RIGHT=images+sizes */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>

              {/* LEFT — Details */}
              <div style={{ padding: "20px", borderRight: "1px solid rgba(203,200,149,0.15)", display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Product Name */}
                <div>
                  <label style={{ display: "block", fontFamily: '"Press Start 2P"', fontSize: 9, color: "rgba(203,200,149,0.7)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{t('merch.upload.name_label')}</label>
                  <input
                    value={editMerch.name}
                    onChange={(e) => setEditMerch((m) => ({ ...m, name: e.target.value }))}
                    style={{ width: "100%", height: 40, background: "#1E1E2A", border: "1px solid rgba(203,200,149,0.25)", color: "#F6F4D3", padding: "0 12px", fontSize: 13, fontWeight: 600, outline: "none" }}
                  />
                </div>

                {/* Price */}
                <div>
                  <label style={{ display: "block", fontFamily: '"Press Start 2P"', fontSize: 9, color: "rgba(203,200,149,0.7)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{t('merch.upload.price_label')}</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#CBC895", fontWeight: 700, fontSize: 14 }}>€</span>
                    <input
                      type="number" min={0} step="0.01"
                      value={editMerch.price}
                      onChange={(e) => setEditMerch((m) => ({ ...m, price: Number(e.target.value) }))}
                      style={{ width: "100%", height: 40, background: "#1E1E2A", border: "1px solid rgba(203,200,149,0.25)", color: "#F6F4D3", padding: "0 12px 0 26px", fontSize: 13, fontWeight: 600, outline: "none" }}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={{ display: "block", fontFamily: '"Press Start 2P"', fontSize: 9, color: "rgba(203,200,149,0.7)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{t('merch.upload.description_label')}</label>
                  <textarea
                    value={editMerch.description}
                    onChange={(e) => setEditMerch((m) => ({ ...m, description: e.target.value }))}
                    rows={4}
                    style={{ width: "100%", background: "#1E1E2A", border: "1px solid rgba(203,200,149,0.25)", color: "#F6F4D3", padding: "10px 12px", fontSize: 13, fontWeight: 500, outline: "none", resize: "none" }}
                  />
                </div>

                {/* Stock Status */}
                <div>
                  <label style={{ display: "block", fontFamily: '"Press Start 2P"', fontSize: 9, color: "rgba(203,200,149,0.7)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Stock Status</label>
                  <div style={{ position: "relative", height: 40 }}>
                    <select
                      value={editMerch.stock || "in stock"}
                      onChange={(e) => setEditMerch((m) => ({ ...m, stock: e.target.value }))}
                      style={{ width: "100%", height: 40, background: "#1E1E2A", border: "1px solid rgba(203,200,149,0.25)", color: "#F6F4D3", padding: "0 36px 0 12px", fontSize: 13, fontWeight: 600, outline: "none", cursor: "pointer", appearance: "none" }}
                    >
                      <option value="in stock" style={{ background: "#1E1E2A" }}>In Stock</option>
                      <option value="out of stock" style={{ background: "#1E1E2A" }}>Out of Stock</option>
                    </select>
                    <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                      <svg width="10" height="6" viewBox="0 0 10 6"><path d="M1 1L5 5L9 1" stroke="#CBC895" strokeWidth="1.5" strokeLinecap="round" /></svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT — Images + Sizes */}
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Images */}
                <div>
                  <div style={{ fontFamily: '"Press Start 2P"', fontSize: 9, color: "rgba(203,200,149,0.7)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
                    Merch Images
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {editSelectedFiles.map((file, idx) => {
                      const isMain = editCoverIndex === idx;
                      const previewUrl = typeof file === "string" ? file : URL.createObjectURL(file);
                      return (
                        <div key={idx} style={{ width: 80, height: 80, border: isMain ? "2px solid #CBC895" : "1px solid rgba(203,200,149,0.3)", position: "relative", overflow: "hidden", background: "rgba(0,0,0,0.4)" }}>
                          <img src={previewUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          {isMain && (
                            <span style={{ position: "absolute", top: 3, left: 3, background: "#CBC895", color: "#191A22", padding: "1px 4px", fontSize: 7, fontFamily: '"Press Start 2P"', fontWeight: "bold" }}>MAIN</span>
                          )}
                          <div className="hover-overlay" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 4, opacity: 0, transition: "opacity 0.2s" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              {!isMain && (
                                <button type="button" onClick={() => setEditCoverIndex(idx)} style={{ background: "#CBC895", border: "none", color: "#191A22", fontSize: 7, padding: "2px 3px", cursor: "pointer", fontWeight: "bold", fontFamily: '"Press Start 2P"' }}>MAIN</button>
                              )}
                              <button type="button" onClick={() => removeEditImage(idx)} style={{ background: "#dc2626", border: "none", color: "white", fontSize: 10, padding: "1px 5px", cursor: "pointer", fontWeight: "bold", marginLeft: "auto" }}>✕</button>
                            </div>
                            <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                              <button type="button" disabled={idx === 0} onClick={() => moveEditImage(idx, -1)} style={{ background: idx===0?"#444":"#CBC895", color: "#191A22", border: "none", width: 20, height: 20, cursor: idx===0?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"bold", fontSize: 12 }}>‹</button>
                              <button type="button" disabled={idx === editSelectedFiles.length-1} onClick={() => moveEditImage(idx, 1)} style={{ background: idx===editSelectedFiles.length-1?"#444":"#CBC895", color: "#191A22", border: "none", width: 20, height: 20, cursor: idx===editSelectedFiles.length-1?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"bold", fontSize: 12 }}>›</button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div
                      onClick={() => document.getElementById("edit-file-input")?.click()}
                      style={{ width: 80, height: 80, border: "1px dashed rgba(203,200,149,0.4)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "rgba(203,200,149,0.05)", transition: "background 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(203,200,149,0.12)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(203,200,149,0.05)"}
                    >
                      <span style={{ fontSize: 20, color: "#CBC895", lineHeight: 1 }}>+</span>
                      <span style={{ fontSize: 7, fontFamily: '"Press Start 2P"', color: "rgba(203,200,149,0.6)", marginTop: 4 }}>ADD IMAGE</span>
                    </div>
                  </div>
                  <input id="edit-file-input" type="file" accept="image/png,image/jpeg" multiple onChange={handleEditFileSelect} hidden />
                  {editSelectedFiles.length > 0 && (
                    <div style={{ marginTop: 8, fontSize: 9, color: "#55DF55", fontFamily: '"Press Start 2P"' }}>
                      {editSelectedFiles.length} IMAGE{editSelectedFiles.length !== 1 ? "S" : ""}
                    </div>
                  )}
                </div>

                {/* Sizes */}
                <div>
                  <label style={{ display: "block", fontFamily: '"Press Start 2P"', fontSize: 9, color: "rgba(203,200,149,0.7)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>{t('merch.upload.sizes_label')}</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {AVAIL_SIZES.map((s) => {
                      const qty = editMerch.sizeQtys[s] || 0;
                      const active = qty > 0;
                      return (
                        <div key={s} style={{ display: "flex", alignItems: "center", background: "#1E1E2A", border: `1px solid ${active ? "#CBC895" : "rgba(203,200,149,0.2)"}`, overflow: "hidden" }}>
                          <div style={{ width: 36, height: 40, display: "flex", alignItems: "center", justifyContent: "center", background: active ? "#CBC895" : "rgba(203,200,149,0.1)", color: active ? "#191A22" : "rgba(203,200,149,0.5)", fontFamily: '"Press Start 2P"', fontSize: 9, fontWeight: 700, flexShrink: 0, transition: "all 0.15s" }}>
                            {s}
                          </div>
                          <button
                            type="button"
                            onClick={() => { const v = Math.max(0, qty - 1); setEditMerch(m => ({ ...m, sizeQtys: { ...m.sizeQtys, [s]: v } })); }}
                            style={{ width: 32, height: 40, background: "transparent", border: "none", borderLeft: "1px solid rgba(203,200,149,0.15)", color: "#CBC895", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, flexShrink: 0 }}
                          >−</button>
                          <div style={{ flex: 1, height: 40, display: "flex", alignItems: "center", justifyContent: "center", color: active ? "#F6F4D3" : "rgba(246,244,211,0.3)", fontWeight: 700, fontSize: 14, borderLeft: "1px solid rgba(203,200,149,0.15)", borderRight: "1px solid rgba(203,200,149,0.15)" }}>
                            {qty}
                          </div>
                          <button
                            type="button"
                            onClick={() => setEditMerch(m => ({ ...m, sizeQtys: { ...m.sizeQtys, [s]: qty + 1 } }))}
                            style={{ width: 32, height: 40, background: "transparent", border: "none", color: "#CBC895", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, flexShrink: 0 }}
                          >+</button>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: 6, fontSize: 8, fontFamily: '"Press Start 2P"', color: "rgba(203,200,149,0.4)" }}>QTY PER SIZE · 0 = UNAVAILABLE</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(203,200,149,0.15)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={() => setEditModalOpen(false)}
                style={{ padding: "8px 20px", background: "transparent", border: "1px solid rgba(203,200,149,0.4)", color: "rgba(203,200,149,0.7)", fontWeight: 700, fontSize: 10, fontFamily: '"Press Start 2P"', textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer" }}
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleEditUpload}
                disabled={isUpdatingMerch}
                style={{ padding: "8px 20px", background: "#CBC895", border: "none", color: "#191A22", fontWeight: 900, fontSize: 10, fontFamily: '"Press Start 2P"', textTransform: "uppercase", letterSpacing: "0.1em", cursor: isUpdatingMerch ? "not-allowed" : "pointer", opacity: isUpdatingMerch ? 0.6 : 1, display: "flex", alignItems: "center", gap: 8 }}
              >
                {isUpdatingMerch ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 11-6.219-8.56" /></svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                )}
                {isUpdatingMerch ? t('merch.modals.updating') : t('merch.modals.save_changes')}
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
