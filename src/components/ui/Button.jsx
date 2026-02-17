export default function Button({ text, onClick, type = "button" }) {
  return (
    <button className="btnPrimary" type={type} onClick={onClick}>
      {text}
    </button>
  );
}
