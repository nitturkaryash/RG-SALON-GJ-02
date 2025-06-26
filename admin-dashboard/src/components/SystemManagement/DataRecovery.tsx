import { motion } from 'framer-motion'
import { ArrowPathIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface Recovery {
  id: number
  clientName: string
  dataType: string
  recoveredAt: string
  status: string
  recoveredSize: string
}

interface DataRecoveryProps {
  data?: Recovery[]
  isLoading?: boolean
}

export default function DataRecovery({ data, isLoading }: DataRecoveryProps) {
  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/4"></div>
          <div className="h-4 bg-white/10 rounded w-3/4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-white/5 rounded"></div>
            <div className="h-20 bg-white/5 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Data Recovery</h2>
      <p className="text-white/60 mb-6">
        Restore your system data to a previous state with point-in-time recovery options.
      </p>

      {/* Recent Recoveries */}
      {data && data.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-medium text-white mb-4">Recent Recoveries</h3>
          <div className="space-y-4">
            {data.map((recovery) => (
              <motion.div
                key={recovery.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-button p-4 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-400 mr-3" />
                  <div>
                    <p className="text-white font-medium">{recovery.clientName}</p>
                    <p className="text-sm text-white/60">
                      {recovery.dataType} - {recovery.recoveredSize}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white/60">
                    {new Date(recovery.recoveredAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-green-400">{recovery.status}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recovery Points */}
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="glass-button p-4 flex items-center justify-between"
        >
          <div className="flex items-center">
            <ClockIcon className="w-5 h-5 text-blue-400 mr-3" />
            <div>
              <p className="text-white font-medium">Latest Backup</p>
              <p className="text-sm text-white/60">Today at 12:00 PM</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors">
            Restore
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="glass-button p-4 flex items-center justify-between"
        >
          <div className="flex items-center">
            <CheckCircleIcon className="w-5 h-5 text-green-400 mr-3" />
            <div>
              <p className="text-white font-medium">Stable Point</p>
              <p className="text-sm text-white/60">Yesterday at 6:00 PM</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors">
            Restore
          </button>
        </motion.div>
      </div>

      {/* Custom Recovery */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-white mb-4">Custom Recovery Point</h3>
        <div className="flex gap-4">
          <input
            type="datetime-local"
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
          />
          <button className="px-6 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors flex items-center">
            <ArrowPathIcon className="w-5 h-5 mr-2" />
            Restore
          </button>
        </div>
      </div>

      {/* Recovery Status */}
      <div className="mt-8 p-4 border border-white/10 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">System Status</p>
            <p className="text-sm text-green-400">Ready for Recovery</p>
          </div>
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
        </div>
      </div>
    </div>
  )
} 