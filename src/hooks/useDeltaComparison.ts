import { useAtom } from 'jotai'
import { cashFlowDeltaAtom, profitDeltaAtom, expensesDeltaAtom, revenueDeltaAtom } from '@/lib/atoms'
import { DeltaComparison, ChartDataPoint } from '@/lib/types'

export const useDeltaComparison = () => {
  const [cashFlowDelta, setCashFlowDelta] = useAtom(cashFlowDeltaAtom)
  const [profitDelta, setProfitDelta] = useAtom(profitDeltaAtom)
  const [expensesDelta, setExpensesDelta] = useAtom(expensesDeltaAtom)
  const [revenueDelta, setRevenueDelta] = useAtom(revenueDeltaAtom)

  const calculateDelta = (current: number, previous: number): DeltaComparison => {
    const percentage = previous === 0 ? 0 : ((current - previous) / previous) * 100
    const trend = percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral'
    
    return {
      current,
      previous,
      percentage: Math.abs(percentage),
      trend
    }
  }

  // Calculate delta from chart data arrays (sum of all values)
  const calculateDeltaFromData = (currentData: ChartDataPoint[], previousData: ChartDataPoint[]): DeltaComparison => {
    const currentSum = currentData.reduce((sum, point) => sum + point.value, 0)
    const previousSum = previousData.reduce((sum, point) => sum + point.value, 0)
    
    return calculateDelta(currentSum, previousSum)
  }

  // Update deltas from period data returned by useEnhancedChartData
  const updateDeltasFromPeriodData = (periodData: {
    cashFlow: { current: ChartDataPoint[]; previous: ChartDataPoint[] }
    profit: { current: ChartDataPoint[]; previous: ChartDataPoint[] }
    expenses: { current: ChartDataPoint[]; previous: ChartDataPoint[] }
    revenue: { current: ChartDataPoint[]; previous: ChartDataPoint[] }
  }) => {
    const cashFlowDelta = calculateDeltaFromData(periodData.cashFlow.current, periodData.cashFlow.previous)
    const profitDelta = calculateDeltaFromData(periodData.profit.current, periodData.profit.previous)
    const expensesDelta = calculateDeltaFromData(periodData.expenses.current, periodData.expenses.previous)
    const revenueDelta = calculateDeltaFromData(periodData.revenue.current, periodData.revenue.previous)

    setCashFlowDelta(cashFlowDelta.percentage)
    setProfitDelta(profitDelta.percentage)
    setExpensesDelta(expensesDelta.percentage)
    setRevenueDelta(revenueDelta.percentage)

    return {
      cashFlow: cashFlowDelta,
      profit: profitDelta,
      expenses: expensesDelta,
      revenue: revenueDelta
    }
  }

  // Legacy method for simple number comparisons
  const updateDeltas = (data: {
    cashFlow: { current: number; previous: number }
    profit: { current: number; previous: number }
    expenses: { current: number; previous: number }
    revenue: { current: number; previous: number }
  }) => {
    setCashFlowDelta(calculateDelta(data.cashFlow.current, data.cashFlow.previous).percentage)
    setProfitDelta(calculateDelta(data.profit.current, data.profit.previous).percentage)
    setExpensesDelta(calculateDelta(data.expenses.current, data.expenses.previous).percentage)
    setRevenueDelta(calculateDelta(data.revenue.current, data.revenue.previous).percentage)
  }

  const getDeltaDisplay = (delta: number, trend: 'up' | 'down' | 'neutral') => {
    const sign = trend === 'up' ? '+' : trend === 'down' ? '-' : ''
    const color = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
    
    return {
      text: `${sign}${delta.toFixed(1)}%`,
      color
    }
  }

  // Get current delta values with trend information
  const getCurrentDeltas = () => {
    return {
      cashFlow: { percentage: cashFlowDelta, trend: cashFlowDelta > 0 ? 'up' : cashFlowDelta < 0 ? 'down' : 'neutral' },
      profit: { percentage: profitDelta, trend: profitDelta > 0 ? 'up' : profitDelta < 0 ? 'down' : 'neutral' },
      expenses: { percentage: expensesDelta, trend: expensesDelta > 0 ? 'up' : expensesDelta < 0 ? 'down' : 'neutral' },
      revenue: { percentage: revenueDelta, trend: revenueDelta > 0 ? 'up' : revenueDelta < 0 ? 'down' : 'neutral' }
    }
  }

  return {
    cashFlowDelta,
    profitDelta,
    expensesDelta,
    revenueDelta,
    calculateDelta,
    calculateDeltaFromData,
    updateDeltasFromPeriodData,
    updateDeltas,
    getDeltaDisplay,
    getCurrentDeltas
  }
}
