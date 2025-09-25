'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { ChartType } from '@/lib/types'
import { useChartData } from '@/hooks/useChartData'
import { useDeltaComparison } from '@/hooks/useDeltaComparison'
import { useAtom } from 'jotai'
import { isLoadingAtom } from '@/lib/atoms'
import { Button } from '@/components/ui/button'

interface DashboardCardProps {
  type: ChartType
  title: string
  href: string
}

export const DashboardCard = ({ type, title, href }: DashboardCardProps) => {
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
  
  if (isLoading) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            {title}
          </CardTitle>
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          {/* Value shimmer - matches text-2xl font-bold height */}
          <div className="h-8 w-36 bg-gray-200 rounded animate-pulse" />
          
          {/* Delta shimmer - matches badge + text layout with proper spacing */}
          <div className="flex items-center space-x-2 mt-2">
            <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Link href={href} className="no-underline">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            {title}
          </CardTitle>
          {currentDelta.trend === 'up' ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {formatValue(currentValue)}
          </div>
          <div className="flex items-center space-x-2 mt-2">
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
            <span className="text-xs text-gray-500">vs last period</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
