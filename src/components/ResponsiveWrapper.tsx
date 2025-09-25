'use client'

import React from 'react'
import { useResponsiveView } from '@/hooks/useResponsiveView'
import { cn } from '@/lib/utils'

interface ResponsiveWrapperProps {
  children: React.ReactNode
  className?: string
  mobileClassName?: string
  desktopClassName?: string
}

/**
 * ResponsiveWrapper - Forces mobile/desktop layouts based on activeView state
 * instead of relying only on Tailwind breakpoints
 */
export function ResponsiveWrapper({ 
  children, 
  className,
  mobileClassName,
  desktopClassName 
}: ResponsiveWrapperProps) {
  const { activeView } = useResponsiveView()
  
  const isMobileView = activeView === 'mobile'
  
  return (
    <div 
      className={cn(
        className,
        isMobileView ? mobileClassName : desktopClassName
      )}
      data-view={activeView}
    >
      {children}
    </div>
  )
}
