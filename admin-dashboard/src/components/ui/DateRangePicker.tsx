import { useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarIcon } from '@heroicons/react/24/outline'

interface DateRangePickerProps {
  value: {
    start: string
    end: string
  }
  onChange: (value: { start: string; end: string }) => void
}

const presetRanges = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'Last 6 months', days: 180 },
  { label: 'Last year', days: 365 },
]

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handlePresetClick = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    
    onChange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    })
    setIsOpen(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="glass-button px-4 py-2 flex items-center space-x-2 hover-glow"
      >
        <CalendarIcon className="w-4 h-4" />
        <span className="text-sm">
          {formatDate(value.start)} - {formatDate(value.end)}
        </span>
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute right-0 mt-2 w-80 glass-card rounded-lg shadow-lg z-50"
        >
          <div className="p-4">
            <h4 className="text-white font-medium mb-4">Select Date Range</h4>
            
            {/* Preset Ranges */}
            <div className="space-y-2 mb-4">
              {presetRanges.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetClick(preset.days)}
                  className="w-full text-left px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="border-t border-white/10 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/60 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={value.start}
                    onChange={(e) => onChange({ ...value, start: e.target.value })}
                    className="glass-input w-full px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1">End Date</label>
                  <input
                    type="date"
                    value={value.end}
                    onChange={(e) => onChange({ ...value, end: e.target.value })}
                    className="glass-input w-full px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsOpen(false)}
                className="glass-button px-4 py-2 text-sm hover-glow"
              >
                Apply
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
} 