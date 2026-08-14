function Card({
  children,
  title,
  subtitle,
  action,
  hoverable = false,
  className = "",
  ...props
}) {
  return (
    <div
      className={`custom-card ${hoverable ? "card-hoverable" : ""} ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className="card-header-bar">
          <div>
            {title && <h3 className="card-heading-title">{title}</h3>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export default Card;
