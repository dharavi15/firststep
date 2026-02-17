export default function InputField({ icon: Icon, type, placeholder, value, onChange }) {
  return (
    <div className="field">
      {Icon ? <Icon className="fieldIcon" /> : null}
      <input
        className="input"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
