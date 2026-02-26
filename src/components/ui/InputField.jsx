/*export default function InputField({
  icon: Icon,
  type = "text",
  placeholder,
  value,
  onChange,
  name,
  id,
  autoComplete,
  inputMode,
  required = false,
}) {
  return (
    <div className="field">
      {Icon ? <Icon className="fieldIcon" /> : null}

      <input
        className="inputField input"
        type={type}
        name={name}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        inputMode={inputMode}
        required={required}
      />
    </div>
  );
}*/

export default function InputField({
  icon: Icon,
  type = "text",
  placeholder,
  value,
  onChange,
  name,
  autoComplete,
}) {
  return (
    <div className="field">
      {Icon ? <Icon className="fieldIcon" /> : null}

      <input
        className="inputField"
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
      />
    </div>
  );
}