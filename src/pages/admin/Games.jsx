import React from "react";
import { useTranslation } from "react-i18next";

export default function Games() {
  const { t } = useTranslation();
  return (
    <div className="app alexandria-font">
      <style>{`
        :root{--olive:#525132;--tan:#CBC895;--header-dark:#2F2D0E;--button:#DDD1B1;--ink:#191A22}
        .app{min-height:100vh;background:var(--olive);color:#fff}
        .container{max-width:1200px;margin:0 auto;padding:0 1.5rem}
        .topbar{background:var(--header-dark);border-bottom:1px solid var(--tan)}
        .btn{background:var(--button);color:var(--ink);font-weight:700;border-radius:8px;box-shadow:0 7px 2px 0 #000;padding:.7rem 1rem;border:none;cursor:pointer}
        .btn:active{transform:translateY(2px);box-shadow:0 5px 2px 0 #000}
        .panel-wrap{padding:.5rem}
        .panel{width:100%;height:420px;border:3px dashed var(--tan);background:transparent}
      `}</style>

      {/* Header with right-aligned action */}
      <section className="topbar">
        <div className="container" style={{display:"flex",justifyContent:"flex-end",alignItems:"center",padding:"0.75rem 0"}}>
          <button className="btn">{t('games.add_new')}</button>
        </div>
      </section>

      {/* Upload/Canvas panel */}
      <section className="panel-wrap">
        <div className="container">
          <div className="panel" aria-label="Games upload or canvas area" />
        </div>
      </section>
    </div>
  );
}
