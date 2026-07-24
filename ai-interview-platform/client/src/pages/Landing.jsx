import React, { useEffect } from "react";
import {
  Bot,
  ChevronRight,
  Code2,
  Sparkles,
  Target,
  Zap,
  Menu,
  X,
} from "lucide-react";
import { useMediaQuery } from "../hooks/useMediaQuery";

const features = [
  {
    icon: Target,
    title: "Resume-Driven Context",
    desc: "AI dynamically calibrates questions based on the exact requirements of your loaded JD and candidate profile.",
  },
  {
    icon: Code2,
    title: "Real-time Code Sandbox",
    desc: "Secure, fullscreen IDE execution with embedded anti-cheat telemetry and syntax analysis.",
  },
  {
    icon: Zap,
    title: "Instant Synthesis",
    desc: "Comprehensive grading matrix, feedback reports, and aptitude breakdowns generated in seconds.",
  },
];

export default function Landing({ setCurrentTab }) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleEscape = (e) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileMenuOpen]);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#e8e8e8",
        display: "flex",
        flexDirection: "column",
        margin: 0,
        padding: 0,
      }}
    >
      <nav
        role="navigation"
        aria-label="Main navigation"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: isMobile ? "16px 20px" : "24px 48px",
          borderBottom: "1px solid #1a1a1a",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              background: "#fff",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Bot size={20} color="#000" aria-hidden="true" />
          </div>
          <span
            style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "#fff",
              letterSpacing: "0.05em",
            }}
          >
            Camsense AI - AI Interview Platform
          </span>
        </div>

        {isMobile ? (
          <>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={
                mobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={mobileMenuOpen}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#ccc",
                padding: "8px",
              }}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            {mobileMenuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "68px",
                  right: "16px",
                  left: "16px",
                  background: "#111",
                  border: "1px solid #222",
                  borderRadius: "12px",
                  padding: "16px",
                  zIndex: 100,
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                }}
              >
                <button
                  onClick={() => {
                    setCurrentTab("login");
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    padding: "12px",
                    background: "transparent",
                    border: "1px solid #333",
                    borderRadius: "8px",
                    color: "#ccc",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Log in
                </button>
                <button
                  onClick={() => {
                    setCurrentTab("signup");
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    padding: "12px",
                    background: "#fff",
                    border: "1px solid #fff",
                    borderRadius: "8px",
                    color: "#000",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Get Started
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: "flex", gap: "16px" }}>
            <button
              onClick={() => setCurrentTab("login")}
              style={{
                padding: "10px 20px",
                background: "transparent",
                border: "1px solid #333",
                borderRadius: "8px",
                color: "#ccc",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#1a1a1a";
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.borderColor = "#555";
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow =
                  "0 0 15px rgba(255,255,255,0.08), 0 8px 20px rgba(0,0,0,0.3)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#ccc";
                e.currentTarget.style.borderColor = "#333";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Log in
            </button>
            <button
              onClick={() => setCurrentTab("signup")}
              style={{
                padding: "10px 20px",
                background: "#fff",
                border: "1px solid #fff",
                borderRadius: "8px",
                color: "#000",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 0 15px rgba(255,255,255,0.12)",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#f5f5f5";
                e.currentTarget.style.borderColor = "#f5f5f5";
                e.currentTarget.style.transform =
                  "translateY(-3px) scale(1.03)";
                e.currentTarget.style.boxShadow =
                  "0 0 20px rgba(255,255,255,0.28), 0 12px 30px rgba(255,255,255,0.12)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.borderColor = "#fff";
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 0 15px rgba(255,255,255,0.12)";
              }}
            >
              Get Started
            </button>
          </div>
        )}
      </nav>

      <main
        role="main"
        aria-label="Landing page hero section"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: isMobile ? "40px 20px" : "60px 20px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: isMobile ? "400px" : "600px",
            height: isMobile ? "400px" : "600px",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.03) 0%, rgba(10,10,10,0) 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
          aria-hidden="true"
        />

        <div
          style={{
            padding: "8px 16px",
            background: "#111",
            border: "1px solid #2a2a2a",
            borderRadius: "20px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "32px",

            // Glow
            boxShadow:
              "0 0 10px rgba(251, 253, 255, 0.25), 0 0 20px rgba(59,130,246,0.15)",
          }}
        >
          <Sparkles size={14} color="#e7eaed" aria-hidden="true" />
          <span
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color: "#ddd",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Next-Generation Technical Interviews
          </span>
        </div>

        <h1
          style={{
            fontSize: isMobile ? "36px" : "64px",
            fontWeight: "800",
            color: "#fff",
            lineHeight: "1.1",
            maxWidth: isMobile ? "100%" : "800px",
            margin: "0 0 24px",
            letterSpacing: "-0.02em",
          }}
        >
          Assess Engineering Talent with{" "}
          <span style={{ color: "#888" }}>Superhuman Precision</span>
        </h1>

        <p
          style={{
            fontSize: isMobile ? "15px" : "18px",
            color: "#888",
            lineHeight: "1.6",
            maxWidth: isMobile ? "100%" : "600px",
            margin: "0 0 48px",
            padding: isMobile ? "0 8px" : "0",
          }}
        >
          Camsense AI delivers high-fidelity mock interviews, dynamic coding
          sandboxes, and deep resume-based evaluation, removing bias and saving
          hundreds of engineering hours.
        </p>

        <div
          style={{
            display: "flex",
            gap: "16px",
            zIndex: 10,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => setCurrentTab("signup")}
            style={{
              padding: isMobile ? "14px 28px" : "16px 36px",
              background: "#fff",
              border: "none",
              borderRadius: "10px",
              color: "#000",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.3s ease",
              boxShadow: "0 0 18px rgba(255,255,255,0.18)",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-4px) scale(1.03)";
              e.currentTarget.style.boxShadow =
                "0 0 20px rgba(255,255,255,0.30), 0 0 40px rgba(255,255,255,0.2)";
              e.currentTarget.style.background = "#f8f8f8";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow =
                "0 0 18px rgba(255,255,255,0.18)";
              e.currentTarget.style.background = "#fff";
            }}
          >
            Start Interviewing <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>

        <section
          aria-label="Key features"
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: "24px",
            maxWidth: "1000px",
            margin: "80px auto 0",
            textAlign: "left",
            zIndex: 10,
            padding: isMobile ? "0 8px" : "0",
          }}
        >
          {features.map((f, i) => (
            <article
              key={i}
              style={{
                background: "#111",
                border: "1px solid #1e1e1e",
                borderRadius: "12px",
                padding: "32px",
                transition: "all 0.35s ease",
                cursor: "pointer",
                boxShadow: "0 0 0 rgba(255,255,255,0)",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.borderColor = "#3a3a3a";
                e.currentTarget.style.background = "#161616";
                e.currentTarget.style.boxShadow =
                  "0 0 20px rgba(255,255,255,0.08), 0 15px 35px rgba(0,0,0,0.35)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "#1e1e1e";
                e.currentTarget.style.background = "#111";
                e.currentTarget.style.boxShadow = "0 0 0 rgba(255,255,255,0)";
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  background: "#1a1a1a",
                  border: "1px solid #2a2a2a",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                  transition: "all 0.35s ease",
                }}
              >
                <f.icon size={24} color="#fff" aria-hidden="true" />
              </div>

              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: "600",
                  color: "#fff",
                  margin: "0 0 12px",
                  transition: "color 0.3s ease",
                }}
              >
                {f.title}
              </h3>

              <p
                style={{
                  fontSize: "14px",
                  color: "#888",
                  lineHeight: "1.6",
                  margin: 0,
                  transition: "color 0.3s ease",
                }}
              >
                {f.desc}
              </p>
            </article>
          ))}
        </section>
      </main>

      <footer
        role="contentinfo"
        style={{
          textAlign: "center",
          padding: "24px",
          borderTop: "1px solid #1a1a1a",
          fontSize: "12px",
          color: "#555",
        }}
      >
        <span>
          &copy; {new Date().getFullYear()} Camsense AI &mdash; AI Interview Platform
        </span>
      </footer>
    </div>
  );
}
