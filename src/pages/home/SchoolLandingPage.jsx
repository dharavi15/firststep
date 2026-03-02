// src/pages/home/SchoolLandingPage.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SchoolLandingPage.css";

import logoImg from "../../assets/firststep-logo.jpg";
import heroImg from "../../assets/landing-hero.png";
import step1Img from "../../assets/step1.png";
import step2Img from "../../assets/step2.png";
import step3Img from "../../assets/step3.png";
import staffBanner from "../../assets/for school staff.png";
import parentsBanner from "../../assets/for parents.png";

export default function SchoolLandingPage() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (!open) return;
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    function handleEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div className="landing">
      {/* Top Nav */}
      <header className="landingNav">
        <div className="landingNavInner">
          <div
            className="brand"
            onClick={() => navigate("/")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") navigate("/");
            }}
          >
            <img src={logoImg} alt="FirstStep Logo" className="brandLogo" />
            <span className="brandText">FirstStep</span>
          </div>

          {/* Right side group */}
          <div className="navRight">
            <nav className="landingLinks">
              {/* ✅ Features scrolls to anchor above cards so hero stays visible */}
              <a href="#features">Features</a>
              <a href="#how">How it Works</a>
              <a href="#for">About Us</a>
            </nav>

            {/* Login dropdown */}
            <div className="landingActions" ref={dropdownRef}>
              <button
                className="btnPrimary btnDropdown"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setOpen((v) => !v);
                  }
                }}
                type="button"
              >
                Login <span className={`chev ${open ? "up" : ""}`}>▾</span>
              </button>

              {open && (
                <div className="dropdownMenu" role="menu">
                  <button
                    className="dropdownItem"
                    role="menuitem"
                    type="button"
                    onClick={() => go("/login?role=parent")}
                  >
                    Parent Login
                  </button>
                  <button
                    className="dropdownItem"
                    role="menuitem"
                    type="button"
                    onClick={() => go("/login?role=admin")}
                  >
                    Admin Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="landingMain" id="home">
        {/* Hero */}
        <section className="hero">
          <div className="heroInner">
            <div className="heroLeft">
              <h1>
                Streamline Your <br />
                School Onboarding
              </h1>

              <p>
                A simple way to guide parents and students through onboarding
                steps, deadlines, uploads, and progress tracking.
              </p>
            </div>

            <div className="heroRight">
              <div className="heroImageBox">
                <img
                  src={heroImg}
                  alt="FirstStep onboarding illustration"
                  className="heroImg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ✅ Anchor ABOVE feature cards (so hero still visible like your Image 2) */}
        <div id="features" className="featuresAnchor" />

        {/* Feature Strip */}
        <section className="featureStrip">
          <div className="featureGrid">
            <div className="featureCard">
              <div className="featureIcon">✅</div>
              <div>
                <h3>Easy Steps</h3>
                <p>Clear tasks and deadlines</p>
              </div>
            </div>

            <div className="featureCard">
              <div className="featureIcon">📁</div>
              <div>
                <h3>Document Uploads</h3>
                <p>Upload forms securely</p>
              </div>
            </div>

            <div className="featureCard">
              <div className="featureIcon">📈</div>
              <div>
                <h3>Track Progress</h3>
                <p>See status at a glance</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="how" id="how">
          <h2>How FirstStep Works</h2>

          <div className="howGrid">
            <div className="howItem">
              <img
                src={step1Img}
                alt="Create onboarding flow"
                className="howImg"
              />
            </div>

            <div className="howItem">
              <img
                src={step2Img}
                alt="Parents follow steps"
                className="howImg"
              />
            </div>

            <div className="howItem">
              <img src={step3Img} alt="Track progress" className="howImg" />
            </div>
          </div>
        </section>

        {/* About Us */}
        <section className="for" id="for">
          <div className="forInner">
            <div className="forGrid">
              <div className="forCardImg">
                <img
                  src={staffBanner}
                  alt="For School Staff"
                  className="forBanner"
                />
              </div>

              <div className="forCardImg">
                <img
                  src={parentsBanner}
                  alt="For Parents"
                  className="forBanner"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta">
          <h2>Get Started with FirstStep Today!</h2>
          <button className="btnGreen big" onClick={() => navigate("/signup")}>
            Enroll Now
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="landingFooter">
        <div className="landingFooterInner">
          <span>© {new Date().getFullYear()} FirstStep</span>
          <span className="footerDot">•</span>
          <span>Registered School Only</span>
        </div>
      </footer>
    </div>
  );
}