'use client'
import { useState } from "react"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    setLoading(true)
    try {
      const res = await fetch("http://127.0.0.1:8000/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query})
      })

      const data = await res.json()
      if (data.results) setResults(data.results)
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Search Similar Words</h1>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter your query"
        style={{ padding: 8, fontSize: 16 }}
      />
      <button onClick={handleSearch} style={{ marginLeft: 10, padding: 8 }}>
        Search
      </button>

      {loading && <p>Searching...</p>}

      <ul>
        {results.map((r, idx) => (
          <li key={idx}>
            {Object.entries(r).map(([k, v]) => (
              <span key={k}><b>{k}:</b> {String(v)} </span>
            ))}
          </li>
        ))}
      </ul>
    </div>
  )
}
