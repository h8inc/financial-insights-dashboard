'use client'

import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { ChartType, ChartDataPoint } from '@/lib/types'
import { useChartDataConsumer } from '@/hooks/useChartDataConsumer'
import { useDeltaComparison } from '@/hooks/useDeltaComparison'
import { MobileChartModeSwitcher } from './MobileChartModeSwitcher'
import { MobileTimeFilter } from './MobileTimeFilter'
import { useResponsiveView } from '@/hooks/useResponsiveView'
import { D3BarChart, D3LineChart } from './D3Charts'
import { useMemo, useState } from 'react'

interface MobileChartLayoutProps {
  type: ChartType
  title: string
}

export const MobileChartLayout = ({ type, title }: MobileChartLayoutProps) => {
  const { cashFlowData, profitData, expensesData, revenueData, isLoading, cashFlowMode } = useChartDataConsumer()
  const { getCurrentDeltas } = useDeltaComparison()
  const { isMobileView } = useResponsiveView()
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null)
  
  const deltas = getCurrentDeltas()
  
  // Get current data based on type and mode
  const getCurrentData = () => {
    switch (type) {
      case ChartType.CASH_FLOW:
        // For cash flow, transform data based on mode
        if (cashFlowMode === 'balance') {
          // Return balance data as ChartDataPoint format
          return cashFlowData.map(point => ({
            date: point.date,
            value: point.balance
          }))
        } else {
          // Return net flow data (activity mode)
          return cashFlowData.map(point => ({
            date: point.date,
            value: point.value
          }))
        }
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
  
  // Render D3 chart based on type and mode for mobile
  const renderMobileD3Chart = useMemo(() => {
    if (!currentData || currentData.length === 0) return null

    const chartProps = {
      width: 400,
      height: 200,
      className: "w-full h-full",
      onDataPointHover: setHoveredPoint
    }

    switch (type) {
      case ChartType.CASH_FLOW:
        if (cashFlowMode === 'balance') {
          // Balance mode: Show line chart
          return (
            <D3LineChart {...chartProps} data={currentData} color="#3b82f6" showArea={true} />
          )
        } else {
          // Activity mode: Show bars with colors
          const chartData = cashFlowData.map(point => ({
            ...point,
            value: Math.abs(point.value), // Use absolute value for bar height
            isPositive: point.value >= 0,
            originalValue: point.value // Keep original value for tooltip
          }))
          return (
            <D3BarChart {...chartProps} data={chartData} color="#10b981" />
          )
        }
      case ChartType.PROFIT:
        return (
          <D3BarChart
            {...chartProps}
            data={currentData}
            color="#10b981"
          />
        )
      case ChartType.EXPENSES:
        return (
          <D3BarChart
            {...chartProps}
            data={currentData}
            color="#ef4444"
          />
        )
      case ChartType.REVENUE:
        return (
          <D3LineChart
            {...chartProps}
            data={currentData}
            color="#3b82f6"
            showArea={true}
          />
        )
      default:
        return null
    }
  }, [type, currentData, cashFlowData, cashFlowMode])

  // Only render on mobile
  if (!isMobileView) {
    return null
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="space-y-4">
      {/* 1. Date Filter - TOP OF SCREEN */}
      <MobileTimeFilter />
      
      {/* 2. Headline with Text */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900">
          {title}
          {type === ChartType.CASH_FLOW && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({cashFlowMode === 'activity' ? 'Activity' : 'Balance'} Mode)
            </span>
          )}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {type === ChartType.CASH_FLOW && cashFlowMode === 'balance' 
            ? 'Track your balance over time' 
            : 'Track your financial performance'
          }
        </p>
      </div>
      
      {/* 3. Chart Card with proper hierarchy */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* 3a. Activity/Balance Switcher - TOP OF CHART CARD (only for cash flow) */}
          <MobileChartModeSwitcher chartType={type} />
          
          {/* 3b. Legend - BELOW SWITCHER (or at top if no switcher) */}
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-600">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Data</span>
            </div>
            {currentDelta.trend === 'up' ? (
              <div className="flex items-center space-x-1 text-green-600">
                <TrendingUp className="h-3 w-3" />
                <span>+{currentDelta.percentage.toFixed(1)}%</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-red-600">
                <TrendingDown className="h-3 w-3" />
                <span>{currentDelta.percentage.toFixed(1)}%</span>
              </div>
            )}
          </div>
          
          {/* Mobile legend for tapped data point */}
          {hoveredPoint && (
            <div className="bg-gray-100 rounded-lg p-3 text-center">
              <div className="text-sm font-medium text-gray-900">
                {new Date(hoveredPoint.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
              <div className="text-lg font-bold text-blue-600">
                ${((hoveredPoint as ChartDataPoint & { originalValue?: number }).originalValue ?? hoveredPoint.value).toLocaleString()}
              </div>
            </div>
          )}
          
          {/* 3c. Chart Visualization - BELOW LEGEND */}
          <div className="bg-gray-50 rounded-lg p-2">
            {currentData && currentData.length > 0 ? (
              renderMobileD3Chart
            ) : (
              <div className="flex items-center justify-center h-48">
                <p className="text-gray-500">No data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
