export default function Button({
  children,
  text, // support old usage: <Button text="Login" />
  onClick,
  type = "button",
  className = "",
  disabled = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btnPrimary ${className}`}
    >
      {children ?? text}
    </button>
  );
}