import { useAtom } from 'jotai'
import { timeRangeAtom, cashFlowDataAtom, profitDataAtom, expensesDataAtom, revenueDataAtom } from '@/lib/atoms'
import { ChartDataPoint, CashFlowDataPoint } from '@/lib/types'

export const useChartData = () => {
  const [timeRange] = useAtom(timeRangeAtom)
  const [cashFlowData, setCashFlowData] = useAtom(cashFlowDataAtom)
  const [profitData, setProfitData] = useAtom(profitDataAtom)
  const [expensesData, setExpensesData] = useAtom(expensesDataAtom)
  const [revenueData, setRevenueData] = useAtom(revenueDataAtom)

  // Generate realistic mock data with trends and seasonality
  const generateMockData = (type: 'cash-flow' | 'profit' | 'expenses' | 'revenue'): ChartDataPoint[] => {
    const days = timeRange === '7D' ? 7 : timeRange === '30D' ? 30 : timeRange === '3M' ? 90 : 365
    const data: ChartDataPoint[] = []
    
    // Base values for different metrics
    const baseValues = {
      'cash-flow': { base: 12000, volatility: 0.15 },
      'profit': { base: 8500, volatility: 0.2 },
      'expenses': { base: 4500, volatility: 0.1 },
      'revenue': { base: 15000, volatility: 0.25 }
    }
    
    const { base, volatility } = baseValues[type]
    
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (days - i))
      
      // Add some trend and seasonality
      const dayOfWeek = date.getDay()
      const dayOfMonth = date.getDate()
      
      // Weekend effect (lower values on weekends)
      const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.7 : 1.0
      
      // Monthly trend (higher values mid-month)
      const monthlyTrend = Math.sin((dayOfMonth / 30) * Math.PI) * 0.1 + 1
      
      // Random variation
      const randomFactor = 1 + (Math.random() - 0.5) * volatility
      
      const value = base * weekendFactor * monthlyTrend * randomFactor
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(value)
      })
    }
    
    return data
  }

  // Generate data for both current and previous periods for delta calculation
  const generatePeriodData = (type: 'cash-flow' | 'profit' | 'expenses' | 'revenue') => {
    const currentData = generateMockData(type)
    
    // Generate previous period data with slight variations
    const previousData: ChartDataPoint[] = []
    const days = currentData.length
    
    for (let i = 0; i < days; i++) {
      const currentPoint = currentData[i]
      const date = new Date(currentPoint.date)
      date.setDate(date.getDate() - days) // Previous period
      
      // Previous period values with some variation (-10% to +5%)
      const variation = 0.85 + Math.random() * 0.2
      const previousValue = currentPoint.value * variation
      
      previousData.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(previousValue)
      })
    }
    
    return { current: currentData, previous: previousData }
  }

  const loadChartData = async () => {
    // Simulate API calls with realistic delays
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const cashFlowPeriods = generatePeriodData('cash-flow')
    const profitPeriods = generatePeriodData('profit')
    const expensesPeriods = generatePeriodData('expenses')
    const revenuePeriods = generatePeriodData('revenue')
    
    setCashFlowData(cashFlowPeriods.current)
    setProfitData(profitPeriods.current)
    setExpensesData(expensesPeriods.current)
    setRevenueData(revenuePeriods.current)
    
    // Return period data for delta calculation
    return {
      cashFlow: cashFlowPeriods,
      profit: profitPeriods,
      expenses: expensesPeriods,
      revenue: revenuePeriods
    }
  }

  return {
    cashFlowData,
    profitData,
    expensesData,
    revenueData,
    loadChartData,
    generatePeriodData
  }
}
