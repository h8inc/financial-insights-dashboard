"use client"

import React, { useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { D3BaseChart, useD3Chart } from './D3BaseChart'
import { CashFlowDataPoint, ChartDataPoint } from '@/lib/types'

// D3 Dual Bar Chart Component for Cash Flow
export interface D3DualBarChartProps {
  data: CashFlowDataPoint[]
  width?: number
  height?: number
  className?: string
  onDataPointHover?: (point: CashFlowDataPoint | null) => void
}

export const D3DualBarChart: React.FC<D3DualBarChartProps> = ({
  data,
  width = 800,
  height = 400,
  className = '',
  onDataPointHover
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

    // Create dual bars for each data point
    const barWidth = Math.max(1, innerWidth / parsedData.length / 3) // Smaller width for dual bars
    const barSpacing = barWidth * 0.1 // Small gap between bars

    // Create Money In bars (teal)
    g.selectAll('.money-in-bar')
      .data(parsedData as (CashFlowDataPoint & { parsedDate: Date })[])
      .enter()
      .append('rect')
      .attr('class', 'chart-element bar money-in-bar')
      .attr('x', d => (xScale(d.parsedDate)! - barWidth - barSpacing/2))
      .attr('y', d => yScale(d.inflow))
      .attr('width', barWidth)
      .attr('height', d => innerHeight - yScale(d.inflow))
      .attr('fill', '#10b981') // Teal for Money In
      .attr('rx', 4)
      .style('cursor', 'pointer')

    // Create Money Out bars (orange)
    g.selectAll('.money-out-bar')
      .data(parsedData as (CashFlowDataPoint & { parsedDate: Date })[])
      .enter()
      .append('rect')
      .attr('class', 'chart-element bar money-out-bar')
      .attr('x', d => (xScale(d.parsedDate)! + barSpacing/2))
      .attr('y', d => yScale(d.outflow))
      .attr('width', barWidth)
      .attr('height', d => innerHeight - yScale(d.outflow))
      .attr('fill', '#f97316') // Orange for Money Out
      .attr('rx', 4)
      .style('cursor', 'pointer')

    // Create hover zones for each period (covering both bars)
    const hoverZoneWidth = Math.min(barWidth * 3, innerWidth / parsedData.length * 0.8)
    
    setTimeout(() => {
      const svg = d3.select(svgRef.current)
      const g = svg.select('g')
      
      g.selectAll('.hover-zone').remove()
      g.selectAll('.hover-zone')
        .data(parsedData as (CashFlowDataPoint & { parsedDate: Date })[])
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
          console.log('DUAL BAR CHART HOVER:', d.date)
          
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
          
          // Show tooltip with both inflow and outflow (with delay like other charts)
          setTimeout(() => {
            const chartRect = svgRef.current?.getBoundingClientRect()
            if (chartRect) {
              const originalPoint = data.find(item => item.date === d.date)
              const pointWithPosition = {
                ...(originalPoint || d),
                x: event.clientX - chartRect.left,
                y: event.clientY - chartRect.top,
                // Add dual values for tooltip
                moneyIn: (originalPoint || d).inflow,
                moneyOut: (originalPoint || d).outflow,
                netFlow: (originalPoint || d).value
              } as CashFlowDataPoint & { x: number; y: number }
              console.log('DUAL BAR CHART TOOLTIP:', pointWithPosition)
              onDataPointHover?.(pointWithPosition)
            }
          }, 50)
        })
        .on('mouseout', function() {
          console.log('DUAL BAR CHART MOUSEOUT')
          g.selectAll('.hover-background').remove()
          // React container handles tooltip hiding
        })
    }, 0)
  }, [chartInternals, data, onDataPointHover])

  return <D3BaseChart ref={svgRef} data={data} width={width} height={height} className={className} onDataPointHover={onDataPointHover as (point: ChartDataPoint | CashFlowDataPoint | null) => void} />
}
