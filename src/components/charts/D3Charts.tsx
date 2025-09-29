import React, { useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { D3BaseChart, useD3Chart } from './D3BaseChart'
import { ChartDataPoint } from '@/lib/types'

// D3 Bar Chart Component
export interface D3BarChartProps {
  data: ChartDataPoint[]
  width?: number
  height?: number
  className?: string
  color?: string
  onDataPointHover?: (point: ChartDataPoint | null) => void
}

export const D3BarChart: React.FC<D3BarChartProps> = ({
  data,
  width = 800,
  height = 400,
  className = '',
  color = '#3b82f6',
  onDataPointHover,
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const chartInternals = useD3Chart(svgRef)

  useEffect(() => {
    if (!chartInternals || !svgRef.current) return

    const { xScale, yScale, data: parsedData, innerWidth, innerHeight } = chartInternals
    const svg = d3.select(svgRef.current)
    const g = svg.select('g')

    // Clear previous elements
    g.selectAll('.bar').remove()
    g.selectAll('.hover-background').remove()

    // Create bars
    g.selectAll('.bar')
      .data(parsedData)
      .enter()
      .append('rect')
      .attr('class', 'chart-element bar')
      .attr('x', d => xScale(d.parsedDate)!)
      .attr('y', d => yScale(d.value))
      .attr('width', Math.max(1, innerWidth / parsedData.length - 2))
      .attr('height', d => innerHeight - yScale(d.value))
      .attr('fill', d => {
        // Support dynamic colors per bar (for cash flow activity mode)
        if ((d as ChartDataPoint & { isPositive?: boolean }).isPositive !== undefined) {
          return (d as ChartDataPoint & { isPositive?: boolean }).isPositive ? '#10b981' : '#ef4444' // Green for positive, red for negative
        }
        return color
      })
      .attr('rx', 4)
      .style('cursor', 'pointer')

    // MOVE HOVER ZONES TO END - RENDER ON TOP OF EVERYTHING
    // Create invisible hover zones for each bar - NON-OVERLAPPING
    const barWidth = Math.max(1, innerWidth / parsedData.length - 2)
    const hoverZoneWidth = Math.min(barWidth * 1.5, innerWidth / parsedData.length * 0.9) // Prevent overlap with gap
    
    // Add hover zones LAST so they're on top
    setTimeout(() => {
      const svg = d3.select(svgRef.current)
      const g = svg.select('g')
      
      // React handles mouseleave on container level
      
      g.selectAll('.hover-zone').remove() // Clear existing
      g.selectAll('.hover-zone')
        .data(parsedData)
        .enter()
        .append('rect')
        .attr('class', 'hover-zone')
        .attr('x', d => xScale(d.parsedDate)! - (hoverZoneWidth - barWidth) / 2)
        .attr('y', 0)
        .attr('width', hoverZoneWidth)
        .attr('height', innerHeight)
        .attr('fill', 'transparent')
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
          console.log('BAR CHART HOVER:', d.date) // DEBUG
          // Add hover background
          g.selectAll('.hover-background').remove()
          g.append('rect')
            .attr('class', 'hover-background')
            .attr('x', xScale(d.parsedDate)! - (hoverZoneWidth - barWidth) / 2)
            .attr('y', 0)
            .attr('width', hoverZoneWidth)
            .attr('height', innerHeight)
            .attr('fill', 'rgba(59, 130, 246, 0.1)')
            .attr('rx', 4)
          
          // Show tooltip with slight delay to prevent flicker
          setTimeout(() => {
            const chartRect = svgRef.current?.getBoundingClientRect()
            if (chartRect) {
              const originalPoint = data.find(item => item.date === d.date)
              const pointWithPosition = {
                ...(originalPoint || d),
                x: event.clientX - chartRect.left,
                y: event.clientY - chartRect.top
              }
              console.log('BAR CHART TOOLTIP:', pointWithPosition) // DEBUG
              onDataPointHover?.(pointWithPosition)
            }
          }, 50)
        })
        .on('mouseout', function() {
          g.selectAll('.hover-background').remove()
          // React container handles tooltip hiding
        })
    }, 0)
  }, [chartInternals, color, data, onDataPointHover])

  return <D3BaseChart ref={svgRef} data={data} width={width} height={height} className={className} onDataPointHover={onDataPointHover} />
}

// D3 Line Chart Component
export interface D3LineChartProps {
  data: ChartDataPoint[]
  width?: number
  height?: number
  className?: string
  color?: string
  showArea?: boolean
  onDataPointHover?: (point: ChartDataPoint | null) => void
}

export const D3LineChart: React.FC<D3LineChartProps> = ({
  data,
  width = 800,
  height = 400,
  className = '',
  color = '#3b82f6',
  showArea = false,
  onDataPointHover,
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const chartInternals = useD3Chart(svgRef)
  
  // Mobile detection removed - not currently used

  useEffect(() => {
    if (!chartInternals || !svgRef.current) return

    const { xScale, yScale, data: parsedData, innerWidth, innerHeight } = chartInternals
    const svg = d3.select(svgRef.current)
    const g = svg.select('g')

    // Clear previous elements
    g.selectAll('.line-element').remove()
    g.selectAll('.hover-background').remove()
    g.selectAll('.hover-zone').remove()

    // Create line generator with smooth curve
    const line = d3.line<typeof parsedData[0]>()
      .x(d => xScale(d.parsedDate))
      .y(d => yScale(d.value))
      .curve(d3.curveBasis)

    // Add area if requested
    if (showArea) {
      const area = d3.area<typeof parsedData[0]>()
        .x(d => xScale(d.parsedDate))
        .y0(innerHeight)
        .y1(d => yScale(d.value))
        .curve(d3.curveBasis)

      g.append('path')
        .attr('class', 'line-element area')
        .datum(parsedData)
        .attr('d', area)
        .attr('fill', color)
        .attr('fill-opacity', 0.2)
    }

    // Add line
    g.append('path')
      .attr('class', 'line-element line')
      .datum(parsedData)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2)

    // MOVE HOVER ZONES TO END - RENDER ON TOP OF EVERYTHING
    // Create invisible hover zones for each data point - NON-OVERLAPPING
    const barWidth = Math.max(1, innerWidth / parsedData.length - 2)
    const hoverZoneWidth = Math.min(barWidth * 1.5, innerWidth / parsedData.length * 0.9) // Prevent overlap with gap
    
    // Add hover zones LAST so they're on top
    setTimeout(() => {
      const svg = d3.select(svgRef.current)
      const g = svg.select('g')
      
      // React handles mouseleave on container level
      
      g.selectAll('.hover-zone').remove() // Clear existing
      g.selectAll('.hover-zone')
        .data(parsedData)
        .enter()
        .append('rect')
        .attr('class', 'hover-zone')
        .attr('x', d => xScale(d.parsedDate)! - hoverZoneWidth/2)
        .attr('y', 0)
        .attr('width', hoverZoneWidth)
        .attr('height', innerHeight)
        .attr('fill', 'transparent')
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
          console.log('LINE CHART HOVER:', d.date) // DEBUG
          // Add hover background
          g.selectAll('.hover-background').remove()
          g.append('rect')
            .attr('class', 'hover-background')
            .attr('x', xScale(d.parsedDate)! - hoverZoneWidth/2)
            .attr('y', 0)
            .attr('width', hoverZoneWidth)
            .attr('height', innerHeight)
            .attr('fill', 'rgba(59, 130, 246, 0.1)')
            .attr('rx', 4)
          
          // Show tooltip with slight delay to prevent flicker
          setTimeout(() => {
            const chartRect = svgRef.current?.getBoundingClientRect()
            if (chartRect) {
              const originalPoint = data.find(item => item.date === d.date)
              const pointWithPosition = {
                ...(originalPoint || d),
                x: event.clientX - chartRect.left,
                y: event.clientY - chartRect.top
              }
              console.log('LINE CHART TOOLTIP:', pointWithPosition) // DEBUG
              onDataPointHover?.(pointWithPosition)
            }
          }, 50)
        })
        .on('mouseout', function() {
          g.selectAll('.hover-background').remove()
          // React container handles tooltip hiding
        })
    }, 0)

    // Data points removed for cleaner smooth line visualization
  }, [chartInternals, color, showArea, data, onDataPointHover])

  return <D3BaseChart ref={svgRef} data={data} width={width} height={height} className={className} onDataPointHover={onDataPointHover} />
}

// D3CashFlowChart temporarily disabled for production build
// Will be re-enabled in next iteration with proper data structure