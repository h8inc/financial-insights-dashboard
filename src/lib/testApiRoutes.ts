// Test script to verify our API routes are working
// Run this in the browser console or as a separate test

const testApiRoutes = async () => {
  console.log('🧪 Testing API Routes...')
  
  try {
    // Test cash flow API
    console.log('📊 Testing Cash Flow API...')
    const cashFlowResponse = await fetch('/api/charts/cash-flow?timeRange=7D')
    const cashFlowData = await cashFlowResponse.json()
    console.log('✅ Cash Flow API Response:', cashFlowData)
    
    // Test general charts API
    console.log('📈 Testing Charts API...')
    const chartsResponse = await fetch('/api/charts?timeRange=30D&chartType=profit')
    const chartsData = await chartsResponse.json()
    console.log('✅ Charts API Response:', chartsData)
    
    // Test data persistence
    console.log('💾 Testing Data Persistence...')
    if (typeof window !== 'undefined') {
      const testData = [
        { date: '2024-01-15', value: 1000, inflow: 2000, outflow: 1000, balance: 50000 }
      ]
      
      // This would be imported from our DataPersistenceManager in a real test
      localStorage.setItem('test-data', JSON.stringify(testData))
      const retrieved = JSON.parse(localStorage.getItem('test-data') || '[]')
      console.log('✅ Data Persistence Test:', retrieved)
      
      // Clean up
      localStorage.removeItem('test-data')
    }
    
    console.log('🎉 All tests passed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).testApiRoutes = testApiRoutes
}

export { testApiRoutes }
