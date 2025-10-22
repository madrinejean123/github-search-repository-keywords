import RepositoryCard from './RepositoryCard'

function RepositoryList({ repositories }) {
  return (
    <div className="repository-list">
      {repositories.map((repo) => (
        <RepositoryCard key={repo.id} repository={repo} />
      ))}
    </div>
  )
}

export default RepositoryList
