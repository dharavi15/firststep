// src/pages/home/SchoolLandingPage.jsx
import { useNavigate } from "react-router-dom";
import "./SchoolLandingPage.css";
import logoImg from "../../assets/firststep-logo.jpg";

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
          >
            <img src={logoImg} alt="FirstStep Logo" className="brandLogo" />
            <span className="brandText">FirstStep</span>
          </div>

          <nav className="landingLinks">
            <a href="#home">Home</a>
            <a href="#how">How it Works</a>
            <a href="#for">About Us</a>
          </nav>

          <div className="landingActions">
            <button className="btnGhost" onClick={() => navigate("/login")}>
              Admin Login
            </button>
            <button className="btnPrimary" onClick={() => navigate("/signup")}>
              Get Started
            </button>
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

              <div className="heroBtns">
                <button className="btnPrimary" onClick={() => navigate("/signup")}>
                  Get started for School
                </button>

                <button
                  className="btnGreen"
                  onClick={() => alert("Parent module coming soon")}
                >
                  Parent Sign In
                </button>
              </div>
            </div>

            {/* ✅ Simple blank illustration box */}
            <div className="heroRight">
              <div className="heroImageBox">
                Illustration Image Here
              </div>
            </div>
          </div>
        </section>

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
              <h4>1. Create Onboarding Flow</h4>
              <div className="howPlaceholder">Step 1 Image</div>
              <p>Schools set up custom steps</p>
            </div>

            <div className="howItem">
              <h4>2. Parents Follow the Steps</h4>
              <div className="howPlaceholder">Step 2 Image</div>
              <p>Parents complete tasks one by one</p>
            </div>

            <div className="howItem">
              <h4>3. Track & Complete</h4>
              <div className="howPlaceholder">Step 3 Image</div>
              <p>Monitor progress easily</p>
            </div>
          </div>
        </section>

        {/* About Us */}
        <section className="for" id="for">
          <div className="forGrid">
            <div className="forCard">
              <h3>For School Staff</h3>
              <ul>
                <li>Design onboarding journeys</li>
                <li>Manage forms & payments</li>
                <li>Monitor parent progress</li>
              </ul>
            </div>

            <div className="forCard">
              <h3>For Parents</h3>
              <ul>
                <li>View your to-do list</li>
                <li>Upload documents</li>
                <li>Stay informed</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta">
          <h2>Get Started with FirstStep Today!</h2>
          <button className="btnGreen big" onClick={() => navigate("/signup")}>
            Get Started Now
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