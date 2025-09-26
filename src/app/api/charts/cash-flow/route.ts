import { NextRequest, NextResponse } from 'next/server'
import { MockApiService } from '@/lib/mockApiService'
import { TimeRangeSchema } from '@/lib/schemas'

// ==========================================
// CASH FLOW DATA API ROUTE
// ==========================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract time range parameter
    const timeRange = searchParams.get('timeRange') as '7D' | '30D' | '3M' | 'YTD' | 'custom'
    
    // Validate required parameter
    if (!timeRange) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_PARAMETER',
            message: 'timeRange is a required parameter'
          }
        },
        { status: 400 }
      )
    }
    
    // Validate time range
    const validatedTimeRange = TimeRangeSchema.parse(timeRange)
    
    // Get data from mock service
    const result = await MockApiService.getCashFlowData(validatedTimeRange)
    
    // Return response
    if (result.success) {
      return NextResponse.json(result, { status: 200 })
    } else {
      return NextResponse.json(result, { status: 500 })
    }
    
  } catch (error) {
    console.error('Cash Flow API Route Error:', error)
    
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

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
