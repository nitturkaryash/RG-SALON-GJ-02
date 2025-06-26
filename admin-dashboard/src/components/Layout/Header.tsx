import { Fragment } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/24/outline'
import { Menu, Transition } from '@headlessui/react'
import toast from 'react-hot-toast'

interface HeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  sidebarCollapsed?: boolean
  setSidebarCollapsed?: (collapsed: boolean) => void
}

export default function Header({ 
  sidebarOpen, 
  setSidebarOpen, 
  sidebarCollapsed = false, 
  setSidebarCollapsed 
}: HeaderProps) {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
    } catch (error: any) {
      toast.error(error.message || 'Logout failed')
    }
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card m-4 rounded-xl"
    >
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {/* Sidebar Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="glass-button p-2 hover-glow"
                title={sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
              >
                <Bars3Icon className="w-5 h-5 text-white" />
              </motion.button>

              {/* Sidebar Collapse Toggle */}
              {sidebarOpen && setSidebarCollapsed && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="glass-button p-2 hover-glow"
                  title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                >
                  {sidebarCollapsed ? (
                    <ChevronDoubleRightIcon className="w-5 h-5 text-white" />
                  ) : (
                    <ChevronDoubleLeftIcon className="w-5 h-5 text-white" />
                  )}
                </motion.button>
              )}
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-white">
                Welcome back, Admin
              </h2>
              <p className="text-sm text-white/60">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="glass-button p-2 hover-glow relative"
            >
              <BellIcon className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">3</span>
              </span>
            </motion.button>

            {/* User Menu */}
            <Menu as="div" className="relative">
              <Menu.Button className="glass-button p-2 hover-glow flex items-center space-x-2">
                <UserCircleIcon className="w-5 h-5 text-white" />
                <span className="text-sm text-white hidden md:block">
                  {user?.email}
                </span>
              </Menu.Button>
              
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-48 glass-card rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <div className={`px-4 py-2 text-sm ${active ? 'bg-white/10' : ''}`}>
                          <div className="text-white/60">Signed in as</div>
                          <div className="text-white font-medium truncate">
                            {user?.email}
                          </div>
                        </div>
                      )}
                    </Menu.Item>
                    
                    <div className="border-t border-white/10 my-1"></div>
                    
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${
                            active ? 'bg-white/10' : ''
                          } group flex items-center w-full px-4 py-2 text-sm text-white transition-colors`}
                        >
                          <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4" />
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </motion.header>
  )
} 