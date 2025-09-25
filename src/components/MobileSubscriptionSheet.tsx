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
import { Crown, Lock, Settings2, Eye, EyeOff } from 'lucide-react'
import { useResponsiveView } from '@/hooks/useResponsiveView'

interface MobileSubscriptionSheetProps {
  children: React.ReactNode
}

export function MobileSubscriptionSheet({ children }: MobileSubscriptionSheetProps) {
  const { 
    activeSubscription,
    permissions,
    setSpecificSubscriptionMode,
    deviceType
  } = useResponsiveView()

  // Only show on mobile
  if (deviceType !== 'mobile') {
    return <>{children}</>
  }

  return (
    <Sheet>
      <div className="flex items-center">
        {children}
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 h-8 w-8 p-0"
            title="Subscription settings"
          >
            <Settings2 className="h-4 w-4" />
          </Button>
        </SheetTrigger>
      </div>
      
      <SheetContent side="bottom" className="h-[400px]">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Subscription Plan
          </SheetTitle>
          <SheetDescription>
            Switch between Free and Pro to see feature differences
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Plan Switcher */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-center">Switch Plan:</div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={activeSubscription === 'freemium' ? 'default' : 'outline'}
                size="lg"
                onClick={() => setSpecificSubscriptionMode('freemium')}
                className="h-12 flex flex-col items-center gap-1"
              >
                <Lock className="h-4 w-4" />
                <span className="text-xs">Free</span>
              </Button>
              <Button
                variant={activeSubscription === 'paid' ? 'default' : 'outline'}
                size="lg"
                onClick={() => setSpecificSubscriptionMode('paid')}
                className="h-12 flex flex-col items-center gap-1"
              >
                <Crown className="h-4 w-4" />
                <span className="text-xs">Pro</span>
              </Button>
            </div>
          </div>

          {/* Quick Feature Comparison */}
          <div className="space-y-2">
            <div className="text-sm font-medium">What you get:</div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-background rounded border">
                <span>Full Charts</span>
                {permissions.canViewFullCharts ? (
                  <Badge variant="default" className="text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    Unlimited
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    <EyeOff className="h-3 w-3 mr-1" />
                    Limited
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between p-2 bg-background rounded border">
                <span>Transaction Details</span>
                {permissions.canViewTransactionBreakdown ? (
                  <Badge variant="default" className="text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    Full
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    <Lock className="h-3 w-3 mr-1" />
                    Pro Only
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between p-2 bg-background rounded border">
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
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
