// src/pages/auth/LoginPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { signOut } from "firebase/auth";
import { Mail, Lock } from "lucide-react";

import { loginWithEmailPassword } from "../../firebase/auth";
import { getUserProfile } from "../../firebase/userProfile";
import useAuthStore from "../../store/useAuthStore";
import { auth } from "../../firebase/firebase";

import Logo from "../../components/ui/Logo";
import Card from "../../components/ui/Card";
import InputField from "../../components/ui/InputField";
import Button from "../../components/ui/Button";
import TextLink from "../../components/ui/TextLink";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [loading, setLoadingLocal] = useState(false);

  const setUser = useAuthStore((s) => s.setUser);
  const setStoreLoading = useAuthStore((s) => s.setLoading);

  const setErrorFromStore = useAuthStore((s) => s.setError);
  const setStoreErrorFallback = useAuthStore((s) => s.setStoreError);
  const setStoreError =
    typeof setErrorFromStore === "function"
      ? setErrorFromStore
      : typeof setStoreErrorFallback === "function"
      ? setStoreErrorFallback
      : () => {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setStoreError("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const parsed = loginSchema.safeParse({ email: cleanEmail, password: cleanPassword });
    if (!parsed.success) {
      const firstError =
        parsed.error?.flatten()?.fieldErrors?.email?.[0] ||
        parsed.error?.flatten()?.fieldErrors?.password?.[0] ||
        "Please check your input";
      setLocalError(firstError);
      return;
    }

    try {
      setLoadingLocal(true);
      setStoreLoading(true);

      const authUser = await loginWithEmailPassword(cleanEmail, cleanPassword);

      const profile = await getUserProfile(authUser.uid);

      if (!profile) {
        const msg = "User profile not found in Firestore (users).";
        setLocalError(msg);
        setStoreError(msg);
        await signOut(auth);
        return;
      }

      if (profile.isActive === false) {
        const msg = "This account is inactive.";
        setLocalError(msg);
        setStoreError(msg);
        await signOut(auth);
        return;
      }

      if (profile.role !== "admin") {
        const msg = "Access denied. Only admin accounts can log in.";
        setLocalError(msg);
        setStoreError(msg);
        await signOut(auth);
        return;
      }

      setUser({
        uid: authUser.uid,
        email: authUser.email || cleanEmail,
        role: "admin",
        fullName: profile.fullName || profile.name || "",
        schoolId: profile.schoolId || "",
      });

      navigate("/admin/dashboard");
    } catch (err) {
      console.log("FIREBASE LOGIN ERROR:", err?.code, err?.message);

      const code = err?.code || "";
      let msg = err?.message || "Login failed. Please try again.";

      if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
        msg = "Incorrect email or password.";
      } else if (code === "auth/user-not-found") {
        msg = "No account found with this email.";
      } else if (code === "auth/too-many-requests") {
        msg = "Too many attempts. Try again later.";
      } else if (code === "auth/network-request-failed") {
        msg = "Network error. Check your internet and try again.";
      }

      setLocalError(msg);
      setStoreError(msg);
    } finally {
      setLoadingLocal(false);
      setStoreLoading(false);
    }
  };

  return (
    <div className="pageCenter authPage">
      <div className="authStack">
        <Card className="authCard">
          <div className="logoWrap">
            <Logo />
          </div>

          <h2 className="authTitle">Admin Login</h2>

          {localError && <div className="statusSuccess">{localError}</div>}

          <form className="authForm" onSubmit={handleSubmit}>
            <InputField
              icon={Mail}
              type="email"
              name="email"
              autoComplete="username"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <InputField
              icon={Lock}
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="authRowRight">
              <TextLink
                text="Forgot password?"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/forgot-password");
                }}
              />
            </div>

            <Button
              className="btnPrimary"
              text={loading ? "Logging in..." : "Login"}
              type="submit"
              disabled={loading}
            />
          </form>
        </Card>
      </div>
    </div>
  );
}