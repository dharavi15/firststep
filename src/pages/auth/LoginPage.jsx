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

export default function LoginPage() {
  const navigate = useNavigate();

  // Local form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Auth store actions
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const setStoreError = useAuthStore((s) => s.setError);

  // This function runs when the form is submitted
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStoreError("");

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    // Check empty fields
    if (!cleanEmail || !cleanPassword) {
      setError("Please enter email and password");
      return;
    }

    // Check email format
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);
    if (!isEmail) {
      setError("Please use a valid email address");
      return;
    }

    try {
      // Start loading state
      setLoading(true);

      // Login with Firebase Auth
      const user = await loginWithEmailPassword(cleanEmail, cleanPassword);

      // Save user to global auth store
      setUser(user);

      // Read user profile from Firestore
      const profile = await getUserProfile(user.uid);

      if (!profile) {
        setError("User profile not found");
        return;
      }

      // Redirect based on role
      if (profile.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/parent/dashboard");
      }
    } catch (error) {
      // Show simple error message
      setError(error?.message || "Login failed");
      setStoreError(error?.message || "Login failed");
    } finally {
      // Stop loading state
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