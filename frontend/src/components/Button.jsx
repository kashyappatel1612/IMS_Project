function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  disabled = false,
  icon: Icon,
  onClick,
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      className={`custom-btn btn-${variant} btn-${size} ${fullWidth ? "btn-block" : ""} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="btn-spinner"></span>
      ) : Icon ? (
        <Icon size={size === "sm" ? 14 : size === "lg" ? 20 : 18} />
      ) : null}
      <span>{children}</span>
    </button>
  );
}

export default Button;
