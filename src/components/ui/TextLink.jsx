export default function TextLink({ text, onClick, href = "#" }) {
  return (
    <a className="link" href={href} onClick={onClick}>
      {text}
    </a>
  );
}
