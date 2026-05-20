import React, { useState } from "react";
import { api, SearchResult } from "../api/client";

export const SearchPage: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [limit, setLimit] = useState<number>(3);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  
  // Track expanded state for each result card
  const [expandedIndices, setExpandedIndices] = useState<{ [key: number]: boolean }>({});

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    setExpandedIndices({});

    try {
      const data = await api.searchDocuments(query, limit);
      // Sort by score descending just in case the API doesn't do it automatically
      const sorted = [...data].sort((a, b) => b.score - a.score);
      setResults(sorted);
    } catch (err) {
      console.error("Search API Error:", err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setQuery(suggestion);
    
    setIsLoading(true);
    setHasSearched(true);
    setExpandedIndices({});

    try {
      const data = await api.searchDocuments(suggestion, limit);
      const sorted = [...data].sort((a, b) => b.score - a.score);
      setResults(sorted);
    } catch (err) {
      console.error("Search API Error:", err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = (index: number) => {
    setExpandedIndices((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Helper to Highlight Matching Words in chunks
  const highlightText = (text: string, queryText: string) => {
    if (!queryText.trim()) return text;
    
    // Split query by spaces and clean up
    const searchWords = queryText
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2); // only highlight words longer than 2 characters

    if (searchWords.length === 0) return text;

    // Create a regular expression matching any of the words
    const regexPattern = new RegExp(`\\b(${searchWords.join("|")})\\b`, "gi");
    const textParts = text.split(regexPattern);

    return textParts.map((part, index) =>
      regexPattern.test(part) ? (
        <mark 
          key={index} 
          className="bg-yellow-250 text-yellow-900 px-0.5 font-bold rounded"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const suggestions = [
    "MERN developer",
    "Spring Boot engineer",
    "Candidates with 5+ years experience",
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Title */}
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Semantic Vector Search</h2>
        <p className="text-sm text-slate-500 font-medium">Use high-dimensional cosine mappings to locate candidates based on experience description concepts.</p>
      </div>

      {/* Search Input card panel */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Search query input */}
            <div className="flex-1 relative flex items-center">
              <span className="absolute left-4 text-slate-400 text-lg">🔍</span>
              <input
                type="text"
                placeholder="Search candidates by skills, experience, technologies..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder-slate-400 font-medium"
              />
            </div>

            {/* Results count slider */}
            <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 shrink-0">
              <div className="flex flex-col text-left justify-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Matches Limit</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={limit}
                    onChange={(e) => setLimit(parseInt(e.target.value))}
                    className="w-20 accent-blue-600 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-blue-600 w-4">{limit}</span>
                </div>
              </div>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer select-none shrink-0"
            >
              Retrieve Matches
            </button>

          </div>
        </form>

        {/* Suggestion clickable links */}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-2">Try Suggestions:</span>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold tracking-wide transition-all border border-slate-200/40 cursor-pointer"
            >
              {suggestion}
            </button>
          ))}
        </div>

      </div>

      {/* Loading state indicator */}
      {isLoading && (
        <div className="text-center py-12 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-500 font-semibold select-none flex items-center justify-center space-x-2">
          <span className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-blue-600 animate-spin inline-block"></span>
          <span>Searching resumes...</span>
        </div>
      )}

      {/* Results output view */}
      {!isLoading && hasSearched && (
        <div className="space-y-4">
          {results.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-500 font-semibold select-none">
              No matching resumes found
            </div>
          ) : (
            results.map((result, idx) => {
              // Convert score to readable percentage match
              const matchPct = Math.round(result.score * 100);
              
              // Custom colors based on percentage
              let badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
              if (matchPct < 45) badgeStyle = "bg-yellow-50 text-yellow-700 border-yellow-250";
              if (matchPct < 35) badgeStyle = "bg-slate-100 text-slate-600 border-slate-250";

              const isExpanded = expandedIndices[idx] || false;
              const textToShow = isExpanded 
                ? result.chunk_text 
                : result.chunk_text.slice(0, 300) + (result.chunk_text.length > 300 ? "..." : "");

              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-100 hover:border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 transition-all duration-200 hover:scale-[1.002]"
                >
                  {/* Header info */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">📄</span>
                      <span className="text-xs font-bold text-slate-800 break-all" title={result.file_name}>
                        {result.file_name}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${badgeStyle}`}>
                      {matchPct}% Match
                    </span>
                  </div>

                  {/* Text preview */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs leading-relaxed text-slate-700 font-normal whitespace-pre-wrap select-text">
                    {highlightText(textToShow, query)}
                  </div>

                  {/* Expand button */}
                  {result.chunk_text.length > 300 && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => toggleExpand(idx)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-bold transition-all hover:underline cursor-pointer"
                      >
                        {isExpanded ? "Collapse Chunk View ✕" : "Expand Full Chunk &darr;"}
                      </button>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
};
