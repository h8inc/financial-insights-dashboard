import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ErrorServer } from '@/components/ErrorServer'

export default function ErrorServerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto p-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Error Monitoring Server</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto p-6">
        <ErrorServer />
      </div>
    </div>
  )
}