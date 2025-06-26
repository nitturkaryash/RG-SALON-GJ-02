import { motion } from 'framer-motion'
import { ArrowTrendingUpIcon, TrophyIcon } from '@heroicons/react/24/outline'

const topSalons = [
  {
    id: 1,
    name: 'Glamour Studio',
    owner: 'Sarah Johnson',
    revenue: 12450,
    growth: 23.4,
    rank: 1,
    plan: 'Premium',
    avatar: 'SJ',
  },
  {
    id: 2,
    name: 'Elite Cuts',
    owner: 'Mike Chen',
    revenue: 9870,
    growth: 18.2,
    rank: 2,
    plan: 'Pro',
    avatar: 'MC',
  },
  {
    id: 3,
    name: 'Bella Salon',
    owner: 'Emma Rodriguez',
    revenue: 8760,
    growth: 15.8,
    rank: 3,
    plan: 'Premium',
    avatar: 'ER',
  },
  {
    id: 4,
    name: 'Style Haven',
    owner: 'David Kim',
    revenue: 7650,
    growth: 12.3,
    rank: 4,
    plan: 'Pro',
    avatar: 'DK',
  },
  {
    id: 5,
    name: 'Luxe Beauty',
    owner: 'Lisa Thompson',
    revenue: 6890,
    growth: 10.7,
    rank: 5,
    plan: 'Basic',
    avatar: 'LT',
  },
]

const planColors = {
  'Basic': 'bg-gray-500/20 text-gray-300',
  'Pro': 'bg-blue-500/20 text-blue-300',
  'Premium': 'bg-purple-500/20 text-purple-300',
}

const rankColors = {
  1: 'text-yellow-400',
  2: 'text-gray-300',
  3: 'text-orange-400',
}

export default function TopSalons() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Top Performing Salons
          </h3>
          <p className="text-sm text-white/60">
            This month's leaders
          </p>
        </div>
        <TrophyIcon className="w-6 h-6 text-yellow-400" />
      </div>

      <div className="space-y-4">
        {topSalons.map((salon, index) => (
          <motion.div
            key={salon.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center space-x-4 p-3 glass rounded-lg hover:bg-white/10 transition-colors"
          >
            {/* Rank */}
            <div className="flex items-center justify-center w-8 h-8 glass-card">
              {salon.rank <= 3 ? (
                <TrophyIcon className={`w-4 h-4 ${rankColors[salon.rank as keyof typeof rankColors]}`} />
              ) : (
                <span className="text-sm font-medium text-white">
                  {salon.rank}
                </span>
              )}
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 glass-card flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {salon.avatar}
              </span>
            </div>

            {/* Salon Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-medium text-white truncate">
                  {salon.name}
                </h4>
                <span className={`px-2 py-1 text-xs rounded-full ${planColors[salon.plan as keyof typeof planColors]}`}>
                  {salon.plan}
                </span>
              </div>
              <p className="text-xs text-white/60">
                {salon.owner}
              </p>
            </div>

            {/* Stats */}
            <div className="text-right">
              <div className="text-sm font-medium text-white">
                ${salon.revenue.toLocaleString()}
              </div>
              <div className="flex items-center space-x-1">
                <ArrowTrendingUpIcon className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400">
                  +{salon.growth}%
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">Total Revenue (Top 5)</span>
          <span className="text-sm font-medium text-white">
            ${topSalons.reduce((sum, salon) => sum + salon.revenue, 0).toLocaleString()}
          </span>
        </div>
      </div>
    </motion.div>
  )
} 