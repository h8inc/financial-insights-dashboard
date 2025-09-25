'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Crown, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MobileSubscriptionSheet } from '@/components/MobileSubscriptionSheet'
import { useResponsiveView } from '@/hooks/useResponsiveView'

interface MobileHeaderProps {
  title: string
  description?: string
  backHref?: string
  showSubscriptionControl?: boolean
}

export function MobileHeader({ 
  title, 
  description, 
  backHref = '/dashboard',
  showSubscriptionControl = true 
}: MobileHeaderProps) {
  const { activeSubscription, deviceType } = useResponsiveView()

  // Only render on mobile
  if (deviceType !== 'mobile') {
    return null
  }

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="p-4">
        {/* Top row with back button and subscription control */}
        <div className="flex items-center justify-between mb-3">
          <Link href={backHref}>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span className="text-sm">Back</span>
            </Button>
          </Link>
          
          {showSubscriptionControl && (
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
        
        {/* Title and description */}
        <div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">{title}</h1>
          {description && (
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{description}</p>
          )}
        </div>
      </div>
    </div>
  )
}
