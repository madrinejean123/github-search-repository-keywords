import { useState, useEffect, useRef } from 'react'
import './App.css'
import SearchBar from './components/SearchBar'
import RepositoryList from './components/RepositoryList'
import LoadingSpinner from './components/LoadingSpinner'

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || process.env.VITE_GITHUB_TOKEN || null

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [repositories, setRepositories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sortBy, setSortBy] = useState('stars')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const perPage = 10

  const currentController = useRef(null)
  const mounted = useRef(true)
  useEffect(() => { return () => { mounted.current = false } }, [])

  const interpretFetchError = async (response, thrownErr) => {
    if (response) {
      let textOrJson = ''
      try {
        textOrJson = (await response.json()).message || JSON.stringify(await response.json())
      } catch {
        textOrJson = await response.text().catch(() => '')
      }
      if (response.status === 403 && /rate limit/i.test(textOrJson)) {
        return GITHUB_TOKEN
          ? 'GitHub API rate limit reached — even with a token. Try again later.'
          : 'GitHub API rate limit reached. Add a GitHub Personal Access Token.'
      }
      if (response.status >= 500) return 'GitHub server error (5xx). Try again later.'
      return textOrJson || `Request failed with status ${response.status}`
    }
    if (thrownErr) {
      if (!navigator.onLine) return 'Network appears to be offline.'
      if (thrownErr.name === 'TypeError') return 'Network error: failed to fetch. Check CORS or connectivity.'
      return thrownErr.message || 'An unknown error occurred while fetching repositories'
    }
    return 'An unknown error occurred'
  }

  const handleSearch = async (keyword, page = 1) => {
    const q = (keyword || '').trim()
    if (!q) {
      setError('Please enter a keyword')
      setRepositories([])
      setTotalCount(0)
      return
    }

    if (currentController.current) currentController.current.abort()
    const controller = new AbortController()
    currentController.current = controller

    if (mounted.current) setLoading(true)
    setError('')
    setCurrentPage(page)

    try {
      const sortParam = sortBy === 'stars' ? '&sort=stars&order=desc' : ''
      const headers = { Accept: 'application/vnd.github+json' }
      if (GITHUB_TOKEN) headers.Authorization = `Bearer ${GITHUB_TOKEN}`

      const response = await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}${sortParam}&page=${page}&per_page=${perPage}`,
        { signal: controller.signal, headers }
      )

      if (!response.ok) {
        const friendly = await interpretFetchError(response, null)
        if (mounted.current) {
          setError(friendly)
          setRepositories([])
          setTotalCount(0)
        }
        return
      }

      const data = await response.json()
      if (!data.items || data.items.length === 0) {
        if (mounted.current) {
          setError('No repositories found')
          setRepositories([])
          setTotalCount(0)
        }
      } else {
        if (mounted.current) {
          setRepositories(data.items)
          setTotalCount(data.total_count)
          setError('')
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return
      const friendly = await interpretFetchError(null, err)
      if (mounted.current) {
        setError(friendly)
        setRepositories([])
        setTotalCount(0)
      }
    } finally {
      if (mounted.current) setLoading(false)
      if (currentController.current === controller) currentController.current = null
    }
  }

  const handlePageChange = (page) => handleSearch(searchTerm, page)
  useEffect(() => {
    if (!searchTerm.trim()) {
      setRepositories([])
      setTotalCount(0)
      setError('')
      setCurrentPage(1)
      setLoading(false)
      return
    }
    handleSearch(searchTerm, 1)
  }, [searchTerm, sortBy])

  const totalPages = Math.ceil(totalCount / perPage)
  const year = new Date().getFullYear()

  return (
    <div className="app">
      {/* HEADER */}
      <header className="site-header">
        <div className="header-inner">
          <div className="brand">
            <img src="/image.png" alt="Logo" className="brand-logo" />
            <h1 className="brand-title">GitHub Repository Search</h1>
          </div>

          <nav className="main-nav">
            <a href="#home">Home</a>
            <a href="#about">About</a>
          </nav>
        </div>
      </header>

      {/* MAIN */}
      <main className="app-main" id="home">
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSearch={handleSearch}
          sortBy={sortBy}
          setSortBy={setSortBy}
          disabled={loading}
        />

        {loading && <LoadingSpinner />}
        {error && <div className="error-message">{error}</div>}
        {!loading && repositories.length > 0 && (
          <>
            <div className="results-info">
              <span>Found {totalCount.toLocaleString()} repositories</span>
              <span> (page {currentPage} of {totalPages})</span>
            </div>
            <RepositoryList repositories={repositories} key={currentPage} />

            {totalPages > 1 && (
              <div className="pagination">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
                <span>Page {currentPage} of {totalPages}</span>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
              </div>
            )}
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="site-footer" id="about">
        <div className="footer-inner">
          <p className="footer-left">
            <strong><a href="https://github.com/madrinejean123" target="_blank" rel="noopener noreferrer">madrinejean123</a></strong> © {year}
          </p>
          <p className="footer-right">
            Powered by <a href="https://docs.github.com/en/rest" target="_blank" rel="noopener noreferrer">GitHub API</a>
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
