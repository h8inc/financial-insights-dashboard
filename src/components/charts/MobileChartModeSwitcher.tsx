'use client'

import { Button } from '@/components/ui/button'
import { useFilters } from '@/hooks/useFilters'
import { ChartType } from '@/lib/types'

interface MobileChartModeSwitcherProps {
  chartType: ChartType
  className?: string
}

export const MobileChartModeSwitcher = ({ chartType, className = '' }: MobileChartModeSwitcherProps) => {
  const { cashFlowMode, toggleCashFlowMode } = useFilters()
  
  const isCashFlow = chartType === ChartType.CASH_FLOW
  
  // Only show for cash flow charts
  if (!isCashFlow) {
    return null
  }

  return (
    <div className={`flex w-full ${className}`}>
      <Button
        variant={cashFlowMode === 'activity' ? 'default' : 'ghost'}
        size="sm"
        onClick={toggleCashFlowMode}
        className="flex-1 rounded-r-none border-r-0"
      >
        Activity Tracker
      </Button>
      <Button
        variant={cashFlowMode === 'balance' ? 'default' : 'ghost'}
        size="sm"
        onClick={toggleCashFlowMode}
        className="flex-1 rounded-l-none"
      >
        Balance Tracker
      </Button>
    </div>
  )
}
