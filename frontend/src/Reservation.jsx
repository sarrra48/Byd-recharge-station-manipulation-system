import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "./HomePage";
import keycloak from "./keycloak";
import { createWorker } from "tesseract.js";

const STATIONS_FLAT = [
  { city: "Tunis",  name: "Shell Tunis est",        power: "24 KW DC" },
  { city: "Tunis",  name: "Shell Ennahas 2",         power: "22 KW AC" },
  { city: "Tunis",  name: "Shell Plein Plaisir",     power: "22 KW AC" },
  { city: "Tunis",  name: "Tunis City",              power: "22 KW AC" },
  { city: "Nabeul", name: "Shell Nabeul",            power: "34 KW AC" },
  { city: "Nabeul", name: "Shell Soliman",           power: "54 KW DC" },
  { city: "Nabeul", name: "Agil Hammamet",           power: "45 KW AC" },
  { city: "Nabeul", name: "Helios Tamda",            power: "54 KW DC" },
  { city: "Nabeul", name: "Shell Onas Ben Amar",     power: "44 KW AC" },
  { city: "Gafsa",  name: "Shell Gafsa",             power: "22 KW AC" },
  { city: "Gafsa",  name: "Total Gafsa",             power: "22 KW AC" },
  { city: "Sousse", name: "Shell Sahwani",           power: "54 KW DC" },
  { city: "Sousse", name: "Shell Sousse",            power: "22 KW AC" },
  { city: "Sousse", name: "Agil Messaâdine",         power: "23 KW AC" },
  { city: "Sousse", name: "Olia Agenti Nour",        power: "27 KW AC" },
  { city: "Sousse", name: "Olia Agenti Sud",         power: "24 KW AC" },
  { city: "Sousse", name: "Piscine Sfax",            power: "22 KW AC" },
  { city: "Sousse", name: "Shell Msaken Ville Sfax", power: "22 KW AC" },
  { city: "Gabès",  name: "Shell Gaben",             power: "22 KW AC" },
  { city: "Gabès",  name: "Agencia BYD Gabès",       power: "22 KW AC" },
  { city: "Gabès",  name: "Shell Gabès",             power: "22 KW AC" },
  { city: "Gabès",  name: "Officl Djerba",           power: "22 KW AC" },
];

const CITIES = ["Toutes", "Tunis", "Nabeul", "Gafsa", "Sousse", "Gabès"];
const TIMES   = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"];

// ── Real OCR with Tesseract.js ─────────────────────────────────────────────────
async function extractVinFromImage(file) {
  const worker = await createWorker("eng"); // "eng" is best for VIN (A-Z + 0-9)
  try {
    const { data: { text } } = await worker.recognize(file);
    console.log("OCR TEXT:", text); // useful for debugging
    const vinRegex = /\b[A-HJ-NPR-Z0-9]{17}\b/g;
    const matches  = text.match(vinRegex);
    return matches?.[0] ?? null;
  } catch (err) {
    console.error("OCR error:", err);
    return null;
  } finally {
    await worker.terminate();
  }
}


export default function Reservation() {
  const navigate = useNavigate();
  const fileRef  = useRef(null);

  const [user, setUser]         = useState(null);
  const [city, setCity]         = useState("Toutes");
  const [station, setStation]   = useState("");
  const [date, setDate]         = useState("");
  const [time, setTime]         = useState("");
  const [vin, setVin]           = useState("");
  const [ocrLoading, setOcr]    = useState(false);
  const [ocrError, setOcrError] = useState("");
  const [vinValid, setVinValid] = useState(null); // null | true | false
  const [validating, setValid]  = useState(false);
  const [dragOver, setDrag]     = useState(false);

  useEffect(() => {
        if (keycloak.authenticated) {
          setUser({
            name:  keycloak.tokenParsed?.name || keycloak.tokenParsed?.preferred_username,
            email: keycloak.tokenParsed?.email,
          });
        }
  }, []);

  const handleLogin  = () => keycloak.login();
  const handleLogout = () => keycloak.logout({ redirectUri: window.location.origin });

  const filtered = city === "Toutes"
    ? STATIONS_FLAT
    : STATIONS_FLAT.filter(s => s.city === city);

  // ── Carte grise upload / OCR ───────────────────────────────────────────────
  const handleCarteGrise = async (file) => {
    if (!file || !file.type.startsWith("image/")) {
      setOcrError("Veuillez choisir une image (JPG, PNG, WEBP).");
      return;
    }
    setOcrError("");
    setOcr(true);
    setVin("");
    setVinValid(null);
    try {
      const extracted = await extractVinFromImage(file);
      if (extracted) {
        setVin(extracted);
      } else {
        setOcrError("VIN introuvable dans l'image. Saisissez-le manuellement.");
      }
    } catch {
      setOcrError("Erreur OCR. Saisissez le VIN manuellement.");
    } finally {
      setOcr(false);
    }
  };

  const onFileChange = (e) => handleCarteGrise(e.target.files?.[0]);
  const onDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    handleCarteGrise(e.dataTransfer.files?.[0]);
  };

  // ── Validate VIN + go to OTP ───────────────────────────────────────────────
  const handleValider = async () => {
    const trimmed = vin.trim().toUpperCase();
    if (!trimmed) return;

    if (!user) {
      keycloak.login({ redirectUri: window.location.href });
      return;
    }

    setValid(true);
    setVinValid(null);

    // TODO: replace with real backend VIN check
    // const res = await fetch(`/api/vehicles/verify?vin=${trimmed}`);
    // const isValid = res.ok;
    await new Promise(r => setTimeout(r, 1200));
    const isValid = /^[A-HJ-NPR-Z0-9]{17}$/.test(trimmed);

    setVinValid(isValid);
    setValid(false);

    if (isValid) {
      sessionStorage.setItem("reservation", JSON.stringify({
        station,
        date,
        time,
        vin: trimmed,
        contact: user.email,      // email only
        contactType: "email",     // always email
      }));
      navigate("/otp");
    }
  };

  const formReady = station && date && time && vin.trim();

  return (
    <div style={S.root}>
      <Navbar user={user} onLogin={handleLogin} onLogout={handleLogout} />

      <div style={S.page}>
        <div style={S.header}>
          <Link to="/" style={S.back}>← Retour</Link>
          <h1 style={S.title}>Réserver une recharge</h1>
          <p style={S.sub}>Choisissez votre borne, votre date et votre créneau horaire</p>
        </div>

        <div style={S.form}>

          {/* ── Step 1 — Station ── */}
          <div style={S.card}>
            <h3 style={S.cardTitle}>1 — Choisir une borne</h3>
            <div style={S.cityRow}>
              {CITIES.map(c => (
                <button type="button" key={c} onClick={() => { setCity(c); setStation(""); }}
                  style={{ ...S.cityChip, ...(city === c ? S.cityChipActive : {}) }}>
                  {c}
                </button>
              ))}
            </div>
            <div style={S.stationGrid}>
              {filtered.map(s => (
                <div key={s.name} onClick={() => setStation(s.name)}
                  style={{ ...S.stationCard, ...(station === s.name ? S.stationCardActive : {}) }}>
                  <div style={S.stationCardName}>{s.name}</div>
                  <div style={S.stationCardMeta}>
                    <span style={S.cityBadge}>{s.city}</span>
                    <span style={{ ...S.powerBadge, background: s.power.includes("DC") ? "#fff3e0" : "#e8f5e9", color: s.power.includes("DC") ? "#e65100" : "#2e7d32" }}>
                      {s.power}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Step 2 — Date & Time ── */}
          <div style={S.card}>
            <h3 style={S.cardTitle}>2 — Date et heure</h3>
            <div style={S.row2}>
              <div style={S.fieldGroup}>
                <label style={S.label}>Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  style={S.input} />
              </div>
              <div style={S.fieldGroup}>
                <label style={S.label}>Créneau</label>
                <div style={S.timeGrid}>
                  {TIMES.map(t => (
                    <button type="button" key={t} onClick={() => setTime(t)}
                      style={{ ...S.timeChip, ...(time === t ? S.timeChipActive : {}) }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Step 3 — VIN ── */}
          <div style={S.card}>
            <h3 style={S.cardTitle}>3 — Votre véhicule (VIN)</h3>

            <div
              style={{ ...S.dropZone, ...(dragOver ? S.dropZoneActive : {}) }}
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFileChange} />
              {ocrLoading ? (
                <div style={S.ocrLoading}>
                  <div style={S.spinner} />
                  <span style={{ color: "#1a73e8", fontSize: 13, marginTop: 8 }}>Lecture du VIN en cours…</span>
                </div>
              ) : (
                <>
                  <div style={S.dropIcon}>📄</div>
                  <p style={S.dropText}>
                    <strong>Téléversez votre carte grise</strong><br />
                    <span style={{ color: "#888", fontSize: 12 }}>Le VIN sera extrait automatiquement · JPG, PNG, WEBP</span>
                  </p>
                  <span style={S.dropBtn}>Choisir une image</span>
                </>
              )}
            </div>

            {ocrError && <p style={S.ocrError}>{ocrError}</p>}

            <div style={S.orRow}><span style={S.orLine}/><span style={S.orText}>ou saisissez manuellement</span><span style={S.orLine}/></div>

            <div style={S.fieldGroup}>
              <label style={S.label}>Numéro VIN (17 caractères)</label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  value={vin}
                  onChange={e => { setVin(e.target.value.toUpperCase()); setVinValid(null); }}
                  placeholder="ex: VF1LM1B0H45123456"
                  maxLength={17}
                  style={{
                    ...S.input,
                    paddingRight: 40,
                    borderColor: vinValid === true ? "#2e7d32" : vinValid === false ? "#c62828" : "#dde3f0",
                  }}
                />
                {vinValid === true  && <span style={S.vinIcon}>✓</span>}
                {vinValid === false && <span style={{ ...S.vinIcon, color: "#c62828" }}>✗</span>}
              </div>
              <span style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{vin.length}/17</span>
              {vinValid === false && (
                <p style={S.ocrError}>VIN invalide ou non reconnu. Vérifiez votre saisie.</p>
              )}
            </div>

            <button
              type="button"
              onClick={handleValider}
              disabled={!formReady || validating}
              style={{
                ...S.validerBtn,
                opacity: formReady && !validating ? 1 : 0.5,
                cursor: formReady && !validating ? "pointer" : "not-allowed",
              }}
            >
              {validating ? (
                <><div style={S.spinnerSm} /> Vérification…</>
              ) : !user ? (
                "Se connecter pour valider"
              ) : (
                "Valider →"
              )}
            </button>
          </div>

          {/* ── Summary bar ── */}
          <div style={S.summaryBar}>
            <div style={S.summaryItems}>
              <span style={S.summaryItem}>{station || "Aucune borne"}</span>
              <span style={S.summaryDot}>•</span>
              <span style={S.summaryItem}>{date || "Date"}</span>
              <span style={S.summaryDot}>•</span>
              <span style={S.summaryItem}>{time || "Heure"}</span>
              {vin && <><span style={S.summaryDot}>•</span><span style={S.summaryItem}>VIN: {vin}</span></>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const S = {
  root: { fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#f4f6fb", minHeight: "100vh" },
  page: { maxWidth: 900, margin: "0 auto", padding: "40px 24px 80px" },
  header: { marginBottom: 32 },
  back: { color: "#1a73e8", fontSize: 13, textDecoration: "none", display: "inline-block", marginBottom: 12 },
  title: { fontSize: 26, fontWeight: 800, color: "#0d1b2e", margin: "0 0 8px" },
  sub: { color: "#666", fontSize: 14, margin: 0 },

  form: { display: "flex", flexDirection: "column", gap: 20 },
  card: { background: "#fff", borderRadius: 12, padding: "24px 28px", border: "1px solid #e4eaf8" },
  cardTitle: { fontSize: 15, fontWeight: 700, color: "#0d1b2e", margin: "0 0 18px" },

  cityRow: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  cityChip: { background: "none", border: "1px solid #dde3f0", borderRadius: 20, padding: "5px 14px", fontSize: 12, cursor: "pointer", color: "#555" },
  cityChipActive: { background: "#1a73e8", color: "#fff", border: "1px solid #1a73e8" },

  stationGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 },
  stationCard: { border: "1px solid #e4eaf8", borderRadius: 8, padding: "12px 14px", cursor: "pointer", transition: "all 0.15s" },
  stationCardActive: { border: "1px solid #1a73e8", background: "#f0f6ff" },
  stationCardName: { fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 6 },
  stationCardMeta: { display: "flex", gap: 6 },
  cityBadge: { fontSize: 10, background: "#f0f4ff", color: "#1a73e8", borderRadius: 4, padding: "2px 6px" },
  powerBadge: { fontSize: 10, borderRadius: 4, padding: "2px 6px" },

  row2: { display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: 0.5 },
  input: { border: "1px solid #dde3f0", borderRadius: 7, padding: "10px 12px", fontSize: 13, outline: "none", color: "#1a1a1a", width: "100%", boxSizing: "border-box" },

  timeGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 },
  timeChip: { background: "none", border: "1px solid #dde3f0", borderRadius: 6, padding: "7px 4px", fontSize: 12, cursor: "pointer", color: "#555", textAlign: "center" },
  timeChipActive: { background: "#1a73e8", color: "#fff", border: "1px solid #1a73e8" },

  dropZone: {
    border: "2px dashed #c5d5f0", borderRadius: 10, padding: "24px 20px",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    cursor: "pointer", marginBottom: 16, transition: "all 0.2s", background: "#fafcff",
    gap: 6, minHeight: 120,
  },
  dropZoneActive: { borderColor: "#1a73e8", background: "#f0f6ff" },
  dropIcon: { fontSize: 32 },
  dropText: { textAlign: "center", fontSize: 13, color: "#444", margin: 0, lineHeight: 1.6 },
  dropBtn: { fontSize: 12, color: "#1a73e8", border: "1px solid #1a73e8", borderRadius: 5, padding: "4px 12px", marginTop: 4 },
  ocrLoading: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8 },
  ocrError: { color: "#c62828", fontSize: 12, margin: "4px 0 0" },

  orRow: { display: "flex", alignItems: "center", gap: 12, margin: "16px 0" },
  orLine: { flex: 1, height: 1, background: "#e8edf5" },
  orText: { fontSize: 12, color: "#aaa", whiteSpace: "nowrap" },

  vinIcon: { position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#2e7d32", pointerEvents: "none" },

  validerBtn: {
    marginTop: 16, display: "inline-flex", alignItems: "center", gap: 8,
    background: "#0a0e1a", color: "#fff", border: "none", borderRadius: 8,
    padding: "12px 28px", fontSize: 14, fontWeight: 700, transition: "opacity 0.2s",
  },

  spinner: {
    width: 28, height: 28, border: "3px solid #e0eaff", borderTop: "3px solid #1a73e8",
    borderRadius: "50%", animation: "spin 0.8s linear infinite",
  },
  spinnerSm: {
    width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff",
    borderRadius: "50%", animation: "spin 0.8s linear infinite",
  },

  summaryBar: { background: "#0a0e1a", borderRadius: 10, padding: "14px 24px", display: "flex", alignItems: "center", gap: 16 },
  summaryItems: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  summaryItem: { color: "rgba(255,255,255,0.8)", fontSize: 13 },
  summaryDot: { color: "rgba(255,255,255,0.3)", fontSize: 16 },
};

if (typeof document !== "undefined" && !document.getElementById("resa-spin")) {
  const style = document.createElement("style");
  style.id = "resa-spin";
  style.textContent = "@keyframes spin { to { transform: rotate(360deg); } }";
  document.head.appendChild(style);
}
