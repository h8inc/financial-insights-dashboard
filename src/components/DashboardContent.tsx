'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartType } from '@/lib/types'
import { DashboardCard } from '@/components/DashboardCard'
import { ResponsiveWrapper } from '@/components/ResponsiveWrapper'
import { UnifiedHeader } from '@/components/UnifiedHeader'

const chartCards = [
  {
    type: ChartType.CASH_FLOW,
    title: 'Cash Flow',
    href: '/charts/cash-flow'
  },
  {
    type: ChartType.PROFIT,
    title: 'Profit',
    href: '/charts/profit'
  },
  {
    type: ChartType.EXPENSES,
    title: 'Expenses',
    href: '/charts/expenses'
  },
  {
    type: ChartType.REVENUE,
    title: 'Revenue',
    href: '/charts/revenue'
  }
]

export const DashboardContent = () => {
  return (
    <div className="min-h-screen">
      {/* Unified Header */}
      <UnifiedHeader 
        title="Financial Dashboard"
        description="Overview of your financial metrics with real-time delta comparisons"
        showBackButton={false}
      />
      
      {/* Main Content */}
      <ResponsiveWrapper
        className="container mx-auto"
        mobileClassName="p-4"
        desktopClassName="p-4 md:p-6"
      >
        <ResponsiveWrapper
          mobileClassName="mb-6"
          desktopClassName="mb-6 md:mb-8"
        >
          <div>{/* Empty space for consistent spacing */}</div>
        </ResponsiveWrapper>

      <ResponsiveWrapper
        mobileClassName="grid grid-cols-1 gap-4"
        desktopClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
      >
        {chartCards.map((chart) => (
          <DashboardCard
            key={chart.type}
            type={chart.type}
            title={chart.title}
            href={chart.href}
          />
        ))}
      </ResponsiveWrapper>

      <ResponsiveWrapper
        mobileClassName="mt-8"
        desktopClassName="mt-8"
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Click on any chart above to drill down into detailed views with advanced filters and transaction breakdowns.
              All delta comparisons are computed from mock data showing period-over-period changes. Use the view switcher above to toggle between mobile and desktop experiences.
            </p>
          </CardContent>
        </Card>
      </ResponsiveWrapper>
    </ResponsiveWrapper>
    </div>
  )
}

