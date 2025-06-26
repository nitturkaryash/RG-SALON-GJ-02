import { motion } from 'framer-motion'
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

import toast from 'react-hot-toast'

interface User {
  id: string
  name: string
  email: string
  salon_name: string
  plan: string
  status: 'active' | 'inactive'
  created_at: string
  last_login: string
  revenue: number
}

interface UserTableProps {
  users: User[]
  isLoading: boolean
  onRefresh: () => void
}

const planColors = {
  'Basic': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  'Pro': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Premium': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
}

const statusIcons = {
  active: CheckCircleIcon,
  inactive: XCircleIcon,
}

const statusColors = {
  active: 'text-green-400',
  inactive: 'text-red-400',
}

export default function UserTable({ users, isLoading, onRefresh }: UserTableProps) {
  const handleAction = (action: string, user: User) => {
    switch (action) {
      case 'view':
        toast.success(`Viewing ${user.name}'s profile`)
        break
      case 'edit':
        toast.success(`Editing ${user.name}'s account`)
        break
      case 'delete':
        toast.error(`Deleting ${user.name}'s account`)
        break
      default:
        break
    }
  }

  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-white/10 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white">All Users</h3>
        <p className="text-sm text-white/60">{users.length} users found</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="text-left py-3 px-6 text-sm font-medium text-white/80">User</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-white/80">Salon</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-white/80">Plan</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-white/80">Status</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-white/80">Revenue</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-white/80">Last Login</th>
              <th className="text-right py-3 px-6 text-sm font-medium text-white/80">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {users.map((user, index) => {
              const StatusIcon = statusIcons[user.status]
              return (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-medium text-white">{user.name}</div>
                      <div className="text-sm text-white/60">{user.email}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-white">{user.salon_name}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${planColors[user.plan as keyof typeof planColors]}`}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <StatusIcon className={`w-4 h-4 ${statusColors[user.status]}`} />
                      <span className={`capitalize text-sm ${statusColors[user.status]}`}>
                        {user.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-white font-medium">
                      ${user.revenue.toLocaleString()}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-1 text-white/60">
                      <ClockIcon className="w-4 h-4" />
                      <span className="text-sm">
                        {new Date(user.last_login).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleAction('view', user)}
                        className="p-1.5 glass-button hover-glow"
                        title="View User"
                      >
                        <EyeIcon className="w-4 h-4 text-blue-400" />
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleAction('edit', user)}
                        className="p-1.5 glass-button hover-glow"
                        title="Edit User"
                      >
                        <PencilIcon className="w-4 h-4 text-green-400" />
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleAction('delete', user)}
                        className="p-1.5 glass-button hover-glow"
                        title="Delete User"
                      >
                        <TrashIcon className="w-4 h-4 text-red-400" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <div className="text-white/60 mb-4">No users found</div>
          <button
            onClick={onRefresh}
            className="glass-button px-4 py-2 hover-glow"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  )
} 