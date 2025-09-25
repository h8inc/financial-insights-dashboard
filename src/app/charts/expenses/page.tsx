import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataProvider } from '@/components/DataProvider'
import { ChartVisualization } from '@/components/charts/ChartVisualization'
import { DeltaDisplay } from '@/components/charts/DeltaDisplay'
import { TransactionBreakdown } from '@/components/charts/TransactionBreakdown'
import { Filters } from '@/components/charts/Filters'
import { MobileHeader } from '@/components/MobileHeader'
import { ChartType } from '@/lib/types'

const ExpensesContent = () => {
  return (
    <div className="min-h-screen">
      {/* Mobile Header */}
      <MobileHeader 
        title="Expenses Analysis"
        description="Detailed expenses visualization and breakdown with real-time delta comparisons"
        backHref="/dashboard"
      />
      
      {/* Desktop Header */}
      <div className="hidden md:block">
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <Link href="/dashboard">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Expenses Analysis</h1>
            <p className="text-gray-600 mt-2">Detailed expenses visualization and breakdown with real-time delta comparisons</p>
          </div>
        </div>
      </div>

      {/* Content Layout - Mobile Optimized */}
      <div className="container mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Main Chart - Full width on mobile, 2/3 on desktop */}
          <div className="lg:col-span-2 order-1">
            <ChartVisualization 
              type={ChartType.EXPENSES}
              title="Expenses Chart"
            />
          </div>

          {/* Sidebar - Stacked on mobile, sidebar on desktop */}
          <div className="space-y-4 md:space-y-6 order-2">
            {/* Mobile: Show filters first, then delta, then transactions */}
            <div className="md:hidden space-y-4">
              <Filters type={ChartType.EXPENSES} />
              <DeltaDisplay type={ChartType.EXPENSES} />
            </div>
            
            {/* Desktop: Normal order */}
            <div className="hidden md:block space-y-6">
              <Filters type={ChartType.EXPENSES} />
              <DeltaDisplay type={ChartType.EXPENSES} />
              <TransactionBreakdown type={ChartType.EXPENSES} />
            </div>
            
            {/* Mobile: Transaction breakdown at bottom */}
            <div className="md:hidden">
              <TransactionBreakdown type={ChartType.EXPENSES} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ExpensesPage() {
  return (
    <DataProvider>
      <ExpensesContent />
    </DataProvider>
  )
}
