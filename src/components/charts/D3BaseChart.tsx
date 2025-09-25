'use client'

import React, { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'
import { ChartDataPoint, CashFlowDataPoint } from '@/lib/types'

interface D3BaseChartProps {
  data: ChartDataPoint[] | CashFlowDataPoint[]
  width?: number
  height?: number
  className?: string
  margin?: { top: number; right: number; bottom: number; left: number }
  onDataPointHover?: (point: ChartDataPoint | CashFlowDataPoint | null) => void
}

export const D3BaseChart = React.forwardRef<SVGSVGElement, D3BaseChartProps>(({
  data,
  width = 800,
  height = 400,
  className = '',
  margin = { top: 20, right: 30, bottom: 40, left: 40 },
  onDataPointHover
}, ref) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | CashFlowDataPoint | null>(null)
  
  // Use forwarded ref or internal ref
  const actualRef = ref || svgRef

  useEffect(() => {
    if (!data.length || !actualRef || typeof actualRef === 'function' || !actualRef.current) return

    const svg = d3.select(actualRef.current)
    svg.selectAll('*').remove() // Clear previous renders

    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Parse dates
    const parseDate = d3.timeParse('%Y-%m-%d')
    const parsedData = data.map(d => ({
      ...d,
      parsedDate: parseDate(d.date)!
    }))

    // Create scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(parsedData, d => d.parsedDate) as [Date, Date])
      .range([0, innerWidth])

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(parsedData, d => d.value) as [number, number])
      .nice()
      .range([innerHeight, 0])

    // Create axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat((d) => d3.timeFormat('%b %d')(d as Date))
      .ticks(Math.min(data.length, 8))

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => `$${d3.format('.0s')(d as number)}`)

    // Add axes
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#6b7280')

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#6b7280')

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickFormat(() => '')
      )
      .style('stroke', '#f3f4f6')
      .style('stroke-width', 1)
      .style('opacity', 0.7)

    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat(() => '')
      )
      .style('stroke', '#f3f4f6')
      .style('stroke-width', 1)
      .style('opacity', 0.7)

    // Store scales and data for child components
    const svgNode = svg.node() as SVGElement & {
      __scales?: { xScale: d3.ScaleTime<number, number>; yScale: d3.ScaleLinear<number, number> }
      __data?: typeof parsedData
      __innerWidth?: number
      __innerHeight?: number
    }
    svgNode.__scales = { xScale, yScale }
    svgNode.__data = parsedData
    svgNode.__innerWidth = innerWidth
    svgNode.__innerHeight = innerHeight

  }, [data, width, height, margin, actualRef])

  // Mouse handlers are now handled directly in the chart components

  return (
    <div className={`relative ${className}`}>
      <svg
        ref={actualRef}
        width={width}
        height={height}
        className="w-full h-full"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      
      {/* Tooltip */}
      {hoveredPoint && (
        <div
          className="absolute bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm pointer-events-none z-10"
          style={{
            left: `${(hoveredPoint as ChartDataPoint & { x?: number }).x || 0}px`,
            top: `${(hoveredPoint as ChartDataPoint & { y?: number }).y || 0}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="font-semibold">
            {new Date(hoveredPoint.date).toLocaleDateString()}
          </div>
          <div>
            ${hoveredPoint.value.toLocaleString()}
          </div>
          {'inflow' in hoveredPoint && (
            <>
              <div className="text-green-400">
                In: ${hoveredPoint.inflow.toLocaleString()}
              </div>
              <div className="text-red-400">
                Out: ${hoveredPoint.outflow.toLocaleString()}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
})

D3BaseChart.displayName = 'D3BaseChart'

// Hook to access chart internals
export const useD3Chart = (svgRef: React.RefObject<SVGSVGElement | null>) => {
  const [chartInternals, setChartInternals] = useState<{
    xScale: d3.ScaleTime<number, number>
    yScale: d3.ScaleLinear<number, number>
    data: Array<{ parsedDate: Date; date: string; value: number }>
    innerWidth: number
    innerHeight: number
  } | null>(null)

  useEffect(() => {
    if (svgRef.current) {
      const svg = svgRef.current as SVGElement & {
        __scales?: { xScale: d3.ScaleTime<number, number>; yScale: d3.ScaleLinear<number, number> }
        __data?: Array<{ parsedDate: Date; date: string; value: number }>
        __innerWidth?: number
        __innerHeight?: number
      }
      if (svg.__scales) {
        setChartInternals({
          xScale: svg.__scales.xScale,
          yScale: svg.__scales.yScale,
          data: svg.__data || [],
          innerWidth: svg.__innerWidth || 0,
          innerHeight: svg.__innerHeight || 0
        })
      }
    }
  }, [svgRef])

  return chartInternals
}
