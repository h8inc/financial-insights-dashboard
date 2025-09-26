'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartType } from '@/lib/types'
import { DashboardCard } from '@/components/DashboardCard'
import { MobileSubscriptionSheet } from '@/components/MobileSubscriptionSheet'
import { ResponsiveWrapper } from '@/components/ResponsiveWrapper'
import { Badge } from '@/components/ui/badge'
import { Crown, Lock } from 'lucide-react'
import { useResponsiveView } from '@/hooks/useResponsiveView'

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
  const { activeSubscription, isMobileView } = useResponsiveView()

  return (
    <ResponsiveWrapper
      className="container mx-auto"
      mobileClassName="p-4"
      desktopClassName="p-4 md:p-6"
    >
      <ResponsiveWrapper
        mobileClassName="mb-6"
        desktopClassName="mb-6 md:mb-8"
      >
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <ResponsiveWrapper
              mobileClassName="text-2xl font-bold text-gray-900"
              desktopClassName="text-2xl md:text-3xl font-bold text-gray-900"
            >
              <h1>Financial Dashboard</h1>
            </ResponsiveWrapper>
            <ResponsiveWrapper
              mobileClassName="text-sm text-gray-600 mt-1"
              desktopClassName="text-sm md:text-base text-gray-600 mt-1 md:mt-2"
            >
              <p>Overview of your financial metrics with real-time delta comparisons</p>
            </ResponsiveWrapper>
          </div>
          
          {/* Mobile Subscription Control - Show when mobile view is active (respects view switcher) */}
          {isMobileView && (
            <div className="ml-4">
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
            </div>
          )}
          
          {/* ViewSwitcher handled at root layout level for desktop */}
        </div>
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
  )
}

