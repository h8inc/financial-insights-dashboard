// Chart data types
export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

export interface CashFlowDataPoint extends ChartDataPoint {
  inflow: number
  outflow: number
  balance: number
  moneyIn?: number
  moneyOut?: number
  netFlow?: number
}

export interface DeltaComparison {
  current: number
  previous: number
  percentage: number
  trend: 'up' | 'down' | 'neutral'
}

// Chart component props
export interface ChartProps {
  data: ChartDataPoint[]
  width?: number
  height?: number
  className?: string
}

export interface CashFlowChartProps extends ChartProps {
  data: CashFlowDataPoint[]
  mode: 'activity' | 'balance'
}

// Filter types
export type TimeRange = '7D' | '30D' | '3M' | 'YTD'

export interface DateRange {
  start: Date
  end: Date
}

// Transaction widget types
export interface Transaction {
  id: string
  date: string
  amount: number
  description: string
  category: string
  type: 'income' | 'expense'
}

// Chart types enum
export enum ChartType {
  CASH_FLOW = 'cash-flow',
  PROFIT = 'profit',
  EXPENSES = 'expenses',
  REVENUE = 'revenue'
}
