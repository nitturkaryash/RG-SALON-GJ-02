import { motion } from 'framer-motion'

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <motion.div
        className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <motion.p
        className="text-white/80 text-lg font-medium"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        Loading...
      </motion.p>
    </div>
  )
} 