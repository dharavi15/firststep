// src/pages/auth/ForgotPasswordPage.jsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { z } from "zod";

import Logo from "../../components/ui/Logo";
import Card from "../../components/ui/Card";
import InputField from "../../components/ui/InputField";
import Button from "../../components/ui/Button";
import TextLink from "../../components/ui/TextLink";

import { requestPasswordReset } from "../../firebase/auth";

const schema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
});

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => email.trim() && !loading, [email, loading]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setFieldError("");
    setStatus("");

    const result = schema.safeParse({ email });
    if (!result.success) {
      setFieldError(result.error.flatten().fieldErrors.email?.[0] || "Invalid email");
      return;
    }

    try {
      setLoading(true);
      await requestPasswordReset(result.data.email);
      setStatus("Password reset email sent. Please check your inbox.");
    } catch (err) {
      console.log("RESET ERROR:", err.code, err.message);
      setFieldError("Could not send reset email. Please try again.");
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
            Forgot password
          </h2>

          {status && <p className="statusSuccess">{status}</p>}

          {fieldError && (
            <p style={{ color: "var(--color-error)", marginTop: 0, marginBottom: 12 }}>
              {fieldError}
            </p>
          )}

          <form className="form" onSubmit={onSubmit}>
            <InputField
              icon={Mail}
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Button text={loading ? "Sending..." : "Send reset link"} type="submit" disabled={!canSubmit} />

            <p className="centerText" style={{ marginTop: 10 }}>
              Back to{" "}
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