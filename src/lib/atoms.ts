import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// Time range filter atoms
export const timeRangeAtom = atom<'7D' | '30D' | '3M' | 'YTD' | 'custom'>('30D')
export const customDateRangeAtom = atom<{ start: Date; end: Date } | null>(null)

// Chart data atoms
export const cashFlowDataAtom = atom<any[]>([])
export const profitDataAtom = atom<any[]>([])
export const expensesDataAtom = atom<any[]>([])
export const revenueDataAtom = atom<any[]>([])

// Delta comparison atoms
export const cashFlowDeltaAtom = atom<number>(0)
export const profitDeltaAtom = atom<number>(0)
export const expensesDeltaAtom = atom<number>(0)
export const revenueDeltaAtom = atom<number>(0)

// Chart mode atoms (for cash flow Activity/Balance modes)
export const cashFlowModeAtom = atom<'activity' | 'balance'>('activity')

// UI state atoms
export const isLoadingAtom = atom<boolean>(false)
export const selectedChartAtom = atom<string | null>(null)

// ==========================================
// ENHANCED RESPONSIVE VIEW ATOMS
// ==========================================

export type ViewMode = 'mobile' | 'desktop' | 'auto'
export type DeviceType = 'mobile' | 'tablet' | 'desktop'

// Persistent view mode preference (survives page refreshes)
export const viewModeAtom = atomWithStorage<ViewMode>('dashboard-view-mode', 'auto')

// Device detection atom
export const deviceTypeAtom = atom<DeviceType>('desktop')

// Screen dimensions atom for precise control
export const screenDimensionsAtom = atom({
  width: typeof window !== 'undefined' ? window.innerWidth : 1200,
  height: typeof window !== 'undefined' ? window.innerHeight : 800
})

// Computed atom - determines actual view to render
export const activeViewAtom = atom((get) => {
  const viewMode = get(viewModeAtom)
  const deviceType = get(deviceTypeAtom)
  
  // Force mobile view on actual mobile devices
  if (deviceType === 'mobile') return 'mobile'
  
  // Respect user preference on desktop/tablet
  if (viewMode === 'auto') {
    return deviceType === 'tablet' ? 'mobile' : 'desktop'
  }
  
  return viewMode
})

// Should show device frame atom
export const shouldShowFrameAtom = atom((get) => {
  const activeView = get(activeViewAtom)
  const deviceType = get(deviceTypeAtom)
  
  // Only show frame when desktop users are viewing mobile mode
  return deviceType === 'desktop' && activeView === 'mobile'
})

// ==========================================
// SUBSCRIPTION TIER ATOMS
// ==========================================

export type SubscriptionTier = 'freemium' | 'paid' | 'auto'
export type UserType = 'freemium' | 'paid'

// Persistent subscription simulation preference (for demo/testing)
export const subscriptionModeAtom = atomWithStorage<SubscriptionTier>('dashboard-subscription-mode', 'auto')

// Simulated user type detection (in real app, this would come from auth/API)
export const userTypeAtom = atom<UserType>('paid')

// Computed atom - determines actual subscription state to render
export const activeSubscriptionAtom = atom((get) => {
  const subscriptionMode = get(subscriptionModeAtom)
  const userType = get(userTypeAtom)
  
  // Auto mode uses detected user type
  if (subscriptionMode === 'auto') {
    return userType
  }
  
  // Override mode for demo/testing
  return subscriptionMode
})

// Content visibility permissions based on subscription
export const contentPermissionsAtom = atom((get) => {
  const subscription = get(activeSubscriptionAtom)
  
  return {
    canViewFullCharts: subscription === 'paid',
    canViewTransactionBreakdown: subscription === 'paid',
    canViewAdvancedFilters: subscription === 'paid',
    canViewDeltaComparisons: subscription === 'paid',
    canViewDetailedAnalytics: subscription === 'paid',
    maxChartDataPoints: subscription === 'paid' ? Infinity : 5,
    maxTransactionHistory: subscription === 'paid' ? Infinity : 10,
    showUpgradePrompts: subscription === 'freemium',
    showWatermarks: subscription === 'freemium'
  }
})

// ==========================================
// COMBINED RESPONSIVE + SUBSCRIPTION ATOMS
// ==========================================

// Combined state for components that need both device and subscription context
export const componentContextAtom = atom((get) => {
  const activeView = get(activeViewAtom)
  const activeSubscription = get(activeSubscriptionAtom)
  const permissions = get(contentPermissionsAtom)
  const deviceType = get(deviceTypeAtom)
  const shouldShowFrame = get(shouldShowFrameAtom)
  
  return {
    // Device context
    view: activeView,
    deviceType,
    shouldShowFrame,
    
    // Subscription context
    subscription: activeSubscription,
    permissions,
    
    // Combined flags for easy component logic
    isMobile: activeView === 'mobile',
    isDesktop: activeView === 'desktop',
    isPaid: activeSubscription === 'paid',
    isFreemium: activeSubscription === 'freemium',
    
    // Component variant helper
    variant: `${activeView}-${activeSubscription}` as const
  }
})
