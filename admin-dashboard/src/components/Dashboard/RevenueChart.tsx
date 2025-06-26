import { motion } from 'framer-motion'

interface RevenueData {
  date: string
  revenue: number
}

interface RevenueChartProps {
  data?: RevenueData[]
  isLoading: boolean
}

export default function RevenueChart({ data, isLoading }: RevenueChartProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-white/5 rounded"></div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-white/60">
        No revenue data available
      </div>
    )
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue))
  const minRevenue = Math.min(...data.map(d => d.revenue))

  return (
    <div className="h-64 relative">
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-sm text-white/60">
        <span>${maxRevenue.toLocaleString()}</span>
        <span>${((maxRevenue + minRevenue) / 2).toLocaleString()}</span>
        <span>${minRevenue.toLocaleString()}</span>
      </div>

      {/* Chart */}
      <div className="ml-16 h-full flex items-end">
        {data.map((item, index) => {
          const height = ((item.revenue - minRevenue) / (maxRevenue - minRevenue)) * 100
          return (
            <motion.div
              key={item.date}
              className="flex-1 flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div
                className="w-4/5 bg-purple-500/20 rounded-t"
                style={{ height: `${height}%` }}
              >
                <div
                  className="w-full bg-purple-500/40 h-1/3 rounded-t"
                  style={{ marginTop: `${100 - height}%` }}
                ></div>
              </div>
              <div className="mt-2 text-xs text-white/60 rotate-45 origin-left">
                {new Date(item.date).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
} 