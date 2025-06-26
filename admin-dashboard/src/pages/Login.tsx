import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { EyeIcon, EyeSlashIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(email, password)
      toast.success('Welcome back, Admin!')
    } catch (error: any) {
      toast.error(error.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8">
          {/* Logo/Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 glass-card mb-4 hover-glow">
              <ShieldCheckIcon className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold text-gradient mb-2">
              Admin Dashboard
            </h1>
            <p className="text-white/60">
              Salon SaaS Management Portal
            </p>
          </motion.div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input w-full px-4 py-3 transition-all duration-300 focus:scale-105"
                placeholder="admin@salon.com"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input w-full px-4 py-3 pr-12 transition-all duration-300 focus:scale-105"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              type="submit"
              disabled={isLoading}
              className="w-full glass-button py-3 px-6 font-semibold text-white hover-glow disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <motion.div
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Signing In...
                </div>
              ) : (
                'Sign In to Dashboard'
              )}
              
              {/* Animated background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{ backgroundSize: '200% 100%' }}
              />
            </motion.button>
          </form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center"
          >
            <p className="text-white/40 text-sm">
              Secure admin access only
            </p>
          </motion.div>
        </div>

        {/* Background decorative elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <motion.div
            className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-3/4 right-1/4 w-24 h-24 bg-pink-500/10 rounded-full blur-xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.6, 0.3, 0.6],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </motion.div>
    </div>
  )
} 