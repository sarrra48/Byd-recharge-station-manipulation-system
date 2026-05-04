import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Navbar } from "./HomePage";
import keycloak from "./keycloak";

export default function OtpPage() {
  const navigate  = useNavigate();
  const inputsRef = useRef([]);

  const [user, setUser]               = useState(null);
  const [digits, setDigits]           = useState(["", "", "", "", "", ""]);
  const [error, setError]             = useState("");
  const [verifying, setVerifying]     = useState(false);
  const [confirmed, setConfirmed]     = useState(false);
  const [resending, setResending]     = useState(false);
  const [cooldown, setCooldown]       = useState(0);
  const [reservation, setReservation] = useState(null);

useEffect(() => {
  const saved = sessionStorage.getItem("reservation");
  if (saved) setReservation(JSON.parse(saved));

  // Keycloak is already initialized by Reservation.jsx — just read it
  if (keycloak.authenticated) {
    const email = keycloak.tokenParsed?.email;
    setUser({
      name:  keycloak.tokenParsed?.name || keycloak.tokenParsed?.preferred_username,
      email,
    });
    if (email) sendOtp(email);
  } else {
    keycloak.login({ redirectUri: window.location.href });
  }
}, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const contactEmail  = user?.email || reservation?.contact || "";
  const contactMasked = maskEmail(contactEmail);

  // ── Send OTP via backend ───────────────────────────────────────────────────
  async function sendOtp(email) {
    try {
      await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      console.error("Failed to send OTP:", err);
    }
  }

  // ── Digit input ────────────────────────────────────────────────────────────
  const handleDigit = (i, val) => {
    const v = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    setError("");
    if (v && i < 5) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputsRef.current[i - 1]?.focus();
    if (e.key === "ArrowLeft"  && i > 0) inputsRef.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) inputsRef.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      inputsRef.current[5]?.focus();
      e.preventDefault();
    }
  };

  // ── Verify OTP ─────────────────────────────────────────────────────────────
  const handleVerify = async () => {
    const code = digits.join("");
    if (code.length < 6) { setError("Entrez les 6 chiffres du code."); return; }

    setVerifying(true);
    setError("");

    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: contactEmail, code }),
      });

      if (res.ok) {
        setConfirmed(true);
        sessionStorage.removeItem("reservation");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Code incorrect. Vérifiez votre email et réessayez.");
        setDigits(["", "", "", "", "", ""]);
        inputsRef.current[0]?.focus();
      }
    } catch (err) {
      setError("Erreur réseau. Veuillez réessayer.");
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  // ── Resend ─────────────────────────────────────────────────────────────────
  const handleResend = async () => {
    setResending(true);
    await sendOtp(contactEmail);
    setResending(false);
    setCooldown(60);
    setDigits(["", "", "", "", "", ""]);
    setError("");
    inputsRef.current[0]?.focus();
  };

  const handleLogin  = () => keycloak.login();
  const handleLogout = () => keycloak.logout({ redirectUri: window.location.origin });

  // ── Success screen ─────────────────────────────────────────────────────────
  if (confirmed) {
    return (
      <div style={S.root}>
        <Navbar user={user} onLogin={handleLogin} onLogout={handleLogout} />
        <div style={S.page}>
          <div style={S.successBox}>
            <div style={S.successIcon}>✓</div>
            <h2 style={S.successTitle}>Réservation confirmée !</h2>
            {reservation && (
              <>
                <p style={S.successLine}><strong>Borne :</strong> {reservation.station}</p>
                <p style={S.successLine}><strong>Date :</strong> {reservation.date} à {reservation.time}</p>
                <p style={S.successLine}><strong>VIN :</strong> {reservation.vin}</p>
              </>
            )}
            <Link to="/" style={S.homeBtn}>Retour à l&apos;accueil</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── OTP screen ─────────────────────────────────────────────────────────────
  return (
    <div style={S.root}>
      <Navbar user={user} onLogin={handleLogin} onLogout={handleLogout} />

      <div style={S.page}>
        <Link to="/reserver" style={S.back}>← Modifier la réservation</Link>

        <div style={S.card}>
          <div style={S.lockIcon}>🔒</div>
          <h1 style={S.title}>Vérification de votre identité</h1>

          <p style={S.desc}>
            Un code à 6 chiffres a été envoyé par <strong>email</strong> à{" "}
            <strong>{contactMasked || "votre adresse email"}</strong>.
          </p>

          <div style={S.digitRow} onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => inputsRef.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleDigit(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                style={{
                  ...S.digitBox,
                  borderColor: error ? "#c62828" : d ? "#1a73e8" : "#dde3f0",
                  background: d ? "#f0f6ff" : "#fff",
                }}
                autoFocus={i === 0}
              />
            ))}
          </div>

          {error && <p style={S.error}>{error}</p>}

          <button
            onClick={handleVerify}
            disabled={verifying || digits.join("").length < 6}
            style={{
              ...S.verifyBtn,
              opacity: !verifying && digits.join("").length === 6 ? 1 : 0.5,
              cursor: !verifying && digits.join("").length === 6 ? "pointer" : "not-allowed",
            }}
          >
            {verifying
              ? <><div style={S.spinner} /> Vérification…</>
              : "Confirmer la réservation"
            }
          </button>

          <div style={S.resendRow}>
            <span style={{ color: "#888", fontSize: 13 }}>Vous n&apos;avez pas reçu de code ?</span>
            {cooldown > 0 ? (
              <span style={S.cooldown}>Renvoyer dans {cooldown}s</span>
            ) : (
              <button onClick={handleResend} disabled={resending} style={S.resendBtn}>
                {resending ? "Envoi…" : "Renvoyer le code"}
              </button>
            )}
          </div>

          <p style={S.note}>
            L&apos;email utilisé est celui associé à votre compte Keycloak.
            Pour le modifier, accédez à{" "}
            <a href="http://localhost:8080/realms/firstRealm/account" style={{ color: "#1a73e8" }}>
              votre profil
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Masking: user@domain.com → u***@domain.com ─────────────────────────────────
function maskEmail(email) {
  if (!email) return "";
  const [local, domain] = email.split("@");
  if (!domain) return email;
  return local[0] + "***@" + domain;
}

const S = {
  root: { fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#f4f6fb", minHeight: "100vh" },
  page: { maxWidth: 500, margin: "0 auto", padding: "48px 24px 80px" },
  back: { color: "#1a73e8", fontSize: 13, textDecoration: "none", display: "inline-block", marginBottom: 24 },

  card: {
    background: "#fff", borderRadius: 16, padding: "40px 36px",
    border: "1px solid #e4eaf8", textAlign: "center",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
  },
  lockIcon: { fontSize: 40, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 800, color: "#0d1b2e", margin: "0 0 12px" },
  desc: { fontSize: 14, color: "#555", lineHeight: 1.65, margin: "0 0 32px" },

  digitRow: { display: "flex", gap: 10, justifyContent: "center", marginBottom: 16 },
  digitBox: {
    width: 52, height: 60, fontSize: 24, fontWeight: 700, textAlign: "center",
    border: "2px solid #dde3f0", borderRadius: 10, outline: "none",
    color: "#0d1b2e", transition: "all 0.15s", caretColor: "transparent",
  },

  error: { color: "#c62828", fontSize: 13, margin: "0 0 16px" },

  verifyBtn: {
    width: "100%", padding: "13px", background: "#0a0e1a", color: "#fff",
    border: "none", borderRadius: 9, fontSize: 15, fontWeight: 700,
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    gap: 8, transition: "opacity 0.2s", marginBottom: 20,
  },

  resendRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 24 },
  resendBtn: { background: "none", border: "none", color: "#1a73e8", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0 },
  cooldown: { fontSize: 13, color: "#aaa" },
  note: { fontSize: 11, color: "#bbb", lineHeight: 1.6, margin: 0 },

  spinner: {
    width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff",
    borderRadius: "50%", animation: "spin 0.8s linear infinite",
  },

  successBox: {
    background: "#fff", borderRadius: 16, padding: "52px 36px", textAlign: "center",
    border: "1px solid #e4eaf8", boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
  },
  successIcon: {
    width: 64, height: 64, borderRadius: "50%", background: "#e8f5e9", color: "#2e7d32",
    fontSize: 30, display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 20px",
  },
  successTitle: { fontSize: 22, fontWeight: 800, color: "#0d1b2e", margin: "0 0 16px" },
  successLine: { color: "#555", fontSize: 14, margin: "0 0 6px" },
  homeBtn: {
    display: "inline-block", marginTop: 24, padding: "11px 28px",
    background: "#1a73e8", color: "#fff", borderRadius: 8,
    textDecoration: "none", fontWeight: 600, fontSize: 14,
  },
};

if (typeof document !== "undefined" && !document.getElementById("otp-spin")) {
  const style = document.createElement("style");
  style.id = "otp-spin";
  style.textContent = "@keyframes spin { to { transform: rotate(360deg); } }";
  document.head.appendChild(style);
}
