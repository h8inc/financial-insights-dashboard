'use client'

import { createContext, useContext } from 'react'
import { useEnhancedChartData } from '@/hooks/useEnhancedChartData'

interface DataProviderProps {
  children: React.ReactNode
}

interface DataContextType {
  refreshData: () => Promise<void>
  isLoading: boolean
  clearCache: () => { success: boolean; error?: string }
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
  // This is the ONLY place where useEnhancedChartData should be called
  // It handles ALL data loading for the entire app
  const { refreshData, clearCache, isLoading } = useEnhancedChartData()

  return (
    <DataContext.Provider value={{ 
      refreshData, 
      isLoading, 
      clearCache 
    }}>
      {children}
    </DataContext.Provider>
  )
}
