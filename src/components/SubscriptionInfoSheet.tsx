'use client'

import React from 'react'
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Info, Crown, Lock, Eye, EyeOff, Smartphone, Monitor } from 'lucide-react'
import { useResponsiveView } from '@/hooks/useResponsiveView'

interface SubscriptionInfoSheetProps {
  children: React.ReactNode
}

export function SubscriptionInfoSheet({ children }: SubscriptionInfoSheetProps) {
  const { 
    activeView, 
    activeSubscription, 
    permissions, 
    componentContext,
    deviceType 
  } = useResponsiveView()

  // Only show on desktop
  if (deviceType === 'mobile') {
    return <>{children}</>
  }

  return (
    <Sheet>
      <div className="flex items-center gap-2">
        {children}
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            title="View subscription info"
          >
            <Info className="h-3.5 w-3.5" />
          </Button>
        </SheetTrigger>
      </div>
      
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Dual-Axis System Info
          </SheetTitle>
          <SheetDescription>
            Understanding how device view and subscription tiers work together
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Current State Display */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              {activeView === 'mobile' ? (
                <Smartphone className="h-4 w-4" />
              ) : (
                <Monitor className="h-4 w-4" />
              )}
              <span className="font-medium">View: {activeView}</span>
              <Badge variant="outline">{deviceType}</Badge>
            </div>
            
            <div className="flex items-center gap-2">
              {activeSubscription === 'paid' ? (
                <Crown className="h-4 w-4 text-yellow-500" />
              ) : (
                <Lock className="h-4 w-4 text-gray-500" />
              )}
              <span className="font-medium">Plan: {activeSubscription}</span>
              <Badge variant={activeSubscription === 'paid' ? 'default' : 'secondary'}>
                {activeSubscription === 'paid' ? 'Pro' : 'Free'}
              </Badge>
            </div>
          </div>

          {/* Component Variant */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm font-medium mb-1">Component Variant:</div>
            <code className="text-sm">{componentContext.variant}</code>
          </div>

          {/* Feature Comparison */}
          <div className="space-y-3">
            <h3 className="font-medium">Feature Access:</h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center justify-between p-3 bg-background rounded border">
                <span>Full Charts</span>
                {permissions.canViewFullCharts ? (
                  <Badge variant="default" className="text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    Unlimited
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    <EyeOff className="h-3 w-3 mr-1" />
                    Limited to {permissions.maxChartDataPoints}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between p-3 bg-background rounded border">
                <span>Transaction Breakdown</span>
                {permissions.canViewTransactionBreakdown ? (
                  <Badge variant="default" className="text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    Full Access
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    <Lock className="h-3 w-3 mr-1" />
                    Pro Only
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between p-3 bg-background rounded border">
                <span>Advanced Filters</span>
                {permissions.canViewAdvancedFilters ? (
                  <Badge variant="default" className="text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    Enabled
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    <Lock className="h-3 w-3 mr-1" />
                    Pro Only
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between p-3 bg-background rounded border">
                <span>Delta Comparisons</span>
                {permissions.canViewDeltaComparisons ? (
                  <Badge variant="default" className="text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    Enabled
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    <Lock className="h-3 w-3 mr-1" />
                    Pro Only
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Data Limits */}
          <div className="space-y-3">
            <h3 className="font-medium">Data Limits:</h3>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Chart Data Points:</span>
                  <span className="font-mono text-sm">
                    {permissions.maxChartDataPoints === Infinity ? '∞' : permissions.maxChartDataPoints}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Transaction History:</span>
                  <span className="font-mono text-sm">
                    {permissions.maxTransactionHistory === Infinity ? '∞' : permissions.maxTransactionHistory}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interaction Context */}
          <div className="space-y-3">
            <h3 className="font-medium">Interaction Context:</h3>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm space-y-1">
                {componentContext.isMobile ? (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Smartphone className="h-4 w-4" />
                    Mobile interactions: Touch, hold, drag
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-600">
                    <Monitor className="h-4 w-4" />
                    Desktop interactions: Hover, click, tooltips
                  </div>
                )}
                {componentContext.shouldShowFrame && (
                  <div className="flex items-center gap-2 text-purple-600">
                    <Smartphone className="h-4 w-4" />
                    iPhone frame simulation active
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* How to Use */}
          <div className="space-y-3">
            <h3 className="font-medium">How to Use:</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• <strong>Device Toggle:</strong> Switch between mobile and desktop views to test responsive layouts</p>
              <p>• <strong>Subscription Toggle:</strong> Switch between Free and Pro plans to see feature differences</p>
              <p>• <strong>Combined Testing:</strong> Test all 4 combinations (Mobile-Free, Mobile-Pro, Desktop-Free, Desktop-Pro)</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
