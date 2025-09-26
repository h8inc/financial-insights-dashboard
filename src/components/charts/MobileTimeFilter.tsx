'use client'

import { Button } from '@/components/ui/button'
import { useFilters } from '@/hooks/useFilters'

interface MobileTimeFilterProps {
  className?: string
}

export const MobileTimeFilter = ({ className = '' }: MobileTimeFilterProps) => {
  const { timeRange, updateTimeRange } = useFilters()
  
  const timeRanges: { value: '7D' | '30D' | '3M' | 'YTD'; label: string }[] = [
    { value: '7D', label: '7D' },
    { value: '30D', label: '30D' },
    { value: '3M', label: '3M' },
    { value: 'YTD', label: 'YTD' }
  ]

  return (
    <div className={`${className}`}>
      {/* Simple Time Range Buttons - Thumb-Friendly */}
      <div className="grid grid-cols-4 gap-2">
        {timeRanges.map((range) => (
          <Button
            key={range.value}
            variant={timeRange === range.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateTimeRange(range.value)}
            className="text-xs py-2 h-8"
          >
            {range.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
