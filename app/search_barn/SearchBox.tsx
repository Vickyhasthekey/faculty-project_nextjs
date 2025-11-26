'use client'
import { useState } from "react"
import { Search } from "lucide-react"
import ResultsList from './ResultsList'

export default function SearchBox() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setHasSearched(true)
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, top_k: 50 })
      })
      const data = await res.json()
      if (data.results) setResults(data.results)
      else setResults([])
    } catch (err) {
      console.error(err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <>
      {/* Enhanced Search Input */}
      <div className="bg-white rounded-2xl shadow-2xl shadow-indigo-200/30 p-2 mb-10 max-w-3xl mx-auto border border-slate-200/50 backdrop-blur-sm transition-all duration-300 hover:shadow-indigo-300/40">
        <div className="flex items-center gap-3">
          <div className="ml-4 p-2 bg-linear-to-br from-indigo-50 to-purple-50 rounded-lg">
            <Search className="w-5 h-5 text-indigo-600" />
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., machine learning, quantum physics, medieval literature..."
            className="flex-1 py-4 px-2 text-slate-800 placeholder-slate-400 focus:outline-none text-base bg-transparent"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-linear-to-r from-indigo-600 to-purple-600 text-white font-semibold px-8 py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:shadow-indigo-300/50 hover:scale-105"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </span>
            ) : "Search"}
          </button>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <ResultsList results={results} onClear={() => setResults([])} />
      )}

      {/* No Results Message */}
      {!loading && hasSearched && results.length === 0 && (
        <div className="text-center mt-12 bg-white/60 backdrop-blur-sm p-8 rounded-2xl border border-slate-200/50 max-w-md mx-auto">
          <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 mb-2 font-medium text-lg">No professors found</p>
          <p className="text-sm text-slate-500">Try refining your search or using different keywords.</p>
        </div>
      )}
    </>
  )
}