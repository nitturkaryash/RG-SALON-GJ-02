import { motion } from 'framer-motion'
import { ClientData } from '../../../types/saas'

interface DataManagementTabProps {
  clientData: ClientData[]
  isLoading: boolean
}

export function DataManagementTab({ clientData, isLoading }: DataManagementTabProps) {
  if (isLoading) return <div className="text-white">Loading data management...</div>
  
  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Client Data Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-white/60 font-medium">Table Name</th>
                <th className="px-6 py-4 text-left text-white/60 font-medium">Records</th>
                <th className="px-6 py-4 text-left text-white/60 font-medium">Size</th>
                <th className="px-6 py-4 text-left text-white/60 font-medium">Sync Status</th>
                <th className="px-6 py-4 text-left text-white/60 font-medium">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {clientData.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-white/5"
                >
                  <td className="px-6 py-4 text-white font-medium">{item.table_name}</td>
                  <td className="px-6 py-4 text-white">{item.record_count.toLocaleString()}</td>
                  <td className="px-6 py-4 text-white">{item.data_size}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.sync_status === 'synced' ? 'bg-green-500/20 text-green-400' :
                      item.sync_status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {item.sync_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white/60">
                    {new Date(item.last_updated).toLocaleDateString()}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 