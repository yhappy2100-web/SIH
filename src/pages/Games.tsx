import Card from '../components/Card'

const Games = () => {
  const games = [
    {
      id: 1,
      title: 'Code Challenge',
      description: 'Test your programming skills with timed coding challenges.',
      difficulty: 'Medium',
      players: '1,234',
      rating: 4.8,
      image: '🎯',
    },
    {
      id: 2,
      title: 'Memory Match',
      description: 'Match programming concepts and definitions in this memory game.',
      difficulty: 'Easy',
      players: '856',
      rating: 4.6,
      image: '🧠',
    },
    {
      id: 3,
      title: 'Syntax Sprint',
      description: 'Race against time to write correct code syntax.',
      difficulty: 'Hard',
      players: '2,145',
      rating: 4.9,
      image: '⚡',
    },
    {
      id: 4,
      title: 'Algorithm Arena',
      description: 'Compete with others in algorithm solving competitions.',
      difficulty: 'Expert',
      players: '567',
      rating: 4.7,
      image: '🏆',
    },
    {
      id: 5,
      title: 'Quiz Quest',
      description: 'Answer programming questions and climb the leaderboard.',
      difficulty: 'Medium',
      players: '3,421',
      rating: 4.5,
      image: '❓',
    },
    {
      id: 6,
      title: 'Debug Detective',
      description: 'Find and fix bugs in code snippets to earn points.',
      difficulty: 'Hard',
      players: '1,789',
      rating: 4.8,
      image: '🔍',
    },
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'Hard':
        return 'bg-orange-100 text-orange-800'
      case 'Expert':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}
      >
        ⭐
      </span>
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Learning Games</h1>
          <p className="text-gray-600">
            Make learning fun with interactive games and challenges
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <Card key={game.id} className="hover:shadow-lg transition-all duration-200">
              <div className="text-center mb-4">
                <div className="text-6xl mb-3">{game.image}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {game.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{game.description}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                      game.difficulty
                    )}`}
                  >
                    {game.difficulty}
                  </span>
                  <div className="flex items-center space-x-1">
                    {renderStars(game.rating)}
                    <span className="text-sm text-gray-600 ml-1">
                      {game.rating}
                    </span>
                  </div>
                </div>

                <div className="text-sm text-gray-500 text-center">
                  {game.players} players
                </div>

                <button className="w-full btn-primary">
                  Play Now
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* Featured Game Section */}
        <div className="mt-12">
          <Card className="bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
            <div className="text-center">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-2xl font-bold text-primary-800 mb-4">
                Featured Game: Code Challenge
              </h3>
              <p className="text-primary-700 mb-6 max-w-2xl mx-auto">
                Join thousands of players in our most popular coding challenge game. 
                Test your skills, compete with others, and climb the leaderboard!
              </p>
              <div className="flex justify-center space-x-4">
                <button className="btn-primary px-8 py-3 text-lg">
                  Start Playing
                </button>
                <button className="btn-secondary px-8 py-3 text-lg">
                  View Leaderboard
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Game Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">10,000+</div>
            <div className="text-gray-600">Total Players</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">50,000+</div>
            <div className="text-gray-600">Games Played</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">4.7</div>
            <div className="text-gray-600">Average Rating</div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Games
