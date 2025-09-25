'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChartType } from '@/lib/types'
import { useFilters } from '@/hooks/useFilters'
import { useDataContext } from '@/components/DataProvider'
import { RefreshCw } from 'lucide-react'

interface FiltersProps {
  type: ChartType
}

export const Filters = ({ type }: FiltersProps) => {
  const { timeRange, updateTimeRange, cashFlowMode, toggleCashFlowMode } = useFilters()
  const { refreshData, isLoading } = useDataContext()
  
  const timeRanges = [
    { value: '7D', label: 'Last 7 Days' },
    { value: '30D', label: 'Last 30 Days' },
    { value: '3M', label: 'Last 3 Months' },
    { value: 'YTD', label: 'Year to Date' }
  ]
  
  const isCashFlow = type === ChartType.CASH_FLOW
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters & Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Time Range</div>
          <div className="grid grid-cols-2 gap-2">
            {timeRanges.map((range) => (
              <Button
                key={range.value}
                variant={timeRange === range.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateTimeRange(range.value as any)}
                className="text-xs"
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>
        
        {isCashFlow && (
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Chart Mode</div>
            <div className="flex space-x-2">
              <Button
                variant={cashFlowMode === 'activity' ? 'default' : 'outline'}
                size="sm"
                onClick={toggleCashFlowMode}
                className="text-xs"
              >
                Activity
              </Button>
              <Button
                variant={cashFlowMode === 'balance' ? 'default' : 'outline'}
                size="sm"
                onClick={toggleCashFlowMode}
                className="text-xs"
              >
                Balance
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {cashFlowMode === 'activity' 
                ? 'Shows money in/out flows' 
                : 'Shows balance tracking over time'
              }
            </div>
          </div>
        )}
        
        <div className="pt-4 border-t">
          <div className="text-sm font-medium text-gray-700 mb-2">Data Actions</div>
          <Button 
            onClick={refreshData} 
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="w-full flex items-center gap-2"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
        
        <div className="pt-4 border-t">
          <div className="text-sm font-medium text-gray-700 mb-2">Current Settings</div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Time Range:</span>
              <Badge variant="outline" className="text-xs">
                {timeRanges.find(r => r.value === timeRange)?.label}
              </Badge>
            </div>
            {isCashFlow && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Mode:</span>
                <Badge variant="outline" className="text-xs">
                  {cashFlowMode === 'activity' ? 'Activity' : 'Balance'}
                </Badge>
              </div>
            )}
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Data Source:</span>
              <Badge variant="outline" className="text-xs">
                Mock Data
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 pt-2 border-t">
          <p>All data is generated from mock calculations</p>
          <p>Use refresh to generate new data points</p>
        </div>
      </CardContent>
    </Card>
  )
}

