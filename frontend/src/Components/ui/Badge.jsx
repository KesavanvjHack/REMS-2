const Badge = ({ children, variant = "default" }) => {
  const variants = {
    default: "bg-gray-500/20 text-gray-300",
    success: "bg-green-500/20 text-green-400",
    warning: "bg-amber-500/20 text-amber-400",
    danger: "bg-red-500/20 text-red-400",
    info: "bg-blue-500/20 text-blue-400",
    accent: "bg-accent/20 text-accent",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

export default Badge;
