import { useAtom } from 'jotai'
import { useEffect, useCallback } from 'react'
import { 
  viewModeAtom, 
  deviceTypeAtom, 
  activeViewAtom, 
  shouldShowFrameAtom,
  screenDimensionsAtom,
  subscriptionModeAtom,
  userTypeAtom,
  activeSubscriptionAtom,
  contentPermissionsAtom,
  componentContextAtom,
  type ViewMode,
  type SubscriptionTier
} from '@/lib/atoms'

// Breakpoint constants matching Tailwind
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280
} as const

export function useResponsiveView() {
  const [viewMode, setViewMode] = useAtom(viewModeAtom)
  const [deviceType, setDeviceType] = useAtom(deviceTypeAtom)
  const [screenDimensions, setScreenDimensions] = useAtom(screenDimensionsAtom)
  const [activeView] = useAtom(activeViewAtom)
  const [shouldShowFrame] = useAtom(shouldShowFrameAtom)

  // Subscription tier atoms
  const [subscriptionMode, setSubscriptionMode] = useAtom(subscriptionModeAtom)
  const [userType, setUserType] = useAtom(userTypeAtom)
  const [activeSubscription] = useAtom(activeSubscriptionAtom)
  const [permissions] = useAtom(contentPermissionsAtom)
  const [componentContext] = useAtom(componentContextAtom)

  // Enhanced device detection with user agent consideration
  const detectDevice = useCallback(() => {
    if (typeof window === 'undefined') return
    
    const width = window.innerWidth
    const userAgent = navigator.userAgent.toLowerCase()
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
    
    // Update screen dimensions
    setScreenDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    })
    
    // Detect device type
    if (width < BREAKPOINTS.md || isMobileDevice) {
      setDeviceType('mobile')
    } else if (width < BREAKPOINTS.lg) {
      setDeviceType('tablet')
    } else {
      setDeviceType('desktop')
    }
  }, [setDeviceType, setScreenDimensions])

  // Device detection on mount and resize
  useEffect(() => {
    detectDevice()
    
    const handleResize = () => detectDevice()
    window.addEventListener('resize', handleResize)
    
    return () => window.removeEventListener('resize', handleResize)
  }, [detectDevice])

  // Enhanced view mode toggling
  const toggleViewMode = useCallback(() => {
    if (deviceType === 'mobile') return // No toggling on actual mobile
    
    setViewMode(prev => {
      switch (prev) {
        case 'auto': return 'mobile'
        case 'mobile': return 'desktop'
        case 'desktop': return 'auto'
        default: return 'auto'
      }
    })
  }, [deviceType, setViewMode])

  // Cycle through all view modes
  const cycleViewMode = useCallback(() => {
    if (deviceType === 'mobile') return
    
    setViewMode(prev => {
      const modes: ViewMode[] = ['auto', 'desktop', 'mobile']
      const currentIndex = modes.indexOf(prev)
      return modes[(currentIndex + 1) % modes.length]
    })
  }, [deviceType, setViewMode])

  // Set specific view mode
  const setSpecificViewMode = useCallback((mode: ViewMode) => {
    if (deviceType === 'mobile' && mode !== 'mobile') return
    setViewMode(mode)
  }, [deviceType, setViewMode])

  // Subscription mode toggling functions
  const toggleSubscriptionMode = useCallback(() => {
    setSubscriptionMode(prev => {
      switch (prev) {
        case 'auto': return 'freemium'
        case 'freemium': return 'paid'
        case 'paid': return 'auto'
        default: return 'auto'
      }
    })
  }, [setSubscriptionMode])

  // Cycle through all subscription modes
  const cycleSubscriptionMode = useCallback(() => {
    setSubscriptionMode(prev => {
      const modes: SubscriptionTier[] = ['auto', 'freemium', 'paid']
      const currentIndex = modes.indexOf(prev)
      return modes[(currentIndex + 1) % modes.length]
    })
  }, [setSubscriptionMode])

  // Set specific subscription mode
  const setSpecificSubscriptionMode = useCallback((mode: SubscriptionTier) => {
    setSubscriptionMode(mode)
  }, [setSubscriptionMode])

  // Computed properties - allow toggling unless on actual mobile device
  const canToggleView = deviceType !== 'mobile'
  const isMobileView = activeView === 'mobile'
  const isDesktopView = activeView === 'desktop'
  const isAutoMode = viewMode === 'auto'

  // Subscription computed properties
  const isPaidUser = activeSubscription === 'paid'
  const isFreemiumUser = activeSubscription === 'freemium'
  const isAutoSubscriptionMode = subscriptionMode === 'auto'
  const canToggleSubscription = true // Always allow in demo mode

  return {
    // Device State
    viewMode,
    deviceType,
    activeView,
    screenDimensions,
    shouldShowFrame,
    
    // Subscription State
    subscriptionMode,
    userType,
    activeSubscription,
    permissions,
    componentContext,
    
    // Device Computed
    isMobileView,
    isDesktopView,
    isAutoMode,
    canToggleView,
    
    // Subscription Computed
    isPaidUser,
    isFreemiumUser,
    isAutoSubscriptionMode,
    canToggleSubscription,
    
    // Device Actions
    toggleViewMode,
    cycleViewMode,
    setSpecificViewMode,
    
    // Subscription Actions
    toggleSubscriptionMode,
    cycleSubscriptionMode,
    setSpecificSubscriptionMode,
    
    // Combined Helpers
    getComponentVariant: () => componentContext.variant,
    
    // Utils
    breakpoints: BREAKPOINTS
  }
}
