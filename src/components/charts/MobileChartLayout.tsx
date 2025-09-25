'use client'

import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { ChartType } from '@/lib/types'
import { useChartData } from '@/hooks/useChartData'
import { useDeltaComparison } from '@/hooks/useDeltaComparison'
import { useAtom } from 'jotai'
import { isLoadingAtom, cashFlowModeAtom } from '@/lib/atoms'
import { MobileChartModeSwitcher } from './MobileChartModeSwitcher'
import { MobileTimeFilter } from './MobileTimeFilter'
import { useResponsiveView } from '@/hooks/useResponsiveView'

interface MobileChartLayoutProps {
  type: ChartType
  title: string
}

export const MobileChartLayout = ({ type, title }: MobileChartLayoutProps) => {
  const { cashFlowData, profitData, expensesData, revenueData } = useChartData()
  const { getCurrentDeltas } = useDeltaComparison()
  const [isLoading] = useAtom(isLoadingAtom)
  const [cashFlowMode] = useAtom(cashFlowModeAtom)
  const { isMobileView } = useResponsiveView()
  
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
  
  // Generate bar chart visualization for mobile
  const generateChartBars = () => {
    if (currentData.length === 0) return null
    
    const maxValue = Math.max(...currentData.map(point => point.value))
    
    return (
      <div className="flex items-end justify-between h-48 px-2 py-4 space-x-1">
        {currentData.slice(-10).map((point) => {
          const height = (point.value / maxValue) * 150
          return (
            <div key={point.date} className="flex flex-col items-center flex-1">
              <div
                className="bg-blue-500 rounded-t w-full transition-all duration-300 hover:bg-blue-600"
                style={{ height: `${height}px` }}
                title={`${point.date}: $${point.value.toLocaleString()}`}
              />
              <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-left">
                {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Generate line chart visualization for mobile
  const generateChartLine = () => {
    if (currentData.length === 0) return null
    
    const maxValue = Math.max(...currentData.map(point => point.value))
    const minValue = Math.min(...currentData.map(point => point.value))
    const valueRange = maxValue - minValue
    
    // Create SVG path for the line
    const points = currentData.slice(-10).map((point, index) => {
      const x = (index / (currentData.slice(-10).length - 1)) * 100
      const y = 100 - ((point.value - minValue) / valueRange) * 80 // Leave 20% margin
      return `${x},${y}`
    }).join(' L')
    
    return (
      <div className="relative h-48 px-2 py-4">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          <defs>
            <pattern id="mobile-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#f3f4f6" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#mobile-grid)" />
          
          {/* Line chart */}
          <path
            d={`M ${points}`}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            className="transition-all duration-300"
          />
          
          {/* Data points */}
          {currentData.slice(-10).map((point, index) => {
            const x = (index / (currentData.slice(-10).length - 1)) * 100
            const y = 100 - ((point.value - minValue) / valueRange) * 80
            return (
              <circle
                key={point.date}
                cx={x}
                cy={y}
                r="2"
                fill="#3b82f6"
                className="transition-all duration-300 hover:r-3"
                title={`${point.date}: $${point.value.toLocaleString()}`}
              />
            )
          })}
        </svg>
        
        {/* X-axis labels */}
        <div className="absolute bottom-0 left-2 right-2 flex justify-between">
          {currentData.slice(-10).map((point) => (
            <div key={point.date} className="text-xs text-gray-500 transform -rotate-45 origin-left">
              {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          ))}
        </div>
      </div>
    )
  }

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
          
          {/* 3c. Chart Visualization - BELOW LEGEND */}
          <div className="bg-gray-50 rounded-lg p-2">
            {currentData.length > 0 ? (
              // Choose chart type based on cash flow mode
              type === ChartType.CASH_FLOW && cashFlowMode === 'balance' 
                ? generateChartLine() 
                : generateChartBars()
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
