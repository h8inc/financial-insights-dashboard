'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { ChartType } from '@/lib/types'
import { useChartData } from '@/hooks/useChartData'
import { useDeltaComparison } from '@/hooks/useDeltaComparison'
import { useDataContext } from '@/components/DataProvider'
import { Button } from '@/components/ui/button'

interface DeltaDisplayProps {
  type: ChartType
}

export const DeltaDisplay = ({ type }: DeltaDisplayProps) => {
  const { cashFlowData, profitData, expensesData, revenueData } = useChartData()
  const { getCurrentDeltas } = useDeltaComparison()
  const { refreshData, isLoading } = useDataContext()
  
  const deltas = getCurrentDeltas()
  
  // Get current data based on type
  const getCurrentData = () => {
    switch (type) {
      case ChartType.CASH_FLOW:
        return cashFlowData
      case ChartType.PROFIT:
        return profitData
      case ChartType.EXPENSES:
        return expensesData
      case ChartType.REVENUE:
        return revenueData
      default:
        return []
    }
  }
  
  // Get current delta based on type
  const getCurrentDelta = () => {
    switch (type) {
      case ChartType.CASH_FLOW:
        return deltas.cashFlow
      case ChartType.PROFIT:
        return deltas.profit
      case ChartType.EXPENSES:
        return deltas.expenses
      case ChartType.REVENUE:
        return deltas.revenue
      default:
        return { percentage: 0, trend: 'neutral' as const }
    }
  }
  
  const currentData = getCurrentData()
  const currentDelta = getCurrentDelta()
  
  // Calculate current value (sum of all data points)
  const currentValue = currentData.reduce((sum, point) => sum + point.value, 0)
  
  // Format value as currency
  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }
  
  // Calculate estimated previous period value
  const estimatedPreviousValue = currentValue / (1 + currentDelta.percentage / 100)
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Delta Analysis</CardTitle>
          <Button 
            onClick={refreshData} 
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Current Period</div>
            <div className="text-xl font-bold text-gray-900">
              {formatValue(currentValue)}
            </div>
            <div className="text-xs text-gray-500">
              {currentData.length} data points
            </div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Previous Period</div>
            <div className="text-xl font-bold text-gray-900">
              {formatValue(estimatedPreviousValue)}
            </div>
            <div className="text-xs text-gray-500">
              Estimated
            </div>
          </div>
        </div>
        
        <div className="text-center p-4 border rounded-lg">
          <div className="text-sm text-gray-600 mb-2">Period-over-Period Change</div>
          <div className="flex items-center justify-center space-x-2">
            {currentDelta.trend === 'up' ? (
              <TrendingUp className="h-6 w-6 text-green-600" />
            ) : (
              <TrendingDown className="h-6 w-6 text-red-600" />
            )}
            <Badge 
              variant={currentDelta.trend === 'up' ? 'default' : 'destructive'}
              className="text-lg px-3 py-1"
            >
              {currentDelta.trend === 'up' ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              )}
              {currentDelta.percentage.toFixed(1)}%
            </Badge>
          </div>
          <div className="text-sm text-gray-500 mt-2">
            {currentDelta.trend === 'up' ? 'Increase' : 'Decrease'} from previous period
          </div>
        </div>
        
        <div className="text-xs text-gray-500 text-center">
          <p>Data is generated from mock calculations</p>
          <p>Click refresh to generate new data and see updated deltas</p>
        </div>
      </CardContent>
    </Card>
  )
}

