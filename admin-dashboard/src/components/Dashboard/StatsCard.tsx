import { motion } from 'framer-motion'
import { ForwardRefExoticComponent, SVGProps, RefAttributes } from 'react'

interface StatsCardProps {
  title: string
  value?: string
  change?: number
  icon: ForwardRefExoticComponent<Omit<SVGProps<SVGSVGElement>, "ref"> & RefAttributes<SVGSVGElement>>
  color: string
  isLoading: boolean
  delay?: number
}

export default function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  color,
  isLoading,
  delay = 0,
}: StatsCardProps) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay }}
        className="glass-card p-6"
      >
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/10 rounded w-1/2"></div>
          <div className="h-6 bg-white/5 rounded w-3/4"></div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      className="glass-card p-6 hover:scale-105 transition-transform duration-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/60 mb-2">{title}</p>
          <p className="text-2xl font-bold text-white">{value || '0'}</p>
          {typeof change === 'number' && (
            <p className={`text-sm mt-2 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {change >= 0 ? '+' : ''}{change}%
            </p>
          )}
        </div>
        <div className={`p-4 rounded-full bg-${color}-500/20`}>
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
      </div>
    </motion.div>
  )
} 