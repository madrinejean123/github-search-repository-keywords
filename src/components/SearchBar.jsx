import { useEffect, useRef, useState } from 'react'

export default function SearchBar({ searchTerm, setSearchTerm, onSearch, sortBy, setSortBy, disabled }) {
  // Uncontrolled input: value lives in the DOM (inputRef.current.value)
  const inputRef = useRef(null)
  const debounceRef = useRef(null)
  const [isTyping, setIsTyping] = useState(false)

  // Initialize the input DOM value when parent sets a searchTerm (e.g., page load or explicit clear)
  useEffect(() => {
    if (inputRef.current && searchTerm !== undefined && searchTerm !== null) {
      // only write when parent intentionally sets a different term
      if (inputRef.current.value !== searchTerm) {
        inputRef.current.value = searchTerm
      }
    }
  }, [searchTerm])

  useEffect(() => {
    return () => clearTimeout(debounceRef.current)
  }, [])

  const notifyParentDebounced = (value) => {
    clearTimeout(debounceRef.current)
    setIsTyping(true)
    debounceRef.current = setTimeout(() => {
      setIsTyping(false)
      setSearchTerm(value) // parent receives the debounced value and triggers search
    }, 250) // debounce time; reduce for snappier updates
  }

  const handleChange = (e) => {
    notifyParentDebounced(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    clearTimeout(debounceRef.current)
    const v = inputRef.current?.value ?? ''
    setIsTyping(false)
    setSearchTerm(v)
    onSearch(v)
    inputRef.current?.focus()
  }

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="search-form" role="search" aria-label="Repository search">
        <input
          ref={inputRef}
          type="text"
          defaultValue={searchTerm || ''}
          onChange={handleChange}
          placeholder="Enter repository name or keyword"
          className="search-input"
          // keep input editable during loading
          disabled={false}
          aria-label="Search repositories"
        />
        <button type="submit" className="search-btn" disabled={disabled}>
          Search
        </button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 12 }}>
        <div className="sort-container" aria-hidden={disabled}>
          <label htmlFor="sort-select">Sort by:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
            disabled={disabled}
          >
            <option value="stars">Most Stars</option>
            <option value="relevance">Relevance</option>
          </select>
        </div>

        <div aria-live="polite" style={{ minWidth: 140, textAlign: 'center', color: '#8b949e', fontSize: 14 }}>
          {isTyping ? 'Searching…' : ''}
        </div>
      </div>
    </div>
  )
}
