import React, { useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { D3BaseChart, useD3Chart } from './D3BaseChart'
import { ChartDataPoint, CashFlowDataPoint } from '@/lib/types'

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

    // Clear previous bars
    g.selectAll('.bar').remove()

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
      .attr('fill', color)
      .attr('rx', 4)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this).style('opacity', 0.8)
        const dataPoint = d as ChartDataPoint & { x?: number; y?: number }
        dataPoint.x = event.pageX
        dataPoint.y = event.pageY
        onDataPointHover?.(d)
      })
      .on('mouseout', function() {
        d3.select(this).style('opacity', 1)
        onDataPointHover?.(null)
      })
  }, [chartInternals, color, onDataPointHover])

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

  useEffect(() => {
    if (!chartInternals || !svgRef.current) return

    const { xScale, yScale, data: parsedData, innerWidth, innerHeight } = chartInternals
    const svg = d3.select(svgRef.current)
    const g = svg.select('g')

    // Clear previous elements
    g.selectAll('.line-element').remove()

    // Create line generator
    const line = d3.line<typeof parsedData[0]>()
      .x(d => xScale(d.parsedDate))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX)

    // Add area if requested
    if (showArea) {
      const area = d3.area<typeof parsedData[0]>()
        .x(d => xScale(d.parsedDate))
        .y0(innerHeight)
        .y1(d => yScale(d.value))
        .curve(d3.curveMonotoneX)

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

    // Add data points
    g.selectAll('.data-point')
      .data(parsedData)
      .enter()
      .append('circle')
      .attr('class', 'line-element data-point')
      .attr('cx', d => xScale(d.parsedDate))
      .attr('cy', d => yScale(d.value))
      .attr('r', 4)
      .attr('fill', color)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('r', 6)
        const dataPoint = d as ChartDataPoint & { x?: number; y?: number }
        dataPoint.x = event.pageX
        dataPoint.y = event.pageY
        onDataPointHover?.(d)
      })
      .on('mouseout', function() {
        d3.select(this).attr('r', 4)
        onDataPointHover?.(null)
      })
  }, [chartInternals, color, showArea, onDataPointHover])

  return <D3BaseChart ref={svgRef} data={data} width={width} height={height} className={className} onDataPointHover={onDataPointHover} />
}

// D3CashFlowChart temporarily disabled for production build
// Will be re-enabled in next iteration with proper data structure