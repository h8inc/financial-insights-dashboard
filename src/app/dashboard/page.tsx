import { DataProvider } from '@/components/DataProvider'
import { DashboardContent } from '@/components/DashboardContent'

export default function DashboardPage() {
  return (
    <DataProvider>
      <DashboardContent />
    </DataProvider>
  )
}
