const StatCard = ({ title, value, subtitle, icon, trend, trendValue, color = "accent" }) => {
  const colorMap = {
    accent: "from-accent/20 to-accent/5 border-accent/30",
    success: "from-green-500/20 to-green-500/5 border-green-500/30",
    warning: "from-amber-500/20 to-amber-500/5 border-amber-500/30",
    danger: "from-red-500/20 to-red-500/5 border-red-500/30",
    info: "from-blue-500/20 to-blue-500/5 border-blue-500/30",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorMap[color]} border rounded-xl p-5
        hover:scale-[1.02] transition-all duration-300 cursor-default`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium
              ${trend === "up" ? "text-green-400" : "text-red-400"}`}>
              <span>{trend === "up" ? "↑" : "↓"}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-3xl opacity-60">{icon}</div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
