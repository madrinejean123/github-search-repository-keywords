import React from 'react';

/* GitHub-style language colors */
const languageColors = {
  JavaScript: '#f1e05a',
  TypeScript: '#2b7489',
  Python: '#3572A5',
  Java: '#b07219',
  HTML: '#e34c26',
  CSS: '#563d7c',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Go: '#00ADD8',
  Rust: '#dea584',
  Dart: '#00B4AB',
  Kotlin: '#F18E33',
  Swift: '#ffac45',
  Shell: '#89e051',
  // Add more as needed
};

function truncate(text, max = 140) {
  if (!text) return ''
  if (text.length <= max) return text
  return text.slice(0, max - 1).trimEnd() + '…'
}

function shortName(fullName, max = 40) {
  if (!fullName) return ''
  if (fullName.length <= max) return fullName
  // Prefer keeping the repo short name (after slash) visible:
  const parts = fullName.split('/')
  const repo = parts.pop()
  const owner = parts.join('/')
  const short = `${owner}/${repo}`
  if (short.length <= max) return short
  // fallback to truncation
  return truncate(fullName, max)
}

function RepositoryCard({ repository }) {
  const languageColor = languageColors[repository.language] || '#586069' // fallback grey
  const displayName = shortName(repository.full_name, 48)
  const displayDescription = truncate(repository.description || 'No description available', 140)

  return (
    <div className="repository-card compact-card" title={repository.full_name}>
      <h3 className="repo-name" title={repository.full_name}>
        <a href={repository.html_url} target="_blank" rel="noopener noreferrer">
          {displayName}
        </a>
      </h3>

      <p
        className="repo-description"
        title={repository.description || 'No description available'}
        aria-label={repository.description || 'No description available'}
      >
        {displayDescription}
      </p>

      <div className="repo-stats">
        <span className="stat">
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" fill="currentColor"></path>
          </svg>
          {repository.stargazers_count.toLocaleString()}
        </span>

        <span className="stat">
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z" fill="currentColor"></path>
          </svg>
          {repository.forks_count.toLocaleString()}
        </span>

        {repository.language && (
          <span className="stat language">
            <span
              className="language-dot"
              style={{ backgroundColor: languageColor }}
              aria-hidden="true"
            ></span>
            {repository.language}
          </span>
        )}
      </div>

      <div className="repo-meta">
        <span className="repo-owner" style={{ color: '#ffffff' }}>
          by {repository.owner.login}
        </span>
        <span className="repo-updated" style={{ color: '#ffffff' }}>
          Updated {new Date(repository.updated_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

export default RepositoryCard;
