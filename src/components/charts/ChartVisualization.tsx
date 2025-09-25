'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from 'lucide-react'
import { ChartType } from '@/lib/types'
import { useChartData } from '@/hooks/useChartData'
import { useDeltaComparison } from '@/hooks/useDeltaComparison'
import { useAtom } from 'jotai'
import { isLoadingAtom } from '@/lib/atoms'

interface ChartVisualizationProps {
  type: ChartType
  title: string
}

export const ChartVisualization = ({ type, title }: ChartVisualizationProps) => {
  const { cashFlowData, profitData, expensesData, revenueData } = useChartData()
  const { getCurrentDeltas } = useDeltaComparison()
  const [isLoading] = useAtom(isLoadingAtom)
  
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
  
  // Generate mock chart data visualization
  const generateChartBars = () => {
    if (currentData.length === 0) return null
    
    const maxValue = Math.max(...currentData.map(point => point.value))
    
    return (
      <div className="flex items-end justify-between h-64 px-4 py-4 space-x-1">
        {currentData.slice(-10).map((point, index) => {
          const height = (point.value / maxValue) * 200
          return (
            <div key={point.date} className="flex flex-col items-center flex-1">
              <div
                className="bg-blue-500 rounded-t w-full transition-all duration-300 hover:bg-blue-600"
                style={{ height: `${height}px` }}
                title={`${point.date}: ${formatValue(point.value)}`}
              />
              <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
                {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          <div className="flex items-center space-x-2">
            {currentDelta.trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <Badge 
              variant={currentDelta.trend === 'up' ? 'default' : 'destructive'}
              className="text-xs"
            >
              {currentDelta.trend === 'up' ? (
                <ArrowUpRight className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-1" />
              )}
              {currentDelta.percentage.toFixed(1)}%
            </Badge>
          </div>
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {formatValue(currentValue)}
        </div>
        <div className="text-sm text-gray-500">
          vs last period
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96 bg-gray-50 rounded-lg p-4">
          {currentData.length > 0 ? (
            generateChartBars()
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No data available</p>
            </div>
          )}
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>Showing {currentData.length} data points</p>
          <p>Period: {currentData[0]?.date} to {currentData[currentData.length - 1]?.date}</p>
        </div>
      </CardContent>
    </Card>
  )
}

