'use client'

import { Button } from '@/components/ui/button'
import { useFilters } from '@/hooks/useFilters'
import { useResponsiveView } from '@/hooks/useResponsiveView'
import { ChartType } from '@/lib/types'
import { Calendar } from 'lucide-react'

interface EmbeddedChartFiltersProps {
  chartType: ChartType
  className?: string
}

export const EmbeddedChartFilters = ({ chartType, className = '' }: EmbeddedChartFiltersProps) => {
  const { 
    timeRange, 
    updateTimeRange,
    cashFlowMode, 
    toggleCashFlowMode 
  } = useFilters()
  const { isMobileView } = useResponsiveView()
  
  const isCashFlow = chartType === ChartType.CASH_FLOW
  
  const timeRanges: { value: string; label: string; short: string }[] = [
    { value: '7D', label: 'Last 7 Days', short: '7D' },
    { value: '30D', label: 'Last 30 Days', short: '30D' },
    { value: '3M', label: 'Last 3 Months', short: '3M' },
    { value: 'YTD', label: 'Year to Date', short: 'YTD' },
    { value: 'custom', label: 'Custom Range', short: 'Custom' }
  ]

  // Desktop: Show both time range and chart mode filters side by side
  if (!isMobileView) {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        {/* Time Range Filters */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {timeRanges.slice(0, -1).map((range) => (
              <Button
                key={range.value}
                variant={timeRange === range.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateTimeRange(range.value as any)}
                className="text-xs px-3 py-1 h-7"
              >
                {range.short}
              </Button>
            ))}
          </div>
          
          <Button
            variant={timeRange === 'custom' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateTimeRange('custom')}
            className="text-xs px-3 py-1 h-7 flex items-center gap-1"
          >
            <Calendar className="h-3 w-3" />
            Custom
          </Button>
        </div>

        {/* Chart Mode Switcher (only for cash flow) */}
        {isCashFlow && (
          <div className="flex items-center gap-2">
            <Button
              variant={cashFlowMode === 'activity' ? 'default' : 'outline'}
              size="sm"
              onClick={toggleCashFlowMode}
              className="text-xs px-3 py-1 h-7"
            >
              Activity
            </Button>
            <Button
              variant={cashFlowMode === 'balance' ? 'default' : 'outline'}
              size="sm"
              onClick={toggleCashFlowMode}
              className="text-xs px-3 py-1 h-7"
            >
              Balance
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Mobile: This component won't be used on mobile
  return null
}
