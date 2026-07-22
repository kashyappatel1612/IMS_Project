function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  name,
  id,
  error,
  helperText,
  icon: LeftIcon,
  rightAction: RightAction,
  onRightActionClick,
  required = false,
  className = "",
  ...props
}) {
  return (
    <div className={`input-field-group ${className}`}>
      {label && (
        <label htmlFor={id || name} className="input-label">
          {label} {required && <span style={{ color: "var(--danger)" }}>*</span>}
        </label>
      )}

      <div className="input-control-box">
        {LeftIcon && <LeftIcon className="input-left-icon" size={18} />}

        <input
          id={id || name}
          name={name}
          type={type}
          className={`custom-input-elem ${LeftIcon ? "has-left-icon" : ""} ${
            RightAction ? "has-right-action" : ""
          } ${error ? "input-error" : ""}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          {...props}
        />

        {RightAction && (
          <button
            type="button"
            className="input-right-action"
            onClick={onRightActionClick}
            tabIndex={-1}
          >
            <RightAction size={18} />
          </button>
        )}
      </div>

      {error && <span className="input-error-msg">{error}</span>}
      {!error && helperText && <span className="input-helper-msg">{helperText}</span>}
    </div>
  );
}

export default Input;
