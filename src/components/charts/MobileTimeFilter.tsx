'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useFilters } from '@/hooks/useFilters'
import { ChevronDown } from 'lucide-react'

interface MobileTimeFilterProps {
  className?: string
}

export const MobileTimeFilter = ({ className = '' }: MobileTimeFilterProps) => {
  const { 
    timeRange, 
    customDateRange, 
    updateTimeRange,
    updateCustomDateRange 
  } = useFilters()
  
  const [showCustomPicker, setShowCustomPicker] = useState(false)
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  const handleCustomDateSubmit = () => {
    if (customStartDate && customEndDate) {
      const startDate = new Date(customStartDate)
      const endDate = new Date(customEndDate)
      
      if (startDate <= endDate) {
        updateCustomDateRange({ start: startDate, end: endDate })
        setShowCustomPicker(false)
      }
    }
  }

  const handleCustomRangeClick = () => {
    if (timeRange === 'custom') {
      setShowCustomPicker(true)
      if (customDateRange) {
        setCustomStartDate(customDateRange.start.toISOString().split('T')[0])
        setCustomEndDate(customDateRange.end.toISOString().split('T')[0])
      }
    } else {
      updateTimeRange('custom')
      setShowCustomPicker(true)
    }
  }

  return (
    <div className={`${className}`}>
      {/* Simple Dropdown - Thumb-Friendly Zone */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleCustomRangeClick}
        className="w-full flex items-center justify-between text-sm bg-green-50 border-green-200 text-green-800 hover:bg-green-100"
      >
        <span>Sep 2025</span>
        <ChevronDown className="h-4 w-4" />
      </Button>

      {/* Custom Date Picker - Only show when needed */}
      {showCustomPicker && (
        <div className="mt-3 p-4 border rounded-lg bg-gray-50 space-y-3">
          <div className="text-sm font-medium text-gray-700">Select Date Range</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 block mb-1">Start Date</label>
              <Input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">End Date</label>
              <Input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleCustomDateSubmit}
              disabled={!customStartDate || !customEndDate}
              className="text-xs flex-1"
            >
              Apply Range
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCustomPicker(false)}
              className="text-xs flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
