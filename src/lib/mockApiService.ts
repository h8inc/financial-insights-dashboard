import { 
  ChartDataPointSchema, 
  CashFlowDataPointSchema,
  ChartDataRequestSchema,
  ChartDataResponseSchema,
  CashFlowResponseSchema,
  ApiErrorSchema,
  type ChartDataPoint,
  type CashFlowDataPoint,
  type TimeRange,
  type ChartDataRequest,
  type ChartDataResponse,
  type CashFlowResponse,
  type ApiError
} from '@/lib/schemas'

// ==========================================
// MOCK DATA GENERATORS
// ==========================================

class MockDataGenerator {
  // Generate realistic cash flow data with inflow, outflow, and balance
  static generateCashFlowData(timeRange: TimeRange): CashFlowDataPoint[] {
    const { count, period } = this.getDataPointsFromTimeRange(timeRange)
    const data: CashFlowDataPoint[] = []
    let runningBalance = 50000 // Starting balance
    
    for (let i = 0; i < count; i++) {
      const date = this.generateDateForPeriod(i, count, period)
      
      // Generate inflow and outflow with static patterns
      // Fixed patterns to ensure more positive net flows for consistent green bars
      const baseInflow = 10000 + (i % 3) * 1000 + (i % 7) * 200
      const baseOutflow = 7000 + (i % 4) * 600 + (i % 5) * 100
      
      // Adjust amounts based on period
      const periodMultiplier = period === 'weekly' ? 7 : period === 'monthly' ? 30 : 1
      const inflow = Math.round(baseInflow * periodMultiplier)
      const outflow = Math.round(baseOutflow * periodMultiplier)
      const netFlow = inflow - outflow
      
      runningBalance += netFlow
      
      const dataPoint = {
        date: date.toISOString().split('T')[0],
        value: netFlow,
        inflow,
        outflow,
        balance: Math.round(runningBalance),
        isProjected: false
      }
      
      // Validate the data point
      const validatedPoint = CashFlowDataPointSchema.parse(dataPoint)
      data.push(validatedPoint)
    }
    // Compute expected overlay for the current (last) historical period
    if (data.length > 0) {
      const lastIdx = data.length - 1
      const last = data[lastIdx]
      const lastDate = new Date(last.date)
      const now = new Date()
      // Only if last period is the current period bucket
      const isSameBucket = (() => {
        if (period === 'daily') return lastDate.toDateString() === now.toDateString()
        if (period === 'weekly') {
          const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000*60*60*24))
          return diffDays >= 0 && diffDays < 7
        }
        if (period === 'monthly') return lastDate.getFullYear() === now.getFullYear() && lastDate.getMonth() === now.getMonth()
        return false
      })()

      if (isSameBucket) {
        const progress = (() => {
          if (period === 'daily') return 1 // current day: treat as fully historical
          if (period === 'weekly') {
            const startOfWeek = new Date(now)
            startOfWeek.setDate(now.getDate() - now.getDay())
            const daysPassed = Math.max(1, now.getDay())
            return Math.min(1, daysPassed / 7)
          }
          if (period === 'monthly') {
            const day = now.getDate()
            const daysInMonth = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate()
            return Math.min(1, Math.max(0.1, day / daysInMonth))
          }
          return 1
        })()

        // Scale actuals for the current period to reflect only elapsed time
        const previousBalance = last.balance - last.value
        const scaledInflow = Math.round(last.inflow * progress)
        const scaledOutflow = Math.round(last.outflow * progress)
        const scaledNet = scaledInflow - scaledOutflow
        const adjustedCurrent = CashFlowDataPointSchema.parse({
          ...last,
          inflow: scaledInflow,
          outflow: scaledOutflow,
          value: scaledNet,
          balance: previousBalance + scaledNet
        })
        data[lastIdx] = adjustedCurrent

        // Option B: Blend between typical recent values and current pace, with caps
        const lookback = 3
        const recent = data.slice(-lookback - 1, -1) // exclude current last
        const avgIn = recent.length ? Math.round(recent.reduce((s, p) => s + p.inflow, 0) / recent.length) : adjustedCurrent.inflow
        const avgOut = recent.length ? Math.round(recent.reduce((s, p) => s + p.outflow, 0) / recent.length) : adjustedCurrent.outflow

        // Current pace extrapolation
        const paceIn = Math.round(adjustedCurrent.inflow / Math.max(0.1, progress))
        const paceOut = Math.round(adjustedCurrent.outflow / Math.max(0.1, progress))

        // Weight grows as the period progresses (gentle at start, faster near end)
        const gamma = 2
        const w = Math.pow(progress, gamma) // 0..1

        let blendedIn = Math.round((1 - w) * avgIn + w * paceIn)
        let blendedOut = Math.round((1 - w) * avgOut + w * paceOut)

        // Caps to avoid spikes: 60% .. 140% of typical (average)
        const minIn = Math.round(avgIn * 0.6)
        const maxIn = Math.round(avgIn * 1.4)
        const minOut = Math.round(avgOut * 0.6)
        const maxOut = Math.round(avgOut * 1.4)

        blendedIn = Math.min(maxIn, Math.max(minIn, blendedIn))
        blendedOut = Math.min(maxOut, Math.max(minOut, blendedOut))

        const expectedInflow = Math.max(adjustedCurrent.inflow, blendedIn)
        const expectedOutflow = Math.max(adjustedCurrent.outflow, blendedOut)
        data[lastIdx] = CashFlowDataPointSchema.parse({
          ...adjustedCurrent,
          expectedInflow,
          expectedOutflow
        })

        // Ensure projections start from adjusted balance
        runningBalance = data[lastIdx].balance
      }
    }

    // Append projected periods based on timeRange mapping
    const projectedCount = (() => {
      switch (timeRange) {
        case '7D':
          return 2
        case '30D':
          return 3
        case '3M':
          return 2
        case 'YTD':
          return 2
        default:
          return 2
      }
    })()

    // Extrapolation method: recent average of last 3 net flows (stable, demo-friendly)
    const recentNetFlows = data.slice(-3).map(d => d.value)
    const avgNetFlow = recentNetFlows.length
      ? Math.round(recentNetFlows.reduce((a, b) => a + b, 0) / recentNetFlows.length)
      : 0

    for (let i = 0; i < projectedCount; i++) {
      // Next period after the last actual point
      const lastDate = new Date(data[data.length - 1].date)
      const nextDate = new Date(lastDate)
      if (period === 'daily') nextDate.setDate(lastDate.getDate() + 1)
      if (period === 'weekly') nextDate.setDate(lastDate.getDate() + 7)
      if (period === 'monthly') {
        nextDate.setMonth(lastDate.getMonth() + 1)
        nextDate.setDate(1)
      }

      // Split projected netFlow into inflow/outflow proportions based on recent ratio
      const last = data[data.length - 1]
      const inflowRatio = last.outflow === 0 ? 1 : Math.min(1.5, last.inflow / Math.max(1, last.outflow))
      const projectedNet = avgNetFlow
      const projectedInflow = Math.max(0, Math.round(projectedNet * Math.max(1, inflowRatio)))
      const projectedOutflow = Math.max(0, projectedInflow - projectedNet)

      runningBalance += projectedNet

      const projectedPoint = CashFlowDataPointSchema.parse({
        date: nextDate.toISOString().split('T')[0],
        value: projectedNet,
        inflow: projectedInflow,
        outflow: projectedOutflow,
        balance: Math.round(runningBalance),
        isProjected: true,
        expectedInflow: projectedInflow,
        expectedOutflow: projectedOutflow
      })
      data.push(projectedPoint)
    }

    return data
  }

  // Generate realistic mock data with trends and seasonality
  static generateChartData(type: 'profit' | 'expenses' | 'revenue', timeRange: TimeRange): ChartDataPoint[] {
    const { count, period } = this.getDataPointsFromTimeRange(timeRange)
    const data: ChartDataPoint[] = []
    
    // Base values for different metrics
    const baseValues = {
      'profit': { base: 8500, volatility: 0.2 },
      'expenses': { base: 4500, volatility: 0.1 },
      'revenue': { base: 15000, volatility: 0.25 }
    }
    
    const { base } = baseValues[type]
    
    for (let i = 0; i < count; i++) {
      const date = this.generateDateForPeriod(i, count, period)
      
      // Add some trend and seasonality
      const dayOfWeek = date.getDay()
      const dayOfMonth = date.getDate()
      
      // Weekend effect (lower values on weekends) - only for daily data
      const weekendFactor = period === 'daily' && (dayOfWeek === 0 || dayOfWeek === 6) ? 0.7 : 1.0
      
      // Monthly trend (higher values mid-month)
      const monthlyTrend = Math.sin((dayOfMonth / 30) * Math.PI) * 0.1 + 1
      
      // Static variation based on index
      const staticFactor = 1 + (Math.sin(i * 0.3) * 0.1) + (Math.cos(i * 0.7) * 0.05)
      
      // Adjust base value based on period
      const periodMultiplier = period === 'weekly' ? 7 : period === 'monthly' ? 30 : 1
      const value = base * weekendFactor * monthlyTrend * staticFactor * periodMultiplier
      
      const dataPoint = {
        date: date.toISOString().split('T')[0],
        value: Math.round(value)
      }
      
      // Validate the data point
      const validatedPoint = ChartDataPointSchema.parse(dataPoint)
      data.push(validatedPoint)
    }
    
    return data
  }

  // Helper method to get appropriate data points from time range
  private static getDataPointsFromTimeRange(timeRange: TimeRange): { count: number; period: 'daily' | 'weekly' | 'monthly' } {
    const now = new Date()
    
    switch (timeRange) {
      case '7D': 
        return { count: 7, period: 'daily' }
      case '30D': 
        return { count: 30, period: 'daily' }
      case '3M': 
        return { count: 12, period: 'weekly' } // 12 weeks = ~3 months
      case 'YTD': 
        // Calculate months from January to current month
        const currentMonth = now.getMonth() + 1 // getMonth() returns 0-11, we want 1-12
        return { count: currentMonth, period: 'monthly' }
      case 'custom': 
        return { count: 30, period: 'daily' }
      default: 
        return { count: 30, period: 'daily' }
    }
  }

  // Helper method to generate appropriate dates based on period
  private static generateDateForPeriod(index: number, totalCount: number, period: 'daily' | 'weekly' | 'monthly'): Date {
    const now = new Date()
    const date = new Date(now)
    
    switch (period) {
      case 'daily':
        date.setDate(date.getDate() - (totalCount - index - 1))
        break
      case 'weekly':
        date.setDate(date.getDate() - (totalCount - index - 1) * 7)
        break
      case 'monthly':
        date.setMonth(date.getMonth() - (totalCount - index - 1))
        // Set to first day of month for consistency
        date.setDate(1)
        break
    }
    
    return date
  }
}

// ==========================================
// MOCK API SERVICE
// ==========================================

export class MockApiService {
  // Simulate API delay (reduced for better performance)
  private static async simulateDelay(ms: number = 20): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Get chart data for any chart type
  static async getChartData(request: ChartDataRequest): Promise<ChartDataResponse | ApiError> {
    try {
      // Validate the request
      const validatedRequest = ChartDataRequestSchema.parse(request)
      
      // Simulate API delay (static for consistency)
      await this.simulateDelay(15)
      
      // Generate data based on chart type
      let data: ChartDataPoint[]
      
      if (validatedRequest.chartType === 'cash-flow') {
        // For cash flow, we need to return CashFlowDataPoint[] but cast to ChartDataPoint[]
        const cashFlowData = MockDataGenerator.generateCashFlowData(validatedRequest.timeRange)
        data = cashFlowData as ChartDataPoint[]
      } else {
        data = MockDataGenerator.generateChartData(
          validatedRequest.chartType as 'profit' | 'expenses' | 'revenue',
          validatedRequest.timeRange
        )
      }
      
      // Create response
      const response: ChartDataResponse = {
        success: true,
        data,
        metadata: {
          timeRange: validatedRequest.timeRange,
          dataPoints: data.length,
          generatedAt: new Date().toISOString()
        }
      }
      
      // Validate response before returning
      return ChartDataResponseSchema.parse(response)
      
    } catch (error) {
      console.error('Mock API Error:', error)
      
      const errorResponse: ApiError = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: error
        }
      }
      
      return ApiErrorSchema.parse(errorResponse)
    }
  }

  // Get cash flow data specifically (returns CashFlowDataPoint[])
  static async getCashFlowData(timeRange: TimeRange): Promise<CashFlowResponse | ApiError> {
    try {
      // Simulate API delay (static for consistency)
      await this.simulateDelay(15)
      
      // Generate cash flow data
      const data = MockDataGenerator.generateCashFlowData(timeRange)
      
      // Create response
      const response: CashFlowResponse = {
        success: true,
        data,
        metadata: {
          timeRange,
          dataPoints: data.length,
          generatedAt: new Date().toISOString()
        }
      }
      
      // Validate response before returning
      return CashFlowResponseSchema.parse(response)
      
    } catch (error) {
      console.error('Mock API Error:', error)
      
      const errorResponse: ApiError = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: error
        }
      }
      
      return ApiErrorSchema.parse(errorResponse)
    }
  }

  // Get all chart data at once (for dashboard)
  static async getAllChartData(timeRange: TimeRange): Promise<{
    cashFlow: CashFlowResponse | ApiError
    profit: ChartDataResponse | ApiError
    expenses: ChartDataResponse | ApiError
    revenue: ChartDataResponse | ApiError
  }> {
    // Run all requests in parallel for better performance
    const [cashFlow, profit, expenses, revenue] = await Promise.all([
      this.getCashFlowData(timeRange),
      this.getChartData({ timeRange, chartType: 'profit' }),
      this.getChartData({ timeRange, chartType: 'expenses' }),
      this.getChartData({ timeRange, chartType: 'revenue' })
    ])

    return { cashFlow, profit, expenses, revenue }
  }
}
