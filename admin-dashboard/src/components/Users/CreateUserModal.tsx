import { useState } from 'react'
import { motion } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'stylist',
    status: 'active',
    sendInvite: true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simulate user creation
    toast.success('User created successfully!')
    onSuccess()
    onClose()
    setFormData({
      name: '',
      email: '',
      role: 'stylist',
      status: 'active',
      sendInvite: true,
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card p-6 w-full max-w-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Create New User</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="glass-input w-full px-4 py-3"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="glass-input w-full px-4 py-3"
              placeholder="Enter email address"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="glass-input w-full px-4 py-3"
              >
                <option value="stylist">Stylist</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
                <option value="salon_owner">Salon Owner</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="glass-input w-full px-4 py-3"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="sendInvite"
              checked={formData.sendInvite}
              onChange={handleInputChange}
              className="w-4 h-4 text-purple-600 bg-transparent border-gray-300 rounded focus:ring-purple-500"
            />
            <label className="text-sm text-white/80">
              Send invitation email to user
            </label>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 glass px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 glass-button px-4 py-3 hover-glow"
            >
              Create User
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
} 