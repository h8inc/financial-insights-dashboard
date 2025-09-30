import { useAtom } from 'jotai'
import { useEffect, useCallback, useRef } from 'react'
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

// Dev tools detection constants
const DEV_TOOLS_THRESHOLD = 50 // Minimum width difference to detect dev tools (reduced for better detection)
const RESIZE_DEBOUNCE_MS = 150 // Debounce resize events

export function useResponsiveView() {
  const [viewMode, setViewMode] = useAtom(viewModeAtom)
  const [deviceType, setDeviceType] = useAtom(deviceTypeAtom)
  const [screenDimensions, setScreenDimensions] = useAtom(screenDimensionsAtom)
  const [activeView] = useAtom(activeViewAtom)
  const [shouldShowFrame] = useAtom(shouldShowFrameAtom)

  // Subscription tier atoms
  const [subscriptionMode, setSubscriptionMode] = useAtom(subscriptionModeAtom)
  const [userType] = useAtom(userTypeAtom)
  const [activeSubscription] = useAtom(activeSubscriptionAtom)
  const [permissions] = useAtom(contentPermissionsAtom)
  const [componentContext] = useAtom(componentContextAtom)

  // Refs for debouncing and dev tools detection
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastKnownScreenWidth = useRef<number>(0)

  // Detect if dev tools are open by checking width difference
  const isDevToolsOpen = useCallback(() => {
    if (typeof window === 'undefined') return false
    
    const widthDifference = window.outerWidth - window.innerWidth
    
    // Dev tools typically reduce width significantly but not height as much
    // Also check if the width reduction is substantial compared to screen size
    const isWidthReduced = widthDifference > DEV_TOOLS_THRESHOLD
    const isSignificantReduction = widthDifference > (window.screen.width * 0.1) // More than 10% of screen width
    
    return isWidthReduced || isSignificantReduction
  }, [])

  // Enhanced device detection with dev tools guard
  const detectDevice = useCallback(() => {
    if (typeof window === 'undefined') return
    
    const width = window.innerWidth
    const devToolsOpen = isDevToolsOpen()
    
    // Debug logging (removed for production)
    
    // Update screen dimensions
    setScreenDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    })
    
    // If dev tools are open and we're on desktop, preserve desktop state
    // Also preserve if we were previously on desktop (even if current deviceType changed)
    if (devToolsOpen && (deviceType === 'desktop' || lastKnownScreenWidth.current > BREAKPOINTS.lg) && width < BREAKPOINTS.md) {
      // Don't change device type when dev tools reduce width on desktop
      return
    }
    
    // Detect device type (only if not preserving desktop state due to dev tools)
    // Prioritize width-based detection over user agent for better accuracy
    if (width < BREAKPOINTS.md) {
      setDeviceType('mobile')
    } else if (width < BREAKPOINTS.lg) {
      setDeviceType('tablet')
    } else {
      setDeviceType('desktop')
    }
    
    // Update last known width for future comparisons
    lastKnownScreenWidth.current = width
  }, [setDeviceType, setScreenDimensions, isDevToolsOpen, deviceType])

  // Debounced resize handler
  const handleResize = useCallback(() => {
    // Clear existing timeout
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current)
    }
    
    // Set new timeout for debounced detection
    resizeTimeoutRef.current = setTimeout(() => {
      detectDevice()
    }, RESIZE_DEBOUNCE_MS)
  }, [detectDevice])

  // Device detection on mount and resize with debouncing
  useEffect(() => {
    // Initial detection
    detectDevice()
    
    // Add debounced resize listener
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      // Clear timeout on cleanup
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
    }
  }, [detectDevice, handleResize])

  // Initialize lastKnownScreenWidth on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      lastKnownScreenWidth.current = window.innerWidth
    }
  }, [])

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
