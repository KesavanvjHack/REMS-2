const ExportButton = ({ onExport, label = "Export", loading = false }) => {
  return (
    <button
      onClick={onExport}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-dark-700 border border-dark-600
        rounded-lg text-sm font-medium text-gray-300
        hover:bg-dark-600 hover:text-white transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
      ) : (
        <span>📥</span>
      )}
      {label}
    </button>
  );
};

export default ExportButton;
