import { NextRequest, NextResponse } from 'next/server'
import { MockApiService } from '@/lib/mockApiService'
import { ChartDataRequestSchema } from '@/lib/schemas'

// ==========================================
// CHART DATA API ROUTE
// ==========================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const timeRange = searchParams.get('timeRange') as '7D' | '30D' | '3M' | 'YTD' | 'custom'
    const chartType = searchParams.get('chartType') as 'cash-flow' | 'profit' | 'expenses' | 'revenue'
    
    // Validate required parameters
    if (!timeRange || !chartType) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_PARAMETERS',
            message: 'timeRange and chartType are required parameters'
          }
        },
        { status: 400 }
      )
    }
    
    // Create request object
    const apiRequest = {
      timeRange,
      chartType
    }
    
    // Validate request
    const validatedRequest = ChartDataRequestSchema.parse(apiRequest)
    
    // Get data from mock service
    const result = await MockApiService.getChartData(validatedRequest)
    
    // Return response
    if (result.success) {
      return NextResponse.json(result, { status: 200 })
    } else {
      return NextResponse.json(result, { status: 500 })
    }
    
  } catch (error) {
    console.error('API Route Error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An internal server error occurred',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    )
  }
}

// ==========================================
// CORS HEADERS FOR DEVELOPMENT
// ==========================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
