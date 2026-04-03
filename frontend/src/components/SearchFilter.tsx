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
    <div className="bg-surface-container ghost-border rounded-xl p-6 mb-8">
      <div className="flex flex-col gap-6">
        {/* Title */}
        <div>
          <h3 className="text-sm font-bold tracking-widest text-white uppercase mb-1">Advanced Filters</h3>
          <p className="text-xs text-on-surface-variant">Search and filter your job applications</p>
        </div>

        {/* Search Input */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">
            Search by Company or Role
          </label>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg group-focus-within:text-primary transition-colors">
              search
            </span>
            <input
              type="text"
              placeholder="e.g., Google, Senior Developer..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-surface-container-lowest ghost-border rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder:text-outline/50 focus:outline-none focus:ring-1 focus:ring-primary/80 transition-all duration-300"
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full bg-surface-container-lowest ghost-border rounded-lg py-3 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/80 transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full bg-surface-container-lowest ghost-border rounded-lg py-3 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/80 transition-all duration-300"
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Active:</span>
            {searchQuery && (
              <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-bold text-primary uppercase tracking-wider">
                Search: {searchQuery}
              </span>
            )}
            {startDate && (
              <span className="px-3 py-1 bg-secondary-container/10 border border-secondary/20 rounded-full text-[10px] font-bold text-secondary uppercase tracking-wider">
                From: {startDate}
              </span>
            )}
            {endDate && (
              <span className="px-3 py-1 bg-secondary-container/10 border border-secondary/20 rounded-full text-[10px] font-bold text-secondary uppercase tracking-wider">
                To: {endDate}
              </span>
            )}
            <button
              onClick={onReset}
              className="px-3 py-1 bg-error/10 hover:bg-error/20 border border-error/20 rounded-full text-[10px] font-bold text-error uppercase tracking-wider transition-colors"
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
