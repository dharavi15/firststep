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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const setStoreError = useAuthStore((s) => s.setError);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setStoreError("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setLocalError("Please enter email and password");
      return;
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);
    if (!isEmail) {
      setLocalError("Please use a valid email address");
      return;
    }

    try {
      setLoading(true);

      const authUser = await loginWithEmailPassword(cleanEmail, cleanPassword);

      // This must be allowed by Firestore Rules
      const profile = await getUserProfile(authUser.email);

      if (!profile) {
        setLocalError("User profile not found in Firestore (users).");
        return;
      }

      if (profile.isActive === false) {
        setLocalError("This account is inactive.");
        return;
      }

      const role = profile.role;

      if (role !== "admin" && role !== "parent") {
        setLocalError("Invalid role in user profile.");
        return;
      }

      setUser({
        uid: authUser.uid,
        email: authUser.email,
        role,
        fullName: profile.fullName || "",
        schoolId: profile.schoolId || "",
      });

      if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/parent/dashboard");
      }
    } catch (err) {
      const msg = err?.message || "Login failed";
      const lower = String(msg).toLowerCase();

      if (lower.includes("permission") || lower.includes("insufficient")) {
        setLocalError(
          "Missing or insufficient permissions. Please update Firestore Rules."
        );
      } else if (lower.includes("auth/invalid-credential")) {
        setLocalError("Wrong email or password");
      } else {
        setLocalError(msg);
      }

      setStoreError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: 48,
        paddingLeft: 16,
        paddingRight: 16,
      }}
    >
      <Card>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <Logo />
        </div>

        <h2>Login</h2>

        {localError && <p>{localError}</p>}

        <form onSubmit={handleSubmit}>
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

          <div>
            <TextLink text="Forgot password" onClick={(e) => e.preventDefault()} />
          </div>

          <Button text="Login" type="submit" />

          <p>
            Do not have an account{" "}
            <TextLink text="Sign up" onClick={(e) => e.preventDefault()} />
          </p>
        </form>
      </Card>
    </div>
  );
}