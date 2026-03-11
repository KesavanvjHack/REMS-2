const FilterBar = ({ filters, onFilterChange }) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {filters.map((filter) => (
        <div key={filter.name}>
          {filter.type === "select" ? (
            <select
              value={filter.value}
              onChange={(e) => onFilterChange(filter.name, e.target.value)}
              className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2
                text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-accent/50
                transition-all duration-200"
            >
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={filter.type || "text"}
              value={filter.value}
              onChange={(e) => onFilterChange(filter.name, e.target.value)}
              placeholder={filter.placeholder}
              className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2
                text-sm text-gray-300 placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-accent/50
                transition-all duration-200"
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default FilterBar;
