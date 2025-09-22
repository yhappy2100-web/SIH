import Card from '../components/Card'

const Dashboard = () => {
  const stats = [
    { label: 'Lessons Completed', value: '12', icon: '📚', color: 'text-blue-600' },
    { label: 'Hours Studied', value: '24.5', icon: '⏱️', color: 'text-green-600' },
    { label: 'Games Played', value: '8', icon: '🎮', color: 'text-purple-600' },
    { label: 'Streak Days', value: '7', icon: '🔥', color: 'text-orange-600' },
  ]

  const recentActivity = [
    { action: 'Completed lesson', title: 'Introduction to Programming', time: '2 hours ago' },
    { action: 'Played game', title: 'Code Challenge', time: '4 hours ago' },
    { action: 'Started lesson', title: 'Web Development Fundamentals', time: '1 day ago' },
    { action: 'Earned badge', title: 'First Steps', time: '2 days ago' },
  ]

  const achievements = [
    { name: 'First Lesson', description: 'Complete your first lesson', earned: true },
    { name: 'Week Warrior', description: 'Study for 7 consecutive days', earned: true },
    { name: 'Code Master', description: 'Complete 10 coding challenges', earned: false },
    { name: 'Speed Learner', description: 'Complete 5 lessons in one day', earned: false },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Track your learning progress and achievements
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <div className={`text-3xl mb-2 ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">
                {stat.label}
              </div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card>
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">
                      <span className="font-medium">{activity.action}</span>{' '}
                      <span className="text-primary-600">{activity.title}</span>
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Achievements */}
          <Card>
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Achievements
            </h3>
            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-3 rounded-lg ${
                    achievement.earned
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="text-2xl">
                    {achievement.earned ? '🏆' : '🔒'}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">
                      {achievement.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {achievement.description}
                    </p>
                  </div>
                  {achievement.earned && (
                    <div className="text-green-600 text-sm font-medium">
                      Earned
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Progress Overview */}
        <Card className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            Learning Progress
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Overall Progress</span>
              <span className="text-primary-600 font-semibold">65%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                style={{ width: '65%' }}
              ></div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="text-2xl font-bold text-blue-600">4</div>
                <div className="text-gray-600">In Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">12</div>
                <div className="text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-400">8</div>
                <div className="text-gray-600">Available</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
