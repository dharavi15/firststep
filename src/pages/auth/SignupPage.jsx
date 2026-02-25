// src/pages/auth/SignupPage.jsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock } from "lucide-react";
import { z } from "zod";

import Logo from "../../components/ui/Logo";
import Card from "../../components/ui/Card";
import InputField from "../../components/ui/InputField";
import Button from "../../components/ui/Button";
import TextLink from "../../components/ui/TextLink";

import { signupAdmin } from "../../firebase/auth";

const schema = z
  .object({
    fullName: z.string().trim().min(2, "Full name is required"),
    email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function SignupPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return fullName.trim() && email.trim() && password && confirmPassword && !loading;
  }, [fullName, email, password, confirmPassword, loading]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const result = schema.safeParse({ fullName, email, password, confirmPassword });
    if (!result.success) {
      setFieldErrors(result.error.flatten().fieldErrors);
      return;
    }

    try {
      setLoading(true);

      await signupAdmin({
        fullName: result.data.fullName,
        email: result.data.email,
        password: result.data.password,
      });

      navigate("/admin/dashboard");
    } catch (err) {
      console.log("SIGNUP ERROR:", err.code, err.message);

      const code = err?.code || "";
      if (code === "auth/email-already-in-use") setError("This email is already in use.");
      else if (code === "auth/invalid-email") setError("Enter a valid email.");
      else if (code === "auth/weak-password") setError("Password is too weak.");
      else setError("Signup failed. Please try again.");
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
            Admin Sign up
          </h2>

          {error && (
            <p style={{ color: "var(--color-error)", marginTop: 0, marginBottom: 12 }}>
              {error}
            </p>
          )}

          <form className="form" onSubmit={onSubmit}>
            <InputField
              icon={User}
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            {fieldErrors.fullName?.[0] && (
              <p style={{ color: "var(--color-error)", marginTop: -10, marginBottom: 10 }}>
                {fieldErrors.fullName[0]}
              </p>
            )}

            <InputField
              icon={Mail}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {fieldErrors.email?.[0] && (
              <p style={{ color: "var(--color-error)", marginTop: -10, marginBottom: 10 }}>
                {fieldErrors.email[0]}
              </p>
            )}

            <InputField
              icon={Lock}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {fieldErrors.password?.[0] && (
              <p style={{ color: "var(--color-error)", marginTop: -10, marginBottom: 10 }}>
                {fieldErrors.password[0]}
              </p>
            )}

            <InputField
              icon={Lock}
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {fieldErrors.confirmPassword?.[0] && (
              <p style={{ color: "var(--color-error)", marginTop: -10, marginBottom: 10 }}>
                {fieldErrors.confirmPassword[0]}
              </p>
            )}

            <Button
              text={loading ? "Creating..." : "Create Admin Account"}
              type="submit"
              disabled={!canSubmit}
            />

            <p className="centerText" style={{ marginTop: 10 }}>
              Already have an account?{" "}
              <TextLink
                text="Login"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/");
                }}
              />
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}