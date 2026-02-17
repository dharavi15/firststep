import logoImg from "../../assets/img_-_logo.jpg";

export default function Logo() {
  return (
    <div className="logoWrap">
      <img src={logoImg} alt="FirstStep logo" style={{ height: 80 }} />
    </div>
  );
}
