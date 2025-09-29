'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from 'lucide-react'
import { ChartType, ChartDataPoint, CashFlowDataPoint } from '@/lib/types'
import { useChartDataConsumer } from '@/hooks/useChartDataConsumer'
import { useDeltaComparison } from '@/hooks/useDeltaComparison'
import { EmbeddedChartFilters } from './EmbeddedChartFilters'
import { MobileChartLayout } from './MobileChartLayout'
import { useResponsiveView } from '@/hooks/useResponsiveView'
import { D3BarChart, D3LineChart } from './D3Charts'
import { useMemo, useState, memo } from 'react'

interface ChartVisualizationProps {
  type: ChartType
  title: string
}

const ChartVisualizationComponent = ({ type, title }: ChartVisualizationProps) => {
  const { cashFlowData, profitData, expensesData, revenueData, isLoading, cashFlowMode } = useChartDataConsumer()
  const { getCurrentDeltas } = useDeltaComparison()
  const { isMobileView } = useResponsiveView()
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | CashFlowDataPoint | null>(null)
  
  const deltas = getCurrentDeltas()
  
  // Get current data based on type and mode
  const getCurrentData = () => {
    switch (type) {
      case ChartType.CASH_FLOW:
        // For cash flow, transform data based on mode
        if (cashFlowMode === 'balance') {
          // Return balance data as ChartDataPoint format
          return cashFlowData.map(point => ({
            ...point,
            value: point.balance
          }))
        }
        // In activity mode, return the original cash flow data
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
  
  const currentData = useMemo(() => getCurrentData(), [getCurrentData, cashFlowData, profitData, expensesData, revenueData, cashFlowMode, type])
  const currentDelta = useMemo(() => getCurrentDelta(), [getCurrentDelta, deltas, type])
  
  // Calculate current value (sum of all data points)
  const currentValue = useMemo(() => {
    if (!currentData || currentData.length === 0) return 0
    return currentData.reduce((sum, point) => sum + point.value, 0)
  }, [currentData])

  // Format value as currency
  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }
  
  // Render D3 chart based on type and mode
  const renderD3Chart = useMemo(() => {
    if (!currentData || currentData.length === 0) return null

    const chartProps = {
      width: 800,
      height: 400,
      className: "w-full h-full",
      onDataPointHover: setHoveredPoint
    }

    switch (type) {
      case ChartType.CASH_FLOW: {
        if (cashFlowMode === 'balance') {
          // Balance mode: Show line chart
          const chartData = cashFlowData.map(point => ({ ...point, value: point.balance }))
          return (
            <D3LineChart {...chartProps} data={chartData} color="#3b82f6" showArea={true} />
          )
        } else {
          // Activity mode: Show inflow and outflow as separate bars
          // For now, we'll show net flow (inflow - outflow) with color based on positive/negative
          const chartData = cashFlowData.map(point => ({
            ...point,
            value: Math.abs(point.value), // Use absolute value for bar height
            isPositive: point.value >= 0,
            originalValue: point.value // Keep original value for tooltip
          }))
          
          return (
            <D3BarChart 
              {...chartProps} 
              data={chartData} 
              color="#10b981" // Green for positive, will be overridden per bar
            />
          )
        }
      }
      case ChartType.PROFIT:
        return (
          <D3BarChart
            {...chartProps}
            data={profitData}
            color="#10b981"
          />
        )
      case ChartType.EXPENSES:
        return (
          <D3BarChart
            {...chartProps}
            data={expensesData}
            color="#ef4444"
          />
        )
      case ChartType.REVENUE:
        return (
          <D3LineChart
            {...chartProps}
            data={revenueData}
            color="#3b82f6"
            showArea={true}
          />
        )
      default:
        return null
    }
  }, [type, cashFlowMode, cashFlowData, profitData, expensesData, revenueData, currentData, setHoveredPoint])

  // Render mobile layout if on mobile
  if (isMobileView) {
    return <MobileChartLayout type={type} title={title} />
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
        <div className="flex justify-between items-start mb-4">
          <div>
            <CardTitle>
              {title}
              {type === ChartType.CASH_FLOW && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({cashFlowMode === 'activity' ? 'Activity' : 'Balance'} Mode)
                </span>
              )}
            </CardTitle>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {formatValue(currentValue)}
            </div>
            <div className="text-sm text-gray-500">
              {type === ChartType.CASH_FLOW && cashFlowMode === 'balance' 
                ? 'Current Balance' 
                : 'vs last period'
              }
            </div>
          </div>
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
        
        {/* Embedded Filters for Desktop */}
        {!isMobileView && (
          <EmbeddedChartFilters chartType={type} className="mt-4" />
        )}
      </CardHeader>
      <CardContent>
        <div 
          className="h-96 bg-gray-50 rounded-lg p-4 relative"
          onMouseLeave={() => {
            setHoveredPoint(null)
            // Also clear any hover backgrounds in D3
            const svg = document.querySelector('.h-96 svg')
            if (svg) {
              const g = svg.querySelector('g')
              if (g) {
                const hoverBgs = g.querySelectorAll('.hover-background')
                hoverBgs.forEach(bg => bg.remove())
              }
            }
          }}
        >
          {currentData && currentData.length > 0 ? (
            renderD3Chart
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No data available</p>
            </div>
          )}
          
          {/* Tooltip positioned absolutely */}
          {hoveredPoint && (
            <div
              className="absolute bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm pointer-events-none z-10"
              style={{
                left: `${((hoveredPoint as ChartDataPoint & { x?: number }).x || 0) + 10}px`,
                top: `${((hoveredPoint as ChartDataPoint & { y?: number }).y || 0) - 10}px`,
                transform: 'translate(0, -100%)'
              }}
            >
              <div className="font-medium">
                {new Date(hoveredPoint.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
              <div className="text-gray-300">
                Value: ${((hoveredPoint as ChartDataPoint & { originalValue?: number }).originalValue ?? hoveredPoint.value).toLocaleString()}
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>Showing {currentData?.length || 0} data points</p>
          <p>Period: {currentData?.[0]?.date || 'N/A'} to {currentData?.[currentData.length - 1]?.date || 'N/A'}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Memoize the component to prevent unnecessary re-renders
export const ChartVisualization = memo(ChartVisualizationComponent)

