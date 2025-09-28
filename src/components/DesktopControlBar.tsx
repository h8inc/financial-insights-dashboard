'use client'

import React from 'react'
import { ViewSwitcher } from '@/components/ViewSwitcher'
import { useResponsiveView } from '@/hooks/useResponsiveView'

export function DesktopControlBar() {
  const { deviceType } = useResponsiveView()
  
  // Only render on desktop devices
  if (deviceType !== 'desktop') return null
  
  return (
    <div className="sticky top-0 z-50 bg-gray-50 border-b border-gray-200 py-1.5">
      <div className="container mx-auto px-4">
        <div className="flex justify-end items-center">
          <ViewSwitcher variant="dropdown" />
        </div>
      </div>
    </div>
  )
}
