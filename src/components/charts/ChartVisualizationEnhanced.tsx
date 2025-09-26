'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Settings } from 'lucide-react'
import { ChartType, ChartDataPoint, CashFlowDataPoint } from '@/lib/types'
import { useChartDataConsumer } from '@/hooks/useChartDataConsumer'
import { useDeltaComparison } from '@/hooks/useDeltaComparison'
import { useAtom } from 'jotai'
import { isLoadingAtom, cashFlowModeAtom } from '@/lib/atoms'
import { EmbeddedChartFilters } from './EmbeddedChartFilters'
import { MobileChartLayout } from './MobileChartLayout'
import { useResponsiveView } from '@/hooks/useResponsiveView'
import { D3BarChart, D3LineChart } from './D3Charts'
import { D3ChartConfigurator } from './D3ChartConfigurator'

interface ChartVisualizationProps {
  type: ChartType
  title: string
  enableAdvancedMode?: boolean
}

export const ChartVisualization = ({ type, title, enableAdvancedMode = false }: ChartVisualizationProps) => {
  const { cashFlowData, profitData, expensesData, revenueData, isLoading, cashFlowMode } = useChartDataConsumer()
  const { getCurrentDeltas } = useDeltaComparison()
  const { isMobileView } = useResponsiveView()
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | CashFlowDataPoint | null>(null)
  const [showAdvancedMode, setShowAdvancedMode] = useState(false)
  
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
  
  // Calculate current value (sum of all data points)
  const currentValue = currentData.reduce((sum, point) => sum + point.value, 0)

  // Render mobile layout if on mobile
  if (isMobileView) {
    return <MobileChartLayout type={type} title={title} />
  }
  
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
  const renderD3Chart = () => {
    if (currentData.length === 0) return null

    const chartProps = {
      width: 800,
      height: 400,
      className: "w-full h-full",
      onDataPointHover: setHoveredPoint
    }

    switch (type) {
      case ChartType.CASH_FLOW:
        // Temporarily use bar chart for cash flow until D3CashFlowChart is fixed
        return (
          <D3BarChart {...chartProps} data={cashFlowData} color="#3b82f6" />
        )
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
  }

  // Get data for advanced configurator
  const getAdvancedData = () => {
    switch (type) {
      case ChartType.CASH_FLOW:
        return cashFlowMode === 'balance' 
          ? cashFlowData.map(point => ({ date: point.date, value: point.balance }))
          : cashFlowData.map(point => ({ date: point.date, value: point.value }))
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

  // Get default chart type for advanced mode
  const getDefaultChartType = () => {
    switch (type) {
      case ChartType.CASH_FLOW:
        return cashFlowMode === 'balance' ? 'line' : 'bar'
      case ChartType.PROFIT:
        return 'bar'
      case ChartType.EXPENSES:
        return 'bar'
      case ChartType.REVENUE:
        return 'area'
      default:
        return 'line'
    }
  }

  // Get default color for advanced mode
  const getDefaultColor = () => {
    switch (type) {
      case ChartType.CASH_FLOW:
        return '#3b82f6'
      case ChartType.PROFIT:
        return '#10b981'
      case ChartType.EXPENSES:
        return '#ef4444'
      case ChartType.REVENUE:
        return '#8b5cf6'
      default:
        return '#3b82f6'
    }
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

  // Show advanced mode if enabled and requested
  if (enableAdvancedMode && showAdvancedMode) {
    return (
      <D3ChartConfigurator
        data={getAdvancedData()}
        title={title}
        defaultChartType={getDefaultChartType() as 'line' | 'bar' | 'area'}
        defaultColor={getDefaultColor()}
      />
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
            {enableAdvancedMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedMode(!showAdvancedMode)}
                className="ml-2"
              >
                <Settings className="h-3 w-3 mr-1" />
                {showAdvancedMode ? 'Simple' : 'Advanced'}
              </Button>
            )}
          </div>
        </div>
        
        {/* Embedded Filters for Desktop */}
        {!isMobileView && (
          <EmbeddedChartFilters chartType={type} className="mt-4" />
        )}
      </CardHeader>
      <CardContent>
        <div className="h-96 bg-gray-50 rounded-lg p-4">
          {currentData.length > 0 ? (
            renderD3Chart()
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No data available</p>
            </div>
          )}
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>Showing {currentData.length} data points</p>
          <p>Period: {currentData[0]?.date} to {currentData[currentData.length - 1]?.date}</p>
          {hoveredPoint && (
            <div className="mt-2 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
              <p className="text-blue-800 font-medium">
                Hovering: {new Date(hoveredPoint.date).toLocaleDateString()}
              </p>
              <p className="text-blue-600">
                Value: ${hoveredPoint.value.toLocaleString()}
              </p>
              {'inflow' in hoveredPoint && (
                <div className="mt-1 text-xs">
                  <span className="text-green-600">In: ${hoveredPoint.inflow.toLocaleString()}</span>
                  <span className="text-red-600 ml-2">Out: ${hoveredPoint.outflow.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
