import { 
  ChartDataPointSchema, 
  CashFlowDataPointSchema,
  ChartDataResponseSchema,
  CashFlowResponseSchema,
  type ChartDataPoint,
  type CashFlowDataPoint,
  type ChartDataResponse,
  type CashFlowResponse,
  type TimeRange
} from '@/lib/schemas'

// ==========================================
// DATA PERSISTENCE MANAGER
// ==========================================

export class DataPersistenceManager {
  private static readonly STORAGE_KEYS = {
    CASH_FLOW_DATA: 'dashboard-cash-flow-data',
    PROFIT_DATA: 'dashboard-profit-data',
    EXPENSES_DATA: 'dashboard-expenses-data',
    REVENUE_DATA: 'dashboard-revenue-data',
    USER_PREFERENCES: 'dashboard-user-preferences',
    CACHE_TIMESTAMP: 'dashboard-cache-timestamp'
  }

  private static readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  // ==========================================
  // STORAGE UTILITIES
  // ==========================================

  private static isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  private static getStorage(): Storage | null {
    return this.isStorageAvailable() ? localStorage : null
  }

  private static getSessionStorage(): Storage | null {
    try {
      const test = '__session_test__'
      sessionStorage.setItem(test, test)
      sessionStorage.removeItem(test)
      return sessionStorage
    } catch {
      return null
    }
  }

  // ==========================================
  // DATA SAVING METHODS
  // ==========================================

  static async saveCashFlowData(data: CashFlowDataPoint[], timeRange: TimeRange): Promise<{ success: boolean; error?: string }> {
    try {
      const storage = this.getStorage()
      if (!storage) {
        return { success: false, error: 'LocalStorage not available' }
      }

      const response: CashFlowResponse = {
        success: true,
        data,
        metadata: {
          timeRange,
          dataPoints: data.length,
          generatedAt: new Date().toISOString()
        }
      }

      // Validate data before saving
      const validatedResponse = CashFlowResponseSchema.parse(response)
      
      storage.setItem(this.STORAGE_KEYS.CASH_FLOW_DATA, JSON.stringify(validatedResponse))
      storage.setItem(this.STORAGE_KEYS.CACHE_TIMESTAMP, Date.now().toString())
      
      return { success: true }
    } catch (error) {
      console.error('Error saving cash flow data:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  static async saveChartData(
    chartType: 'profit' | 'expenses' | 'revenue',
    data: ChartDataPoint[],
    timeRange: TimeRange
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const storage = this.getStorage()
      if (!storage) {
        return { success: false, error: 'LocalStorage not available' }
      }

      const response: ChartDataResponse = {
        success: true,
        data,
        metadata: {
          timeRange,
          dataPoints: data.length,
          generatedAt: new Date().toISOString()
        }
      }

      // Validate data before saving
      const validatedResponse = ChartDataResponseSchema.parse(response)
      
      const key = this.STORAGE_KEYS[chartType.toUpperCase() as keyof typeof this.STORAGE_KEYS]
      storage.setItem(key, JSON.stringify(validatedResponse))
      storage.setItem(this.STORAGE_KEYS.CACHE_TIMESTAMP, Date.now().toString())
      
      return { success: true }
    } catch (error) {
      console.error(`Error saving ${chartType} data:`, error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // ==========================================
  // DATA LOADING METHODS
  // ==========================================

  static async loadCashFlowData(): Promise<{ data: CashFlowDataPoint[] | null; timeRange: TimeRange | null; error?: string }> {
    try {
      const storage = this.getStorage()
      if (!storage) {
        return { data: null, timeRange: null, error: 'LocalStorage not available' }
      }

      const cachedData = storage.getItem(this.STORAGE_KEYS.CASH_FLOW_DATA)
      if (!cachedData) {
        return { data: null, timeRange: null }
      }

      // Check if cache is still valid
      const timestamp = storage.getItem(this.STORAGE_KEYS.CACHE_TIMESTAMP)
      if (timestamp && Date.now() - parseInt(timestamp) > this.CACHE_DURATION) {
        return { data: null, timeRange: null, error: 'Cache expired' }
      }

      const parsedData = JSON.parse(cachedData)
      const validatedResponse = CashFlowResponseSchema.parse(parsedData)
      
      return {
        data: validatedResponse.data,
        timeRange: validatedResponse.metadata.timeRange
      }
    } catch (error) {
      console.error('Error loading cash flow data:', error)
      return { 
        data: null, 
        timeRange: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  static async loadChartData(chartType: 'profit' | 'expenses' | 'revenue'): Promise<{ data: ChartDataPoint[] | null; timeRange: TimeRange | null; error?: string }> {
    try {
      const storage = this.getStorage()
      if (!storage) {
        return { data: null, timeRange: null, error: 'LocalStorage not available' }
      }

      const key = this.STORAGE_KEYS[chartType.toUpperCase() as keyof typeof this.STORAGE_KEYS]
      const cachedData = storage.getItem(key)
      if (!cachedData) {
        return { data: null, timeRange: null }
      }

      // Check if cache is still valid
      const timestamp = storage.getItem(this.STORAGE_KEYS.CACHE_TIMESTAMP)
      if (timestamp && Date.now() - parseInt(timestamp) > this.CACHE_DURATION) {
        return { data: null, timeRange: null, error: 'Cache expired' }
      }

      const parsedData = JSON.parse(cachedData)
      const validatedResponse = ChartDataResponseSchema.parse(parsedData)
      
      return {
        data: validatedResponse.data,
        timeRange: validatedResponse.metadata.timeRange
      }
    } catch (error) {
      console.error(`Error loading ${chartType} data:`, error)
      return { 
        data: null, 
        timeRange: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // ==========================================
  // CACHE MANAGEMENT
  // ==========================================

  static clearCache(): { success: boolean; error?: string } {
    try {
      const storage = this.getStorage()
      if (!storage) {
        return { success: false, error: 'LocalStorage not available' }
      }

      // Clear all cached data
      Object.values(this.STORAGE_KEYS).forEach(key => {
        storage.removeItem(key)
      })
      
      return { success: true }
    } catch (error) {
      console.error('Error clearing cache:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  static isCacheValid(): boolean {
    try {
      const storage = this.getStorage()
      if (!storage) {
        return false
      }

      const timestamp = storage.getItem(this.STORAGE_KEYS.CACHE_TIMESTAMP)
      if (!timestamp) {
        return false
      }

      return Date.now() - parseInt(timestamp) < this.CACHE_DURATION
    } catch {
      return false
    }
  }

  // ==========================================
  // USER PREFERENCES
  // ==========================================

  static saveUserPreferences(preferences: {
    timeRange: TimeRange
    theme?: 'light' | 'dark'
    notifications?: boolean
  }): { success: boolean; error?: string } {
    try {
      const storage = this.getStorage()
      if (!storage) {
        return { success: false, error: 'LocalStorage not available' }
      }

      storage.setItem(this.STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences))
      return { success: true }
    } catch (error) {
      console.error('Error saving user preferences:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  static loadUserPreferences(): { preferences: Record<string, unknown> | null; error?: string } {
    try {
      const storage = this.getStorage()
      if (!storage) {
        return { preferences: null, error: 'LocalStorage not available' }
      }

      const preferences = storage.getItem(this.STORAGE_KEYS.USER_PREFERENCES)
      if (!preferences) {
        return { preferences: null }
      }

      return { preferences: JSON.parse(preferences) }
    } catch (error) {
      console.error('Error loading user preferences:', error)
      return { 
        preferences: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
}
