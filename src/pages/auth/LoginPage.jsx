// src/pages/auth/LoginPage.jsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { z } from "zod";

import { auth } from "../../firebase/firebase";
import { getUserProfile } from "../../firebase/userProfile";

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

  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.length > 0 && !loading;
  }, [email, password, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({ email: "", password: "" });

    // ✅ Zod validation
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const errs = result.error.flatten().fieldErrors;
      setFieldErrors({
        email: errs.email?.[0] ?? "",
        password: errs.password?.[0] ?? "",
      });
      return;
    }

    try {
      setLoading(true);

      const cred = await signInWithEmailAndPassword(
        auth,
        result.data.email,
        result.data.password
      );

      const uid = cred.user.uid;
      const profile = await getUserProfile(uid);

      if (!profile) {
        setError("User profile not found in Firestore (users collection).");
        return;
      }

      if (profile.role === "admin") {
        navigate("/admin/dashboard");
        return;
      }

      // If you don't have parent routes yet, keep this as "/" or create parent routes
      if (profile.role === "parent") {
        navigate("/parent/dashboard");
        return;
      }

      setError("Your account role is missing. Please contact admin.");
    } catch (err) {
      console.log("FIREBASE LOGIN ERROR:", err.code, err.message);

      const code = err?.code || "";
      if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
        setError("Incorrect email or password.");
      } else if (code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Try again later.");
      } else if (code === "auth/network-request-failed") {
        setError("Network error. Check your internet and try again.");
      } else {
        setError(err?.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pageCenter authPage">
      <div className="stack">
        <Logo />

        <Card>
          <h2 className="centerText" style={{ marginBottom: 14 }}>
            Login
          </h2>

          {error && (
            <p
              style={{
                color: "var(--color-error)",
                marginTop: 0,
                marginBottom: 12,
              }}
            >
              {error}
            </p>
          )}

          <form className="form" onSubmit={handleSubmit}>
            <InputField
              icon={User}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {fieldErrors.email && (
              <p
                style={{
                  color: "var(--color-error)",
                  marginTop: -10,
                  marginBottom: 10,
                }}
              >
                {fieldErrors.email}
              </p>
            )}

            <InputField
              icon={Lock}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {fieldErrors.password && (
              <p
                style={{
                  color: "var(--color-error)",
                  marginTop: -10,
                  marginBottom: 10,
                }}
              >
                {fieldErrors.password}
              </p>
            )}

            <div className="rowRight">
              <TextLink
                text="Forgot password?"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/forgot-password");
                }}
              />
            </div>

            <Button
              text={loading ? "Logging in..." : "Login"}
              type="submit"
              disabled={!canSubmit}
            />

            <p className="centerText" style={{ marginTop: 10 }}>
              Don&apos;t have an admin account?{" "}
              <TextLink
                text="Sign up"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/signup");
                }}
              />
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}