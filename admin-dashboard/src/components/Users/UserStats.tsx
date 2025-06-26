import { motion } from 'framer-motion'
import {
  UsersIcon,
  UserPlusIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

interface UserStatsData {
  totalUsers: number
  activeUsers: number
  newThisMonth: number
  growthRate: number
}

interface Props {
  data?: UserStatsData
  isLoading: boolean
}

export default function UserStats({ data, isLoading }: Props) {
  const statsCards = [
    {
      title: 'Total Users',
      value: data?.totalUsers?.toLocaleString() || '0',
      icon: UsersIcon,
      color: 'purple',
    },
    {
      title: 'Active Users',
      value: data?.activeUsers?.toLocaleString() || '0',
      icon: CheckCircleIcon,
      color: 'green',
    },
    {
      title: 'New This Month',
      value: data?.newThisMonth?.toString() || '0',
      icon: UserPlusIcon,
      color: 'blue',
    },
    {
      title: 'Growth Rate',
      value: `+${data?.growthRate?.toFixed(1) || '0'}%`,
      icon: ArrowTrendingUpIcon,
      color: 'orange',
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-white/10 rounded w-1/2"></div>
              <div className="h-6 bg-white/5 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {statsCards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="glass-card p-6 hover:scale-105 transition-transform duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 mb-2">{card.title}</p>
              <p className="text-2xl font-bold text-white">{card.value}</p>
            </div>
            <div className={`p-4 rounded-full bg-${card.color}-500/20`}>
              <card.icon className={`w-6 h-6 text-${card.color}-400`} />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
} 