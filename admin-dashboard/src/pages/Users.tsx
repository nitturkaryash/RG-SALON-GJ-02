import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  UsersIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import UserStats from '../components/Users/UserStats'
import UserFilters from '../components/Users/UserFilters'
import CreateUserModal from '../components/Users/CreateUserModal'

interface User {
  id: number
  name: string
  email: string
  role: string
  status: 'active' | 'inactive' | 'suspended'
  lastLogin: string
  joinedAt: string
  avatar?: string
}

// Mock data fetching function
const fetchUsers = async (filters: any) => {
  return {
    users: [
      {
        id: 1,
        name: 'Sarah Johnson',
        email: 'sarah@glamourstudio.com',
        role: 'Salon Owner',
        status: 'active' as const,
        lastLogin: '2024-01-20T10:30:00Z',
        joinedAt: '2023-08-15T00:00:00Z',
      },
      {
        id: 2,
        name: 'Michael Chen',
        email: 'michael@elitecuts.com',
        role: 'Manager',
        status: 'active' as const,
        lastLogin: '2024-01-19T16:45:00Z',
        joinedAt: '2023-09-22T00:00:00Z',
      },
      {
        id: 3,
        name: 'Emma Wilson',
        email: 'emma@beautyhaven.com',
        role: 'Stylist',
        status: 'inactive' as const,
        lastLogin: '2024-01-15T08:20:00Z',
        joinedAt: '2023-11-05T00:00:00Z',
      },
      {
        id: 4,
        name: 'David Rodriguez',
        email: 'david@trendycuts.com',
        role: 'Admin',
        status: 'active' as const,
        lastLogin: '2024-01-20T14:15:00Z',
        joinedAt: '2023-07-10T00:00:00Z',
      },
    ],
    stats: {
      totalUsers: 1247,
      activeUsers: 1089,
      newThisMonth: 45,
      growthRate: 12.5,
    },
  }
}

export default function Users() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    dateRange: 'all',
  })
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['users', filters, searchTerm],
    queryFn: () => fetchUsers({ ...filters, search: searchTerm }),
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-500/20'
      case 'inactive':
        return 'text-gray-400 bg-gray-500/20'
      case 'suspended':
        return 'text-red-400 bg-red-500/20'
      default:
        return 'text-white/60 bg-white/10'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'salon owner':
        return 'text-purple-400 bg-purple-500/20'
      case 'admin':
        return 'text-blue-400 bg-blue-500/20'
      case 'manager':
        return 'text-orange-400 bg-orange-500/20'
      case 'stylist':
        return 'text-green-400 bg-green-500/20'
      default:
        return 'text-white/60 bg-white/10'
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gradient mb-2">
            User Management
          </h1>
          <p className="text-white/60">
            Manage salon users, roles, and access permissions
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCreateModalOpen(true)}
          className="glass-button px-6 py-3 hover-glow flex items-center space-x-2 mt-4 sm:mt-0"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add User</span>
        </motion.button>
      </motion.div>

      {/* User Stats */}
      <UserStats data={data?.stats} isLoading={isLoading} />

      {/* Search and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card p-4"
          >
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="glass-input w-full pl-10 pr-4 py-3"
                />
              </div>
              <button className="glass-button p-3 hover-glow">
                <FunnelIcon className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-1">
          <UserFilters filters={filters} onChange={setFilters} />
        </div>
      </div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">All Users</h2>
          <div className="flex items-center space-x-2 text-white/60">
            <UsersIcon className="w-5 h-5" />
            <span>{data?.users?.length || 0} users</span>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-white/5 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-white/60 text-sm border-b border-white/10">
                  <th className="pb-4">User</th>
                  <th className="pb-4">Role</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Last Login</th>
                  <th className="pb-4">Joined</th>
                  <th className="pb-4">Actions</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {data?.users?.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                          <span className="text-purple-400 font-medium">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="text-white font-medium">{user.name}</div>
                          <div className="text-white/60 text-sm">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`px-3 py-1 text-sm rounded-full ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 text-white/80">
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </td>
                    <td className="py-4 text-white/80">
                      {new Date(user.joinedAt).toLocaleDateString()}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => fetchUsers({})}
      />
    </div>
  )
} 