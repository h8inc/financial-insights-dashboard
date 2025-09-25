'use client'

import React from 'react'
import { useResponsiveView } from '@/hooks/useResponsiveView'
import { cn } from '@/lib/utils'

interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  frameStyle?: 'iphone' | 'android' | 'generic'
  showFrameControls?: boolean
}

export function ResponsiveContainer({ 
  children, 
  className,
  frameStyle = 'iphone'
}: ResponsiveContainerProps) {
  const { shouldShowFrame, deviceType } = useResponsiveView()
  
  // Native mobile experience - no frame needed
  if (deviceType === 'mobile' || !shouldShowFrame) {
    return (
      <div className={cn("w-full min-h-screen", className)}>
        {children}
      </div>
    )
  }

  // Desktop users viewing mobile preview with enhanced frame
  return (
    <div className="flex flex-col items-center justify-start p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen relative">
      
      {/* Frame Controls - removed badges */}

      {/* Device Frame */}
      <div className="relative">
        {frameStyle === 'iphone' ? (
          // iPhone Frame
          <div className="relative mx-auto border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[812px] w-[375px] shadow-2xl">
            {/* Dynamic Island */}
            <div className="w-[126px] h-[30px] bg-gray-800 top-[22px] rounded-full left-1/2 -translate-x-1/2 absolute"></div>
            
            {/* Volume Buttons */}
            <div className="h-[32px] w-[3px] bg-gray-800 absolute -start-[17px] top-[126px] rounded-s-lg"></div>
            <div className="h-[62px] w-[3px] bg-gray-800 absolute -start-[17px] top-[176px] rounded-s-lg"></div>
            
            {/* Power Button */}
            <div className="h-[76px] w-[3px] bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
            
            {/* Screen */}
            <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white relative">
              {/* Status Bar Overlay */}
              <div className="absolute top-0 left-0 right-0 h-[44px] bg-white/95 backdrop-blur-sm z-10 flex items-center justify-between px-6 text-black text-sm font-medium">
                <span>9:41</span>
                <div className="flex items-center gap-1">
                  <div className="flex gap-[2px]">
                    <div className="w-1 h-1 bg-black rounded-full"></div>
                    <div className="w-1 h-1 bg-black rounded-full"></div>
                    <div className="w-1 h-1 bg-black rounded-full"></div>
                    <div className="w-1 h-1 bg-black/40 rounded-full"></div>
                  </div>
                  <span className="text-xs">99%</span>
                </div>
              </div>
              
              {/* Content */}
              <div className={cn("w-full h-full overflow-y-auto pt-[44px]", className)}>
                {children}
              </div>
            </div>
          </div>
        ) : (
          // Generic Frame
          <div className="relative mx-auto border-gray-700 bg-gray-700 border-[8px] rounded-[1.5rem] h-[812px] w-[375px] shadow-xl">
            <div className="rounded-[1rem] overflow-hidden w-full h-full bg-white">
              <div className={cn("w-full h-full overflow-y-auto", className)}>
                {children}
              </div>
            </div>
          </div>
        )}
        
        {/* Device Info - removed badges */}
      </div>
      
      {/* ViewSwitcher now handled at root layout level */}
    </div>
  )
}
