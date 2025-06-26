import { motion } from 'framer-motion'
import {
  CalendarIcon,
  ShoppingCartIcon,
  UserIcon,
} from '@heroicons/react/24/outline'

interface Activity {
  id: number
  type: string
  title: string
  description: string
  timestamp: string
}

interface RecentActivityProps {
  activities?: Activity[]
  isLoading: boolean
}

const activityIcons = {
  appointment: CalendarIcon,
  sale: ShoppingCartIcon,
  client: UserIcon,
}

export default function RecentActivity({ activities, isLoading }: RecentActivityProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-white/5 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center text-white/60 py-8">
        No recent activity
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const Icon = activityIcons[activity.type as keyof typeof activityIcons] || UserIcon

        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="glass-button p-4 flex items-start space-x-4"
          >
            <div className={`p-2 rounded-full bg-${activity.type === 'appointment' ? 'purple' : activity.type === 'sale' ? 'green' : 'blue'}-500/20`}>
              <Icon className={`w-5 h-5 text-${activity.type === 'appointment' ? 'purple' : activity.type === 'sale' ? 'green' : 'blue'}-400`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {activity.title}
              </p>
              <p className="text-sm text-white/60 truncate">
                {activity.description}
              </p>
              <p className="text-xs text-white/40 mt-1">
                {new Date(activity.timestamp).toLocaleString()}
              </p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
} 