import { z } from 'zod'

// ==========================================
// CORE DATA SCHEMAS
// ==========================================

// Base chart data point schema
export const ChartDataPointSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  value: z.number().min(0, 'Value must be positive'),
  label: z.string().optional()
})

// Cash flow data point schema (extends base but allows negative values for net flow)
export const CashFlowDataPointSchema = ChartDataPointSchema.extend({
  inflow: z.number().min(0, 'Inflow must be positive'),
  outflow: z.number().min(0, 'Outflow must be positive'),
  balance: z.number()
}).omit({ value: true }).extend({
  value: z.number() // Allow negative values for net flow
})

// ==========================================
// FILTER SCHEMAS
// ==========================================

// Time range schema
export const TimeRangeSchema = z.enum(['7D', '30D', '3M', 'YTD', 'custom'])

// Custom date range schema
export const CustomDateRangeSchema = z.object({
  start: z.date(),
  end: z.date()
})

// ==========================================
// API REQUEST/RESPONSE SCHEMAS
// ==========================================

// Chart data request schema
export const ChartDataRequestSchema = z.object({
  timeRange: TimeRangeSchema,
  chartType: z.enum(['cash-flow', 'profit', 'expenses', 'revenue']),
  customDateRange: CustomDateRangeSchema.optional()
})

// Chart data response schema
export const ChartDataResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(ChartDataPointSchema),
  metadata: z.object({
    timeRange: TimeRangeSchema,
    dataPoints: z.number(),
    generatedAt: z.string()
  })
})

// Cash flow response schema
export const CashFlowResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(CashFlowDataPointSchema),
  metadata: z.object({
    timeRange: TimeRangeSchema,
    dataPoints: z.number(),
    generatedAt: z.string()
  })
})

// ==========================================
// ERROR SCHEMAS
// ==========================================

// API error response schema
export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional()
  })
})

// ==========================================
// TYPE EXPORTS
// ==========================================

export type ChartDataPoint = z.infer<typeof ChartDataPointSchema>
export type CashFlowDataPoint = z.infer<typeof CashFlowDataPointSchema>
export type TimeRange = z.infer<typeof TimeRangeSchema>
export type CustomDateRange = z.infer<typeof CustomDateRangeSchema>
export type ChartDataRequest = z.infer<typeof ChartDataRequestSchema>
export type ChartDataResponse = z.infer<typeof ChartDataResponseSchema>
export type CashFlowResponse = z.infer<typeof CashFlowResponseSchema>
export type ApiError = z.infer<typeof ApiErrorSchema>
