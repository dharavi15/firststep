// src/components/ui/TextLink.jsx
export default function TextLink({
  children,
  text,
  onClick,
  href = "#",
  className = "",
}) {
  return (
    <a
      className={`textLink ${className}`}
      href={href}
      onClick={(e) => {
        // prevent page jump when using onClick navigation
        if (onClick) e.preventDefault();
        onClick?.(e);
      }}
    >
      {children ?? text}
    </a>
  );
}