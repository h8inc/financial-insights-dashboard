import { useAtom } from 'jotai'
import { timeRangeAtom, customDateRangeAtom, cashFlowModeAtom } from '@/lib/atoms'
import { TimeRange, DateRange } from '@/lib/types'

export const useFilters = () => {
  const [timeRange, setTimeRange] = useAtom(timeRangeAtom)
  const [customDateRange, setCustomDateRange] = useAtom(customDateRangeAtom)
  const [cashFlowMode, setCashFlowMode] = useAtom(cashFlowModeAtom)

  const updateTimeRange = (range: TimeRange) => {
    setTimeRange(range)
    setCustomDateRange(null)
  }

  const toggleCashFlowMode = () => {
    setCashFlowMode(prev => prev === 'activity' ? 'balance' : 'activity')
  }

  const getDateRange = (): DateRange => {
    const end = new Date()
    const start = new Date()

    switch (timeRange) {
      case '7D':
        start.setDate(start.getDate() - 7)
        break
      case '30D':
        start.setDate(start.getDate() - 30)
        break
      case '3M':
        start.setMonth(start.getMonth() - 3)
        break
      case 'YTD':
        start.setMonth(0, 1)
        break
      default:
        start.setDate(start.getDate() - 30)
    }

    return { start, end }
  }

  return {
    timeRange,
    customDateRange,
    cashFlowMode,
    updateTimeRange,
    toggleCashFlowMode,
    getDateRange
  }
}
