import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HomeIcon,
  UsersIcon,
  ChartBarIcon,
  ClockIcon,
  CogIcon,
  ShieldCheckIcon,
  ServerIcon,
  CircleStackIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Users', href: '/users', icon: UsersIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Sessions', href: '/sessions', icon: ClockIcon },
  { name: 'Communication', href: '/communication', icon: ChatBubbleLeftRightIcon },
  { name: 'Meetings', href: '/meetings', icon: CalendarDaysIcon },
  { name: 'System Management', href: '/system-management', icon: ServerIcon },
  { name: 'Client Data', href: '/client-data', icon: CircleStackIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
]

interface SidebarProps {
  isCollapsed?: boolean
}

export default function Sidebar({ isCollapsed = false }: SidebarProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center px-6 py-8"
      >
        <div className="flex items-center">
          <div className="w-10 h-10 glass-card flex items-center justify-center hover-glow">
            <ShieldCheckIcon className="w-6 h-6 text-purple-400" />
          </div>
          {!isCollapsed && (
            <div className="ml-3">
              <h1 className="text-xl font-bold text-gradient">
                Admin Panel
              </h1>
              <p className="text-sm text-white/60">Salon SaaS</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {navigation.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * (index + 2) }}
          >
            <NavLink
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 ${
                  isActive
                    ? 'glass-button text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`
              }
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon
                className="h-5 w-5 transition-transform group-hover:scale-110"
                aria-hidden="true"
              />
              {!isCollapsed && (
                <span className="ml-3">{item.name}</span>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="p-6 border-t border-white/10"
      >
        <div className="glass-card p-4 text-center">
          {!isCollapsed && (
            <p className="text-xs text-white/60 mb-2">Admin Dashboard</p>
          )}
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            {!isCollapsed && (
              <span className="text-xs text-white/80">System Online</span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
} 