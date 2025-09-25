'use client'

import React from 'react'
import { 
  Smartphone, 
  Monitor, 
  Tablet, 
  RotateCcw, 
  Eye,
  Maximize2,
  Crown,
  Lock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useResponsiveView } from '@/hooks/useResponsiveView'
import { SubscriptionInfoSheet } from '@/components/SubscriptionInfoSheet'
import { cn } from '@/lib/utils'

interface ViewSwitcherProps {
  variant?: 'default' | 'compact' | 'dropdown'
  showDeviceInfo?: boolean
  showSubscriptionInfo?: boolean
  className?: string
}

export function ViewSwitcher({ 
  variant = 'default',
  showDeviceInfo = true,
  showSubscriptionInfo = true,
  className 
}: ViewSwitcherProps) {
  const { 
    // Device properties
    viewMode,
    deviceType, 
    activeView, 
    shouldShowFrame,
    toggleViewMode,
    setSpecificViewMode,
    
    // Subscription properties
    activeSubscription,
    setSpecificSubscriptionMode
  } = useResponsiveView()

  // Only hide on actual mobile devices, not when desktop users choose mobile view
  if (deviceType === 'mobile') return null

  const getViewIcon = (view: string) => {
    switch (view) {
      case 'mobile': return <Smartphone className="h-4 w-4" />
      case 'desktop': return <Monitor className="h-4 w-4" />
      case 'tablet': return <Tablet className="h-4 w-4" />
      default: return <Eye className="h-4 w-4" />
    }
  }

  const getViewLabel = () => {
    if (viewMode === 'auto') return `Auto (${activeView})`
    return activeView === 'mobile' ? 'Mobile View' : 'Desktop View'
  }


  // Compact variant for headers
  if (variant === 'compact') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleViewMode}
        className={cn("flex items-center gap-1.5", className)}
        title={`Current: ${getViewLabel()} - Click to toggle`}
      >
        {getViewIcon(activeView)}
        <span className="text-xs font-medium">{activeView}</span>
        {shouldShowFrame && (
          <Badge variant="secondary" className="text-xs px-1 py-0">
            Framed
          </Badge>
        )}
      </Button>
    )
  }

  // Enhanced dropdown variant with completely separate dual toggles
  if (variant === 'dropdown') {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        {/* Device Switcher - Separate Toggle */}
        <div className="flex items-center bg-muted rounded-lg p-1">
          <Button
            variant={activeView === 'desktop' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSpecificViewMode('desktop')}
            className="h-8 px-3 text-xs font-medium"
            title="Desktop view"
          >
            <Monitor className="h-3.5 w-3.5 mr-1.5" />
            Desktop
          </Button>
          <Button
            variant={activeView === 'mobile' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSpecificViewMode('mobile')}
            className="h-8 px-3 text-xs font-medium"
            title="Mobile view"
          >
            <Smartphone className="h-3.5 w-3.5 mr-1.5" />
            Mobile
          </Button>
        </div>

        {/* Subscription Switcher - Completely Separate Toggle with Info Sheet */}
        {showSubscriptionInfo && (
          <SubscriptionInfoSheet>
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button
                variant={activeSubscription === 'freemium' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSpecificSubscriptionMode('freemium')}
                className="h-8 px-3 text-xs font-medium"
                title="Freemium plan"
              >
                <Lock className="h-3.5 w-3.5 mr-1.5" />
                Free
              </Button>
              <Button
                variant={activeSubscription === 'paid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSpecificSubscriptionMode('paid')}
                className="h-8 px-3 text-xs font-medium"
                title="Paid plan"
              >
                <Crown className="h-3.5 w-3.5 mr-1.5" />
                Pro
              </Button>
            </div>
          </SubscriptionInfoSheet>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {showDeviceInfo && (
        <Badge variant="outline" className="text-xs font-normal">
          <Tablet className="mr-1 h-3 w-3" />
          {deviceType}
        </Badge>
      )}
      
      <div className="flex items-center gap-1">
        <Button
          variant={viewMode === 'auto' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSpecificViewMode('auto')}
          className="px-2"
          title="Auto-detect view"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
        
        <Button
          variant={viewMode === 'desktop' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSpecificViewMode('desktop')}
          className="px-2"
          title="Desktop view"
        >
          <Monitor className="h-3.5 w-3.5" />
        </Button>
        
        <Button
          variant={viewMode === 'mobile' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSpecificViewMode('mobile')}
          className="px-2"
          title="Mobile view"
        >
          <Smartphone className="h-3.5 w-3.5" />
        </Button>
      </div>

      {shouldShowFrame && (
        <Badge variant="secondary" className="text-xs">
          <Maximize2 className="mr-1 h-3 w-3" />
          Framed
        </Badge>
      )}
    </div>
  )
}
