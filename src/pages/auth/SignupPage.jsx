/*// src/pages/auth/SignupPage.jsx
import { useNavigate } from "react-router-dom";

import Logo from "../../components/ui/Logo";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function SignupPage() {
  const navigate = useNavigate();

  return (
    <div className="pageCenter authPage">
      <div className="authStack">
        <Card className="authCard">
          <div className="logoWrap">
            <Logo />
          </div>

          <h2 className="authTitle">Admin Signup Disabled</h2>

          <p style={{ marginTop: 6, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
            For security reasons, new admin accounts can only be created by the system owner.
            Please contact your school administrator to get access.
          </p>

          <div style={{ marginTop: 18 }}>
            <Button
              className="btnPrimary"
              text="Go to Admin Login"
              type="button"
              onClick={() => navigate("/login")}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}*/