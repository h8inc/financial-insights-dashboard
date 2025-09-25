'use client'

import { useEffect, useState, createContext, useContext } from 'react'
import { useChartData } from '@/hooks/useChartData'
import { useDeltaComparison } from '@/hooks/useDeltaComparison'
import { useAtom } from 'jotai'
import { isLoadingAtom } from '@/lib/atoms'

interface DataProviderProps {
  children: React.ReactNode
}

interface DataContextType {
  refreshData: () => Promise<void>
  isLoading: boolean
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export const useDataContext = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider')
  }
  return context
}

export const DataProvider = ({ children }: DataProviderProps) => {
  const { loadChartData } = useChartData()
  const { updateDeltasFromPeriodData } = useDeltaComparison()
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom)
  const [isInitialized, setIsInitialized] = useState(false)

  const refreshData = async () => {
    setIsLoading(true)
    try {
      // Load chart data and get period data for delta calculation
      const periodData = await loadChartData()
      
      // Update deltas based on the loaded data
      updateDeltasFromPeriodData(periodData)
      
      setIsInitialized(true)
    } catch (error) {
      console.error('Failed to refresh data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isInitialized) {
      refreshData()
    }
  }, [isInitialized, refreshData])

  return (
    <DataContext.Provider value={{ refreshData, isLoading }}>
      {children}
    </DataContext.Provider>
  )
}
