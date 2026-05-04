import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import carImage from "./assets/BYD.jpg";
import keycloak from "./keycloak";

// ─── Data ──────────────────────────────────────────────────────────────────────
const STATIONS = {
  Tunis: [
    { name: "Shell Tunis est",     power: "24 KW DC" },
    { name: "Shell Ennahas 2",     power: "22 KW AC" },
    { name: "Shell Plein Plaisir", power: "22 KW AC" },
    { name: "Tunis City",          power: "22 KW AC" },
  ],
  Nabeul: [
    { name: "Shell Nabeul",        power: "34 KW AC" },
    { name: "Shell Soliman",       power: "54 KW DC" },
    { name: "Agil Hammamet",       power: "45 KW AC" },
    { name: "Helios Tamda",        power: "54 KW DC" },
    { name: "Shell Onas Ben Amar", power: "44 KW AC" },
  ],
  Gafsa: [
    { name: "Shell Gafsa", power: "22 KW AC" },
    { name: "Total Gafsa", power: "22 KW AC" },
  ],
  Sousse: [
    { name: "Shell Sahwani",           power: "54 KW DC" },
    { name: "Shell Sousse",            power: "22 KW AC" },
    { name: "Agil Messaâdine",         power: "23 KW AC" },
    { name: "Olia Agenti Nour",        power: "27 KW AC" },
    { name: "Olia Agenti Sud",         power: "24 KW AC" },
    { name: "Piscine Sfax",            power: "22 KW AC" },
    { name: "Shell Msaken Ville Sfax", power: "22 KW AC" },
  ],
  Gabès: [
    { name: "Shell Gaben",       power: "22 KW AC" },
    { name: "Agencia BYD Gabès", power: "22 KW AC" },
    { name: "Shell Gabès",       power: "22 KW AC" },
    { name: "Officl Djerba",     power: "22 KW AC" },
  ],
};

const TESTIMONIALS = [
  {
    name: "Cyril Gonzalez",
    handle: "@CyrilGonzalez",
    text: "J'adore ce site ! Il a vraiment transformé mon quotidien de manière incroyable.",
    initials: "CG",
    color: "#1a73e8",
  },
  {
    name: "Wanda Bingleton",
    handle: "@WandaBingleton",
    text: "Vos attentes seront dépassées. Je suis absolument conquis par l'expérience.",
    initials: "WB",
    color: "#e91e8c",
  },
];

// ─── Icons ─────────────────────────────────────────────────────────────────────
const BoltIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2L4.09 12.97H11L10 22L20.91 11.03H14L13 2Z" />
  </svg>
);
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ─── Navbar (shared, can be extracted to Navbar.jsx later) ─────────────────────
export function Navbar({ user, onLogin, onLogout }) {
  const [open, setOpen] = useState(false);

  return (
    <nav style={S.nav}>
      <div style={S.navInner}>
        <div style={S.logo}>
          <span style={S.logoText}>BYD</span>
          <span style={S.logoSub}>Stations de Recharge</span>
        </div>
        <div style={S.navLinks}>
          <Link to="/"        style={S.navLink}>Accueil</Link>
          <Link to="/reserver" style={S.navLink}>Réserver</Link>
          <Link to="/reseau"  style={S.navLink}>Réseau de Recharge</Link>
          <Link to="/contact" style={S.navLink}>Contact</Link>
        </div>

        {/* Account dropdown */}
        {!user ? (
          <button onClick={onLogin} style={S.loginBtn}>
            <UserIcon /><span style={{ marginLeft: 6 }}>Connexion</span>
          </button>
        ) : (
          <div style={{ position: "relative" }}>
            <button onClick={() => setOpen(v => !v)} style={S.accountBtn}>
              <div style={S.avatarSmall}>{(user.name || "U")[0].toUpperCase()}</div>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{user.name}</span>
              <ChevronDown />
            </button>
            {open && (
              <div style={S.dropdown}>
                <div style={S.dropdownHeader}>
                  <div style={S.avatarLg}>{(user.name || "U")[0].toUpperCase()}</div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#1a1a1a" }}>{user.name}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#666" }}>{user.email}</p>
                  </div>
                </div>
                <div style={S.ddDivider} />
                {[
                  { label: "Mon profil",            href: "http://localhost:8080/realms/firstRealm/account" },
                  { label: "Mes véhicules",          href: "#" },
                  { label: "Historique de recharge", href: "#" },
                  { label: "Paramètres",             href: "#" },
                ].map(item => (
                  <a key={item.label} href={item.href} style={S.ddItem}>{item.label}</a>
                ))}
                <div style={S.ddDivider} />
                <button onClick={onLogout} style={S.ddLogout}>
                  <LogoutIcon /><span style={{ marginLeft: 6 }}>Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

// ─── HomePage ──────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [user, setUser]         = useState(null);
  const [activeCity, setActive] = useState("Tunis");

  useEffect(() => {
    keycloak.init({ onLoad: "check-sso", silentCheckSsoRedirectUri: false })
      .then(authenticated => {
        if (authenticated) {
          setUser({
            name:  keycloak.tokenParsed?.name || keycloak.tokenParsed?.preferred_username,
            email: keycloak.tokenParsed?.email,
          });
        }
      });
  }, []);

  const handleLogin  = () => keycloak.login();
  const handleLogout = () => keycloak.logout({ redirectUri: window.location.origin });

  const cities = Object.keys(STATIONS);

  // Tunisia map dots — percentage-based positions on the SVG viewBox
  const mapDots = [
    { cx: 108, cy: 72,  city: "Tunis"  },
    { cx: 135, cy: 100, city: "Nabeul" },
    { cx: 118, cy: 158, city: "Sousse" },
    { cx: 72,  cy: 245, city: "Gafsa"  },
    { cx: 105, cy: 285, city: "Gabès"  },
  ];

  return (
    <div style={S.root}>
      <Navbar user={user} onLogin={handleLogin} onLogout={handleLogout} />

      {/* ── HERO ── */}
      <section style={S.hero}>
        <div style={S.heroOverlay} />
        <div style={S.heroContent}>
          <h1 style={S.heroTitle}>
            BYD Tunisie : Leader mondial<br />
            des véhicules électriques<br />
            et hybrides rechargeables
          </h1>
          <p style={S.heroSubtitle}>
            Trouvez toutes les bornes de recharge à portée de main
          </p>
        </div>
        <div style={S.heroImageWrap}>
          <img src={carImage} alt="BYD Car" style={S.carImg} />
        </div>
      </section>

      {/* ── RÉSEAU ── */}
      <section style={S.section}>
        <h2 style={S.sectionTitle}>Réseau de recharge BYD en Tunisie</h2>
        <p style={S.sectionSub}>
          Un réseau accessible à tous les véhicules électriques, partout en Tunisie.
        </p>
        <Link to="/reserver">
          <button style={S.ctaBtn}><BoltIcon /> Réserver une recharge</button>
        </Link>

        <div style={S.mapGrid}>

          {/* Left: city tabs + active city stations */}
          <div style={S.stationPanel}>
            <div style={S.cityTabs}>
              {cities.map(city => (
                <button key={city} onClick={() => setActive(city)}
                  style={{ ...S.cityTab, ...(activeCity === city ? S.cityTabActive : {}) }}>
                  {city}
                </button>
              ))}
            </div>
            <div style={S.stationList}>
              {STATIONS[activeCity].map((s, i) => (
                <div key={i} style={S.stationRow}>
                  <div style={S.stationDot} />
                  <span style={S.stationName}>{s.name}</span>
                  <span style={S.stationPower}>{s.power}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Center: Tunisia SVG map */}
          <div style={S.mapWrap}>
            <svg viewBox="0 0 220 370" width="360">
              {/* Real Tunisia outline from SVG source, scaled to fit */}
              <g transform="translate(45, 20) scale(5.905)">
                <path
                  d="M6.565,9.074c-1.226,0.821-1.588,2.004-0.604,3.251
                    c0.788,0.999,1.35,2.306,2.301,2.998
                    c1.27,0.926,1.667,2.069,1.968,3.406
                    c0.245,1.094,0.494,2.187,0.739,3.286
                    c1.846-0.627,2.324-1.354,1.957-3.172
                    c-0.095-0.466-0.09-0.804,0.252-1.082
                    c0.698-0.567,1.349-1.37,2.154-1.593
                    c1.723-0.48,1.283-1.814,1.094-2.755
                    c-0.132-0.66-0.653-1.505-1.789-1.682
                    c-0.636-0.101-1.755-0.26-1.958-1.333
                    c-0.188-0.983,0.782-1.065,1.23-1.551
                    c1.812-1.969,2.097-2.62,0.349-4.172
                    c-0.535-0.477-0.724-1.097-0.017-1.686
                    c0.309-0.254,0.549-0.589,0.796-0.908
                    c0.232-0.304,0.703-0.606,0.32-1.04
                    c-0.407-0.463-0.706,0.216-1.064,0.201
                    s-0.741,1.114-1.048,0.021
                    c-0.369-1.299-1.304-1.401-2.355-1.164
                    c-1.594,0.36-3.353,1.811-3.316,2.734
                    C7.62,3.941,7.521,5.044,7.678,6.161
                    C7.827,7.257,7.683,8.324,6.565,9.074z"
                  fill="#dbeeff"
                  stroke="#1a73e8"
                  strokeWidth="0.25"
                  strokeLinejoin="round"
                />
              </g>

              {/* City dots — updated positions to match the real shape */}
              {[
                { cx: 119, cy: 39,  city: "Tunis"  },
                { cx: 129, cy: 52,  city: "Nabeul" },
                { cx: 121, cy: 74,  city: "Sousse" },
                { cx: 88,  cy: 101, city: "Gafsa"  },
                { cx: 111, cy: 119, city: "Gabès"  },
              ].map((d) => (
                <g key={d.city} style={{ cursor: "pointer" }} onClick={() => setActive(d.city)}>
                  <circle
                    cx={d.cx} cy={d.cy}
                    r={activeCity === d.city ? 7 : 5}
                    fill={activeCity === d.city ? "#1a73e8" : "#fff"}
                    stroke="#1a73e8"
                    strokeWidth="1.5"
                  />
                  <text
                    x={d.cx + (d.city === "Gafsa" ? -9 : 10)}
                    y={d.cy + 4}
                    fontSize="9"
                    textAnchor={d.city === "Gafsa" ? "end" : "start"}
                    fill={activeCity === d.city ? "#1a73e8" : "#666"}
                    fontWeight={activeCity === d.city ? "700" : "400"}
                    fontFamily="system-ui, sans-serif"
                  >
                    {d.city}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Right: full station table */}
          <div style={S.fullTable}>
            {Object.entries(STATIONS).map(([city, list]) => (
              <div key={city} style={S.tableCity}>
                <p style={S.tableCityTitle}>{city}</p>
                {list.map((s, i) => (
                  <div key={i} style={S.tableRow}>
                    <span style={S.tableDot} />
                    <span style={S.tableName}>{s.name}</span>
                    <span style={S.tablePower}>{s.power}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={S.testimonialSection}>
        <h2 style={S.sectionTitle}>Témoignages</h2>
        <p style={S.sectionSub}>Ce que nos clients disent et ce qui se passe</p>
        <div style={S.testimonialGrid}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} style={S.testimonialCard}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ ...S.avatar, background: t.color }}>{t.initials}</div>
                <div>
                  <p style={S.tName}>{t.name}</p>
                  <p style={S.tHandle}>{t.handle}</p>
                </div>
              </div>
              <p style={S.tText}>{t.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={S.footer}>
        <div style={S.footerGrid}>
          {[
            { title: "Nemody",       links: ["Accueil", "À propos", "Contact", "Blog"] },
            { title: "Plateforme",   links: ["Fonctionnalités", "Tarifs", "API", "Intégrations"] },
            { title: "Ressources",   links: ["Documentation", "Tutoriels", "Support", "Communauté"] },
            { title: "Liens Utiles", links: ["CGU", "Politique de confidentialité", "Cookies", "Sécurité"] },
            { title: "Support",      links: ["Centre d'aide", "Statut", "FAQ", "Nous contacter"] },
          ].map(col => (
            <div key={col.title}>
              <p style={S.footerTitle}>{col.title}</p>
              {col.links.map(l => <a key={l} href="#" style={S.footerLink}>{l}</a>)}
            </div>
          ))}
        </div>
        <div style={S.footerBottom}>
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
            © {new Date().getFullYear()} BYD Tunisie. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const S = {
  root: { fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#1a1a1a", background: "#fff", margin: 0, padding: 0 },
  nav: { background: "#0a0e1a", position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid rgba(255,255,255,0.08)" },
  navInner: { maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", gap: 32 },
  logo: { display: "flex", flexDirection: "column", lineHeight: 1, marginRight: 16 },
  logoText: { color: "#fff", fontWeight: 800, fontSize: 28, letterSpacing: 2 },
  logoSub: { color: "#5599ff", fontSize: 9, letterSpacing: 1, textTransform: "uppercase" },
  navLinks: { display: "flex", gap: 28, flex: 1 },
  navLink: { color: "rgba(255,255,255,0.75)", fontSize: 13, textDecoration: "none" },
  loginBtn: { display: "flex", alignItems: "center", gap: 7, background: "transparent", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 13 },
  accountBtn: { display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", borderRadius: 6, padding: "5px 12px", cursor: "pointer" },
  avatarSmall: { width: 26, height: 26, borderRadius: "50%", background: "#1a73e8", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 },
  dropdown: { position: "absolute", right: 0, top: "calc(100% + 8px)", background: "#fff", borderRadius: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.16)", width: 240, border: "1px solid #e8e8e8", overflow: "hidden", zIndex: 200 },
  dropdownHeader: { padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, background: "#f5f8ff" },
  avatarLg: { width: 40, height: 40, borderRadius: "50%", background: "#1a73e8", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, flexShrink: 0 },
  ddDivider: { height: 1, background: "#eee" },
  ddItem: { display: "block", padding: "10px 16px", color: "#333", fontSize: 13, textDecoration: "none" },
  ddLogout: { display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 16px", background: "none", border: "none", cursor: "pointer", color: "#c0392b", fontSize: 13, textAlign: "left" },
  hero: { background: "linear-gradient(135deg, #0a0e1a 0%, #0d2147 60%, #1a4080 100%)", minHeight: 500, display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center", overflow: "hidden", position: "relative", padding: "48px 60px 60px", gap: 24 },
  heroOverlay: { position: "absolute", inset: 0, background: "radial-gradient(ellipse at 80% 50%, rgba(26,115,232,0.18) 0%, transparent 65%)", pointerEvents: "none" },
  heroContent: { position: "relative", zIndex: 2 },
  heroTitle: { color: "#fff", fontSize: 36, fontWeight: 800, lineHeight: 1.3, margin: "0 0 16px" },
  heroSubtitle: { color: "rgba(255,255,255,0.65)", fontSize: 16, lineHeight: 1.6, margin: 0 },
  heroImageWrap: { position: "relative", zIndex: 2, display: "flex", alignItems: "flex-end" },
  carImg: { width: "100%", objectFit: "contain", display: "block" },
  section: { maxWidth: 1200, margin: "50px", padding: "52px 24px 40px" },
  sectionTitle: { fontSize: 22, fontWeight: 700, color: "#0d1b2e", marginBottom: 8 },
  sectionSub: { color: "#555", fontSize: 14, marginBottom: 24, lineHeight: 1.7 },
  ctaBtn: { display: "inline-flex", alignItems: "center", gap: 8, background: "#0a0e1a", color: "#fff", border: "none", borderRadius: 6, padding: "10px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 40 },
  mapGrid: { display: "grid", gridTemplateColumns: "1fr auto 2fr", gap: 32, alignItems: "start" },
  stationPanel: { minWidth: 200 },
  cityTabs: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 },
  cityTab: { background: "none", border: "1px solid #dde3f0", borderRadius: 20, padding: "4px 12px", fontSize: 12, cursor: "pointer", color: "#555" },
  cityTabActive: { background: "#1a73e8", color: "#fff", border: "1px solid #1a73e8" },
  stationList: { display: "flex", flexDirection: "column", gap: 8 },
  stationRow: { display: "flex", alignItems: "center", gap: 8 },
  stationDot: { width: 8, height: 8, borderRadius: "50%", background: "#1a73e8", flexShrink: 0 },
  stationName: { fontSize: 13, color: "#222", flex: 1 },
  stationPower: { fontSize: 12, color: "#888", whiteSpace: "nowrap" },
  mapWrap: { padding: "8px 0" },
  fullTable: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" },
  tableCity: { marginBottom: 12 },
  tableCityTitle: { fontSize: 13, fontWeight: 700, color: "#0d1b2e", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 0.5 },
  tableRow: { display: "flex", alignItems: "center", gap: 6, marginBottom: 3 },
  tableDot: { width: 6, height: 6, borderRadius: "50%", background: "#90b8f8", flexShrink: 0 },
  tableName: { fontSize: 12, color: "#333", flex: 1 },
  tablePower: { fontSize: 11, color: "#888" },
  testimonialSection: { background: "#f6f8ff", padding: "52px 24px" },
  testimonialGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, maxWidth: 1200, margin: "24px auto 0" },
  testimonialCard: { background: "#fff", borderRadius: 12, padding: "20px 22px", border: "1px solid #e4eaf8" },
  avatar: { width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15, flexShrink: 0 },
  tName: { margin: 0, fontWeight: 600, fontSize: 14, color: "#1a1a1a" },
  tHandle: { margin: 0, fontSize: 12, color: "#888" },
  tText: { margin: 0, fontSize: 14, color: "#444", lineHeight: 1.65 },
  footer: { background: "#0a0e1a", padding: "48px 24px 24px" },
  footerGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 32, maxWidth: 1200, margin: "0 auto 36px" },
  footerTitle: { color: "#fff", fontSize: 13, fontWeight: 700, margin: "0 0 12px", letterSpacing: 0.3 },
  footerLink: { display: "block", color: "rgba(255,255,255,0.5)", fontSize: 12, textDecoration: "none", marginBottom: 7, lineHeight: 1.5 },
  footerBottom: { borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 20, textAlign: "center", maxWidth: 1200, margin: "0 auto" },
};