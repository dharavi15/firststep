// src/components/ui/InputField.jsx
export default function InputField({
  icon: Icon,
  type = "text",
  placeholder,
  value,
  onChange,
  name,
  autoComplete,
  required = true,
  disabled = false,
}) {
  const aria = placeholder || name || "input";

  return (
    <div className="field" role="group" aria-label={aria}>
      {Icon ? <Icon className="fieldIcon" aria-hidden="true" /> : null}

      <input
        className="input"
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        aria-label={aria}
      />
    </div>
  );
}