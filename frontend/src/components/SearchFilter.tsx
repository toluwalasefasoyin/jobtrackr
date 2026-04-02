import React from 'react';

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  onReset: () => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchQuery,
  onSearchChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onReset,
}) => {
  const hasFilters = searchQuery || startDate || endDate;

  return (
    <div className="backdrop-blur-xl bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-400/30 rounded-2xl p-6 mb-8">
      <div className="flex flex-col gap-6">
        {/* Title */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Advanced Filters</h3>
          <p className="text-sm text-gray-400">Search and filter your job applications</p>
        </div>

        {/* Search Input */}
        <div>
          <label className="block text-sm font-medium text-purple-200 mb-2">
            Search by Company or Role
          </label>
          <input
            type="text"
            placeholder="e.g., Google, Senior Developer..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-purple-400/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400/60 focus:bg-white/10 transition"
          />
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-purple-400/30 rounded-lg text-white focus:outline-none focus:border-purple-400/60 focus:bg-white/10 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-purple-400/30 rounded-lg text-white focus:outline-none focus:border-purple-400/60 focus:bg-white/10 transition"
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-medium text-purple-300">Active filters:</span>
            {searchQuery && (
              <span className="px-3 py-1 bg-purple-500/30 border border-purple-400/50 rounded-full text-xs text-purple-100">
                Search: {searchQuery}
              </span>
            )}
            {startDate && (
              <span className="px-3 py-1 bg-blue-500/30 border border-blue-400/50 rounded-full text-xs text-blue-100">
                From: {startDate}
              </span>
            )}
            {endDate && (
              <span className="px-3 py-1 bg-blue-500/30 border border-blue-400/50 rounded-full text-xs text-blue-100">
                To: {endDate}
              </span>
            )}
            <button
              onClick={onReset}
              className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 rounded-full text-xs text-red-200 transition"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilter;
