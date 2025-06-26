import { useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import Header from './Header'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-transparent">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: sidebarCollapsed ? -80 : -280 }}
            animate={{ x: 0 }}
            exit={{ x: sidebarCollapsed ? -80 : -280 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`${sidebarCollapsed ? 'w-20' : 'w-70'} glass-sidebar transition-all duration-300`}
          >
            <Sidebar isCollapsed={sidebarCollapsed} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />
        
        <main className="flex-1 overflow-auto custom-scrollbar p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
} 