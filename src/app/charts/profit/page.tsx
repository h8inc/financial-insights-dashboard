'use client'

import { ChartVisualization } from '@/components/charts/ChartVisualization'
import { DeltaDisplay } from '@/components/charts/DeltaDisplay'
import { TransactionBreakdown } from '@/components/charts/TransactionBreakdown'
import { ResponsiveWrapper } from '@/components/ResponsiveWrapper'
import { UnifiedHeader } from '@/components/UnifiedHeader'
import { ChartType } from '@/lib/types'

const ProfitContent = () => {
  return (
    <div className="min-h-screen">
      {/* Unified Header */}
      <UnifiedHeader 
        title="Profit Analysis"
        description="Detailed profit visualization and breakdown with real-time delta comparisons"
        backHref="/dashboard"
      />

      {/* Content Layout - Mobile Optimized */}
      <ResponsiveWrapper
        className="container mx-auto"
        mobileClassName="p-4"
        desktopClassName="p-4 md:p-6"
      >
        <ResponsiveWrapper
          mobileClassName="grid grid-cols-1 gap-4"
          desktopClassName="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6"
        >
          {/* Main Chart - Full width on mobile, 2/3 on desktop */}
          <ResponsiveWrapper
            mobileClassName="order-1"
            desktopClassName="lg:col-span-2 order-1"
          >
            <ChartVisualization 
              type={ChartType.PROFIT}
              title="Profit Chart"
            />
          </ResponsiveWrapper>

          {/* Sidebar - Stacked on mobile, sidebar on desktop */}
          <ResponsiveWrapper
            mobileClassName="space-y-4 order-2"
            desktopClassName="space-y-4 md:space-y-6 order-2"
          >
            {/* Mobile: Show delta first, then transactions */}
            <div className="md:hidden space-y-4">
              <DeltaDisplay type={ChartType.PROFIT} />
            </div>
            
            {/* Desktop: Normal order */}
            <div className="hidden md:block space-y-6">
              <DeltaDisplay type={ChartType.PROFIT} />
              <TransactionBreakdown type={ChartType.PROFIT} />
            </div>
            
            {/* Mobile: Transaction breakdown at bottom */}
            <div className="md:hidden">
              <TransactionBreakdown type={ChartType.PROFIT} />
            </div>
          </ResponsiveWrapper>
        </ResponsiveWrapper>
      </ResponsiveWrapper>
    </div>
  )
}

export default function ProfitPage() {
  return <ProfitContent />
}
