'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Settings, Palette, MousePointer, BarChart3, TrendingUp, Activity } from 'lucide-react'
import { ChartDataPoint, CashFlowDataPoint } from '@/lib/types'
import { D3AdvancedChart } from './D3AdvancedChart'

interface D3ChartConfiguratorProps {
  data: ChartDataPoint[] | CashFlowDataPoint[]
  title: string
  defaultChartType?: 'line' | 'bar' | 'area'
  defaultColor?: string
  className?: string
}

export const D3ChartConfigurator: React.FC<D3ChartConfiguratorProps> = ({
  data,
  title,
  defaultChartType = 'line',
  defaultColor = '#3b82f6',
  className = ''
}) => {
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>(defaultChartType)
  const [color, setColor] = useState(defaultColor)
  const [enableZoom, setEnableZoom] = useState(true)
  const [enableBrush, setEnableBrush] = useState(true)
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | CashFlowDataPoint | null>(null)
  const [brushSelection, setBrushSelection] = useState<[Date, Date] | null>(null)

  const colorOptions = [
    { name: 'Blue', value: '#3b82f6', bg: 'bg-blue-500' },
    { name: 'Green', value: '#10b981', bg: 'bg-green-500' },
    { name: 'Red', value: '#ef4444', bg: 'bg-red-500' },
    { name: 'Purple', value: '#8b5cf6', bg: 'bg-purple-500' },
    { name: 'Orange', value: '#f97316', bg: 'bg-orange-500' },
    { name: 'Teal', value: '#14b8a6', bg: 'bg-teal-500' }
  ]

  const chartTypeOptions = [
    { 
      type: 'line' as const, 
      label: 'Line Chart', 
      icon: TrendingUp, 
      description: 'Shows trends over time' 
    },
    { 
      type: 'bar' as const, 
      label: 'Bar Chart', 
      icon: BarChart3, 
      description: 'Compares values across periods' 
    },
    { 
      type: 'area' as const, 
      label: 'Area Chart', 
      icon: Activity, 
      description: 'Shows magnitude with filled area' 
    }
  ]

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Chart Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Chart Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chart Type Selection */}
          <div>
            <h4 className="text-sm font-medium mb-2">Chart Type</h4>
            <div className="grid grid-cols-3 gap-2">
              {chartTypeOptions.map((option) => {
                const Icon = option.icon
                return (
                  <Button
                    key={option.type}
                    variant={chartType === option.type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartType(option.type)}
                    className="flex flex-col items-center gap-1 h-auto py-3"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{option.label}</span>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <h4 className="text-sm font-medium mb-2">Color Theme</h4>
            <div className="flex gap-2">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setColor(option.value)}
                  className={`w-8 h-8 rounded-full ${option.bg} border-2 ${
                    color === option.value ? 'border-gray-900' : 'border-transparent'
                  } hover:scale-110 transition-transform`}
                  title={option.name}
                />
              ))}
            </div>
          </div>

          {/* Interaction Options */}
          <div>
            <h4 className="text-sm font-medium mb-2">Interactions</h4>
            <div className="flex gap-2">
              <Button
                variant={enableZoom ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEnableZoom(!enableZoom)}
                className="flex items-center gap-1"
              >
                <MousePointer className="h-3 w-3" />
                Zoom
              </Button>
              <Button
                variant={enableBrush ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEnableBrush(!enableBrush)}
                className="flex items-center gap-1"
              >
                <Palette className="h-3 w-3" />
                Brush
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{title}</CardTitle>
            <div className="flex gap-2">
              {hoveredPoint && (
                <Badge variant="secondary" className="text-xs">
                  Hovering: ${hoveredPoint.value.toLocaleString()}
                </Badge>
              )}
              {brushSelection && (
                <Badge variant="outline" className="text-xs">
                  Selected Range
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-50 rounded-lg p-4">
            <D3AdvancedChart
              data={data}
              width={800}
              height={350}
              chartType={chartType}
              color={color}
              enableZoom={enableZoom}
              enableBrush={enableBrush}
              onDataPointHover={setHoveredPoint}
              onBrushSelection={setBrushSelection}
            />
          </div>
          
          {/* Chart Info */}
          <div className="mt-4 text-sm text-gray-600 space-y-1">
            <p>Data points: {data.length}</p>
            <p>Chart type: {chartTypeOptions.find(opt => opt.type === chartType)?.label}</p>
            <p>Color: {colorOptions.find(opt => opt.value === color)?.name}</p>
            {enableZoom && <p>Zoom: Enabled (scroll to zoom, drag to pan)</p>}
            {enableBrush && <p>Brush: Enabled (drag on bottom area to select range)</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
