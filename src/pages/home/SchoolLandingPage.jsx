// src/pages/home/SchoolLandingPage.jsx
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
              <a href="#features">Features</a>
              <a href="#how">How it Works</a>
              <a href="#for">About Us</a>
            </nav>

            {/* ✅ Admin-only login */}
            <div className="landingActions">
              <button
                className="btnPrimary"
                type="button"
                onClick={() => navigate("/login")}
              >
                Admin Login
              </button>
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

        {/* Anchor ABOVE feature cards */}
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
              <img src={step1Img} alt="Create onboarding flow" className="howImg" />
            </div>

            <div className="howItem">
              <img src={step2Img} alt="Parents follow steps" className="howImg" />
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
                <img src={staffBanner} alt="For School Staff" className="forBanner" />
              </div>

              <div className="forCardImg">
                <img src={parentsBanner} alt="For Parents" className="forBanner" />
              </div>
            </div>
          </div>
        </section>

        {/* ✅ CTA replaced with future scope message */}
<section className="cta">
  <span className="ctaBadge">Coming Soon</span>

  <h2>Get Started with FirstStep Today!</h2>

  <p className="comingSoonText">
    Parent enrollment portal coming soon.
  </p>
</section>
      </main>

      {/* Footer */}
      <footer className="landingFooter">
        <div className="landingFooterInner">
          <span>Copyright © {new Date().getFullYear()} - FirstStep</span>
        </div>
      </footer>
    </div>
  );
}