import { useCallback, useEffect, useState } from 'react'
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
import { DataPersistenceManager } from '@/lib/dataPersistence'
import { MockApiService } from '@/lib/mockApiService'
import { 
  ChartDataPointSchema, 
  CashFlowDataPointSchema,
  type ChartDataPoint,
  type CashFlowDataPoint,
} from '@/lib/schemas'

// ==========================================
// ENHANCED DATA FETCHING HOOK
// ==========================================

export const useEnhancedChartData = () => {
  const [timeRange] = useAtom(timeRangeAtom)
  const [cashFlowMode] = useAtom(cashFlowModeAtom)
  const [cashFlowData, setCashFlowData] = useAtom(cashFlowDataAtom)
  const [profitData, setProfitData] = useAtom(profitDataAtom)
  const [expensesData, setExpensesData] = useAtom(expensesDataAtom)
  const [revenueData, setRevenueData] = useAtom(revenueDataAtom)
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom)
  
  // Track if data has been initialized
  const [isInitialized, setIsInitialized] = useState(false)

  // ==========================================
  // DATA FETCHING WITH CACHING
  // ==========================================

  const fetchCashFlowData = useCallback(async (forceRefresh = false): Promise<CashFlowDataPoint[]> => {
    try {
      // Try to load from cache first (unless force refresh)
      if (!forceRefresh && DataPersistenceManager.isCacheValid()) {
        const cached = await DataPersistenceManager.loadCashFlowData()
        if (cached.data && cached.timeRange === timeRange) {
              // console.log('📦 Loading cash flow data from cache')
          return cached.data
        }
      }

      // console.log('🌐 Fetching cash flow data from API')

      // Fetch from mock API
      const response = await MockApiService.getCashFlowData(timeRange)
      
      if (response.success) {
        // Validate the data
        const validatedData = CashFlowDataPointSchema.array().parse(response.data)
        
        // console.log('✅ Cash flow data fetched', { timeRange, points: validatedData.length })

        // Save to cache
        await DataPersistenceManager.saveCashFlowData(validatedData, timeRange)
        
        return validatedData
      } else {
        throw new Error('API request failed')
      }
    } catch (error) {
      console.error('Error fetching cash flow data:', error)
      
      // Fallback to cached data if available
      const cached = await DataPersistenceManager.loadCashFlowData()
      if (cached.data) {
        console.log('⚠️ Using cached cash flow data as fallback')
        return cached.data
      }
      
      throw error
    }
  }, [timeRange])

  const fetchChartData = useCallback(async (
    chartType: 'profit' | 'expenses' | 'revenue',
    forceRefresh = false
  ): Promise<ChartDataPoint[]> => {
    try {
      // Try to load from cache first (unless force refresh)
      if (!forceRefresh && DataPersistenceManager.isCacheValid()) {
        const cached = await DataPersistenceManager.loadChartData(chartType)
        if (cached.data && cached.timeRange === timeRange) {
          console.log(`📦 Loading ${chartType} data from cache`)
          return cached.data
        }
      }

      console.log(`🌐 Fetching ${chartType} data from API`)

      // Fetch from mock API
      const response = await MockApiService.getChartData({
        timeRange,
        chartType
      })
      
      if (response.success) {
        // Validate the data
        const validatedData = ChartDataPointSchema.array().parse(response.data)
        
        console.log(`✅ ${chartType} data fetched`, {
          timeRange,
          points: validatedData.length,
        })

        // Save to cache
        await DataPersistenceManager.saveChartData(chartType, validatedData, timeRange)
        
        return validatedData
      } else {
        throw new Error('API request failed')
      }
    } catch (error) {
      console.error(`Error fetching ${chartType} data:`, error)
      
      // Fallback to cached data if available
      const cached = await DataPersistenceManager.loadChartData(chartType)
      if (cached.data) {
        console.log(`⚠️ Using cached ${chartType} data as fallback`)
        return cached.data
      }
      
      throw error
    }
  }, [timeRange])

  // ==========================================
  // REFRESH DATA
  // ==========================================

  const refreshData = useCallback(async (): Promise<void> => {
    try {
      console.log('🔄 Refreshing all chart data')
      setIsLoading(true)
      
      // Fetch all data in parallel for better performance
      const [cashFlow, profit, expenses, revenue] = await Promise.all([
        fetchCashFlowData(true),
        fetchChartData('profit', true),
        fetchChartData('expenses', true),
        fetchChartData('revenue', true)
      ])

      // Update atoms with validated data
      setCashFlowData(cashFlow)
      setProfitData(profit)
      setExpensesData(expenses)
      setRevenueData(revenue)
      
      console.log('📊 Data refreshed successfully:', {
        cashFlow: cashFlow.length,
        profit: profit.length,
        expenses: expenses.length,
        revenue: revenue.length,
        timeRange
      })
    } catch (error) {
      console.error('Error refreshing data:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [fetchCashFlowData, fetchChartData, setCashFlowData, setProfitData, setExpensesData, setRevenueData, setIsLoading, timeRange])

  // ==========================================
  // CLEAR CACHE
  // ==========================================

  const clearCache = useCallback((): { success: boolean; error?: string } => {
    console.log('🗑️ Clearing data cache')
    return DataPersistenceManager.clearCache()
  }, [])

  // ==========================================
  // INITIAL DATA LOADING - SIMPLE VERSION
  // ==========================================

  // Load data ONLY once when component mounts and data is not initialized
  useEffect(() => {
    if (!isInitialized && !isLoading) {
      // console.log('🚀 Initial data loading...')
      setIsLoading(true)
      
      // Load data directly without complex callbacks
      Promise.all([
        fetchCashFlowData(false),
        fetchChartData('profit', false),
        fetchChartData('expenses', false),
        fetchChartData('revenue', false)
      ]).then(([cashFlow, profit, expenses, revenue]) => {
        setCashFlowData(cashFlow)
        setProfitData(profit)
        setExpensesData(expenses)
        setRevenueData(revenue)
        setIsInitialized(true)
        
        // console.log('📊 Initial data loaded successfully:', { cashFlow: cashFlow.length, profit: profit.length, expenses: expenses.length, revenue: revenue.length, timeRange })
      }).catch(error => {
        console.error('Error loading initial data:', error)
      }).finally(() => {
        setIsLoading(false)
      })
    }
  }, [isInitialized, isLoading, fetchCashFlowData, fetchChartData, timeRange, cashFlowMode]) // Include all dependencies

  // Watch for time range changes and reload data (but only if already initialized)
  useEffect(() => {
    if (isInitialized) {
      console.log('🔄 Time range or cash flow mode changed, reloading data...')
      refreshData()
    }
  }, [timeRange, cashFlowMode, isInitialized, refreshData]) // Include all dependencies

  // ==========================================
  // RETURN HOOK INTERFACE
  // ==========================================

  return {
    // Data
    cashFlowData,
    profitData,
    expensesData,
    revenueData,
    isLoading,
    
    // Actions
    refreshData,
    clearCache,
    
    // Individual fetchers (for advanced usage)
    fetchCashFlowData,
    fetchChartData
  }
}