import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { loginWithEmailPassword } from "../../firebase/auth";
import { getUserProfile } from "../../firebase/userProfile";
import useAuthStore from "../../store/useAuthStore";

import Logo from "../../components/ui/Logo";
import Card from "../../components/ui/Card";
import InputField from "../../components/ui/InputField";
import Button from "../../components/ui/Button";
import TextLink from "../../components/ui/TextLink";

// Mock accounts for local UI testing
// Change these values if you want different mock login
const MOCK_PARENT_EMAIL = "mock_parent@local.dev";
const MOCK_ADMIN_EMAIL = "mock_admin@local.dev";
const MOCK_PASSWORD = "12345678";

export default function LoginPage() {
  const navigate = useNavigate();

  // Local form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Global auth store actions
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const setStoreError = useAuthStore((s) => s.setError);

  // This function runs when user submits the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStoreError("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Basic empty check
    if (!cleanEmail || !cleanPassword) {
      setError("Please enter email and password");
      return;
    }

    // Basic email format check
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);
    if (!isEmail) {
      setError("Please use a valid email address");
      return;
    }

    // Mock login path
    // This bypasses Firebase and only redirects to mock pages
    const isMockPassword = cleanPassword === MOCK_PASSWORD;
    const isMockParent = cleanEmail === MOCK_PARENT_EMAIL;
    const isMockAdmin = cleanEmail === MOCK_ADMIN_EMAIL;

    if ((isMockParent || isMockAdmin) && isMockPassword) {
      setLoading(true);

      // Save a simple user object to store for UI usage
      // No database call happens in mock mode
      const mockUser = {
        uid: isMockAdmin ? "mock-admin" : "mock-parent",
        email: cleanEmail,
        role: isMockAdmin ? "admin" : "parent",
        isMock: true,
      };

      setUser(mockUser);

      // Redirect based on mock role
      if (isMockAdmin) {
        navigate("/admin/dashboard");
      } else {
        navigate("/parent/dashboard");
      }

      setLoading(false);
      return;
    }

    // Firebase login path
    // This will run only when the input is not the mock account
    try {
      setLoading(true);

      // Login with Firebase Auth
      const user = await loginWithEmailPassword(cleanEmail, cleanPassword);
      setUser(user);

      // Read user role from Firestore profile
      const profile = await getUserProfile(user.uid);

      if (!profile) {
        setError("User profile not found");
        return;
      }

      if (profile.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/parent/dashboard");
      }
    } catch (err) {
      setError(err?.message || "Login failed");
      setStoreError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pageCenter">
      <div className="stack">
        <Logo />

        <Card>
          <h2 className="centerText" style={{ marginBottom: 16 }}>
            Login
          </h2>

          {error && (
            <p style={{ color: "var(--color-error)", marginTop: 0 }}>
              {error}
            </p>
          )}

          <form className="form" onSubmit={handleSubmit}>
            <InputField
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <InputField
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="rowRight">
              <TextLink
                text="Forgot password"
                onClick={(e) => e.preventDefault()}
              />
            </div>

            <Button text="Login" type="submit" />

            <p className="centerText" style={{ marginTop: 10 }}>
              Do not have an account{" "}
              <TextLink text="Sign up" onClick={(e) => e.preventDefault()} />
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}