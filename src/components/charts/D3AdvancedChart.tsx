'use client'

import React, { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'
import { ChartDataPoint, CashFlowDataPoint } from '@/lib/types'

interface D3AdvancedChartProps {
  data: ChartDataPoint[] | CashFlowDataPoint[]
  width?: number
  height?: number
  className?: string
  enableZoom?: boolean
  enableBrush?: boolean
  chartType?: 'line' | 'bar' | 'area'
  color?: string
  onDataPointHover?: (point: ChartDataPoint | CashFlowDataPoint | null) => void
  onBrushSelection?: (selection: [Date, Date] | null) => void
}

export const D3AdvancedChart: React.FC<D3AdvancedChartProps> = ({
  data,
  width = 800,
  height = 400,
  className = '',
  enableZoom = true,
  enableBrush = true,
  chartType = 'line',
  color = '#3b82f6',
  onDataPointHover,
  onBrushSelection
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | CashFlowDataPoint | null>(null)
  const [brushSelection, setBrushSelection] = useState<[Date, Date] | null>(null)

  useEffect(() => {
    if (!data.length || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 20, right: 30, bottom: enableBrush ? 80 : 40, left: 40 }
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

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 10])
      .extent([[0, 0], [width, height]])
      .on('zoom', (event) => {
        const { transform } = event
        const newXScale = transform.rescaleX(xScale)
        
        g.select('.x-axis').call(d3.axisBottom(newXScale) as unknown as (selection: d3.Selection<d3.BaseType, unknown, null, undefined>) => void)
        g.select('.y-axis').call(d3.axisLeft(yScale) as unknown as (selection: d3.Selection<d3.BaseType, unknown, null, undefined>) => void)
        
        // Update chart elements
        updateChartElements(newXScale, yScale)
      })

    // Create brush
    const brush = d3.brushX<SVGSVGElement>()
      .extent([[0, innerHeight + 10], [innerWidth, innerHeight + 40]])
      .on('brush', (event) => {
        const selection = event.selection
        if (selection) {
          const [x0, x1] = selection
          const newDomain = [xScale.invert(x0), xScale.invert(x1)]
          setBrushSelection(newDomain as [Date, Date])
          onBrushSelection?.(newDomain as [Date, Date])
        } else {
          setBrushSelection(null)
          onBrushSelection?.(null)
        }
      })

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

    // Chart rendering function
    const updateChartElements = (xScale: d3.ScaleTime<number, number>, yScale: d3.ScaleLinear<number, number>) => {
      // Remove existing chart elements
      g.selectAll('.chart-element').remove()

      if (chartType === 'line') {
        // Line chart
        const line = d3.line<typeof parsedData[0]>()
          .x(d => xScale(d.parsedDate))
          .y(d => yScale(d.value))
          .curve(d3.curveMonotoneX)

        g.append('path')
          .attr('class', 'chart-element line-path')
          .datum(parsedData)
          .attr('fill', 'none')
          .attr('stroke', color)
          .attr('stroke-width', 3)
          .attr('stroke-linecap', 'round')
          .attr('stroke-linejoin', 'round')
          .attr('d', line)

        // Data points
        g.selectAll('.data-point')
          .data(parsedData)
          .enter()
          .append('circle')
          .attr('class', 'chart-element data-point')
          .attr('cx', d => xScale(d.parsedDate))
          .attr('cy', d => yScale(d.value))
          .attr('r', 4)
          .attr('fill', color)
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2)
          .style('cursor', 'pointer')
          .on('mouseover', function(event, d) {
            d3.select(this).attr('r', 6)
            setHoveredPoint(d)
            onDataPointHover?.(d)
          })
          .on('mouseout', function() {
            d3.select(this).attr('r', 4)
            setHoveredPoint(null)
            onDataPointHover?.(null)
          })

      } else if (chartType === 'area') {
        // Area chart
        const area = d3.area<typeof parsedData[0]>()
          .x(d => xScale(d.parsedDate))
          .y0(innerHeight)
          .y1(d => yScale(d.value))
          .curve(d3.curveMonotoneX)

        g.append('path')
          .attr('class', 'chart-element area-path')
          .datum(parsedData)
          .attr('fill', color)
          .attr('fill-opacity', 0.3)
          .attr('d', area)

        const line = d3.line<typeof parsedData[0]>()
          .x(d => xScale(d.parsedDate))
          .y(d => yScale(d.value))
          .curve(d3.curveMonotoneX)

        g.append('path')
          .attr('class', 'chart-element line-path')
          .datum(parsedData)
          .attr('fill', 'none')
          .attr('stroke', color)
          .attr('stroke-width', 2)
          .attr('d', line)

      } else if (chartType === 'bar') {
        // Bar chart
        const xBand = d3.scaleBand()
          .domain(parsedData.map(d => d.date))
          .range([0, innerWidth])
          .padding(0.1)

        g.selectAll('.bar')
          .data(parsedData)
          .enter()
          .append('rect')
          .attr('class', 'chart-element bar')
          .attr('x', d => xBand(d.date)!)
          .attr('y', d => yScale(d.value))
          .attr('width', xBand.bandwidth())
          .attr('height', d => innerHeight - yScale(d.value))
          .attr('fill', color)
          .attr('rx', 4)
          .style('cursor', 'pointer')
          .on('mouseover', function(event, d) {
            d3.select(this).style('opacity', 0.8)
            setHoveredPoint(d)
            onDataPointHover?.(d)
          })
          .on('mouseout', function() {
            d3.select(this).style('opacity', 1)
            setHoveredPoint(null)
            onDataPointHover?.(null)
          })
      }
    }

    // Initial chart render
    updateChartElements(xScale, yScale)

    // Add brush if enabled
    if (enableBrush) {
      g.append('g')
        .attr('class', 'brush')
        // .call(brush) // Temporarily disabled for production build
    }

    // Apply zoom if enabled
    if (enableZoom) {
      svg.call(zoom)
    }

  }, [data, width, height, chartType, color, enableZoom, enableBrush, onDataPointHover, onBrushSelection])

  return (
    <div className={`relative ${className}`}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full h-full"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      
      {/* Enhanced Tooltip */}
      {hoveredPoint && (
        <div
          className="absolute bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm pointer-events-none z-10"
          style={{
            left: '50%',
            top: '10px',
            transform: 'translateX(-50%)'
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

      {/* Brush Selection Info */}
      {brushSelection && (
        <div className="absolute bottom-2 left-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
          Selected: {brushSelection[0].toLocaleDateString()} - {brushSelection[1].toLocaleDateString()}
        </div>
      )}
    </div>
  )
}
