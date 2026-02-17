import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock } from "lucide-react";

import Logo from "../../components/ui/Logo";
import Card from "../../components/ui/Card";
import InputField from "../../components/ui/InputField";
import Button from "../../components/ui/Button";
import TextLink from "../../components/ui/TextLink";

export default function LoginPage() {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState(""); // email OR username
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Later: Firebase login here
    navigate("/admin/dashboard");
  };

  return (
    <div className="pageCenter">
      <div className="stack">
        <Logo />

        <Card>
          <h2 className="centerText" style={{ marginBottom: 16 }}>
            Login
          </h2>

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
              <TextLink text="Forgot password?" onClick={(e) => e.preventDefault()} />
            </div>

            <Button text="Login" type="submit" />

            <p className="centerText" style={{ marginTop: 10 }}>
            Don't have an account?{" "}
            <TextLink text="Sign up" onClick={(e) => e.preventDefault()} />
            </p>

          </form>
        </Card>
      </div>
    </div>
  );
}
