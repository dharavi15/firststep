import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";

import { auth } from "../../firebase/firebase";
import { getUserProfile } from "../../firebase/userProfile";

import Logo from "../../components/ui/Logo";
import Card from "../../components/ui/Card";
import InputField from "../../components/ui/InputField";
import Button from "../../components/ui/Button";
import TextLink from "../../components/ui/TextLink";

export default function LoginPage() {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const id = identifier.trim();
    const pass = password.trim();

    // check the empty fields
    if (!id || !pass) {
      setError("Please enter email and password.");
      return;
    }

    //   firebase needs email so check email format
    const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id);
    if (!looksLikeEmail) {
      setError("For now, please sign in using your email (not username).");
      return;
    }

    try {
      //sign in firebase 
      const cred = await signInWithEmailAndPassword(auth, id, pass);
      const uid = cred.user.uid;

      // to get user role from firestore
      const profile = await getUserProfile(uid);

      if (!profile) {
        setError("User profile not found in Firestore (users collection).");
        return;
      }

      // redirest based on role
      if (profile.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/parent/dashboard");
      }
    } catch (err) {
      // shows error
      console.log("FIREBASE LOGIN ERROR:", err.code, err.message);

      setError(`${err.code} — ${err.message}`);
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
              icon={User}
              type="text"
              placeholder="Email or Username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />

            <InputField
              icon={Lock}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="rowRight">
              <TextLink
                text="Forgot password?"
                onClick={(e) => e.preventDefault()}
              />
            </div>

            <Button text="Login" type="submit" />

            <p className="centerText" style={{ marginTop: 10 }}>
              Don&apos;t have an account?{" "}
              <TextLink text="Sign up" onClick={(e) => e.preventDefault()} />
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
