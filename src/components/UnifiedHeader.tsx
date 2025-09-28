'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Crown, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ViewSwitcher } from '@/components/ViewSwitcher'
import { MobileSubscriptionSheet } from '@/components/MobileSubscriptionSheet'
import { useResponsiveView } from '@/hooks/useResponsiveView'

interface UnifiedHeaderProps {
  title: string
  description?: string
  backHref?: string
  showBackButton?: boolean
}

export function UnifiedHeader({ 
  title, 
  description, 
  backHref = '/dashboard',
  showBackButton = true 
}: UnifiedHeaderProps) {
  const { activeSubscription, isMobileView, deviceType } = useResponsiveView()
  
  // Show Pro controls in mobile header ONLY on actual mobile devices
  const showMobileProControls = deviceType === 'mobile'

  return (
    <header className="w-full bg-white border-b border-gray-200 py-4">
      <div className="container mx-auto px-4">
        {isMobileView ? (
          /* Mobile Layout */
          <div className="flex items-center justify-between">
            {/* Left: Back button with title */}
            <div className="flex items-center gap-3">
              {showBackButton && (
                <Link href={backHref}>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
              )}
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            </div>
            
            {/* Right: Pro switcher - Only show on actual mobile devices */}
            {showMobileProControls && (
              <MobileSubscriptionSheet>
                <div className="flex items-center gap-2">
                  {activeSubscription === 'paid' ? (
                    <Crown className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <Lock className="h-4 w-4 text-gray-500" />
                  )}
                  <Badge 
                    variant={activeSubscription === 'paid' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {activeSubscription === 'paid' ? 'Pro' : 'Free'}
                  </Badge>
                </div>
              </MobileSubscriptionSheet>
            )}
          </div>
        ) : (
          /* Desktop Layout */
          <div className="flex items-center justify-between">
            {/* Left: Back button and title */}
            <div className="flex items-center gap-4">
              {showBackButton && (
                <Link href={backHref}>
                  <Button variant="outline" size="sm" className="h-8 px-3">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {description && (
                  <p className="text-sm text-gray-600 mt-1">{description}</p>
                )}
              </div>
            </div>
            
            {/* Right: No controls here - handled by DesktopControlBar */}
          </div>
        )}
      </div>
    </header>
  )
}
