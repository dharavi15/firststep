import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { loginWithEmailPassword } from "../../firebase/auth";
import { getUserProfile } from "../../firebase/userProfile";
import useAuthStore from "../../store/useAuthStore";

import Logo from "../../components/ui/Logo";
import Card from "../../components/ui/Card";
import InputField from "../../components/ui/InputField";
import Button from "../../components/ui/Button";
import TextLink from "../../components/ui/TextLink";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email"),
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

      // users docId = UID
      const profile = await getUserProfile(authUser.uid);

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
        return;
      }

      navigate("/parent/dashboard");
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

          <h2 className="authTitle">Login</h2>

          {localError && <div className="statusSuccess">{localError}</div>}

          <form className="authForm" onSubmit={handleSubmit}>
            <InputField
              type="email"
              placeholder="Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <InputField
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="authRowRight">
              <TextLink text="Forgot password?" onClick={(e) => e.preventDefault()} />
            </div>

            <Button
              className="btnPrimary"
              text={loading ? "Logging in..." : "Login"}
              type="submit"
              disabled={loading}
            />

            <div className="rowCenter">
              <TextLink text="Sign up" onClick={(e) => e.preventDefault()} />
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}