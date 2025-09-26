import { useAtom } from 'jotai'
import { 
  timeRangeAtom, 
  cashFlowDataAtom, 
  profitDataAtom, 
  expensesDataAtom, 
  revenueDataAtom,
  isLoadingAtom,
  cashFlowModeAtom
} from '@/lib/atoms'

// ==========================================
// SIMPLE DATA CONSUMER HOOK
// ==========================================
// This hook ONLY reads data from atoms - it does NOT load data
// Data loading is handled by DataProvider only

export const useChartDataConsumer = () => {
  const [timeRange] = useAtom(timeRangeAtom)
  const [cashFlowMode] = useAtom(cashFlowModeAtom)
  const [cashFlowData] = useAtom(cashFlowDataAtom)
  const [profitData] = useAtom(profitDataAtom)
  const [expensesData] = useAtom(expensesDataAtom)
  const [revenueData] = useAtom(revenueDataAtom)
  const [isLoading] = useAtom(isLoadingAtom)

  return {
    // Data (read-only)
    timeRange,
    cashFlowMode,
    cashFlowData,
    profitData,
    expensesData,
    revenueData,
    isLoading
  }
}
