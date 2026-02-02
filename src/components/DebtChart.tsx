import { useMemo } from 'react'
import { Group } from '@visx/group'
import { LinePath, Bar } from '@visx/shape'
import { scaleLinear } from '@visx/scale'
import { AxisLeft, AxisBottom } from '@visx/axis'
import { GridRows } from '@visx/grid'
import { curveMonotoneX } from '@visx/curve'
import type { YearResult } from '../lib/calculator'

interface DebtChartProps {
  data: YearResult[]
  width?: number
  height?: number
}

const margin = { top: 20, right: 50, bottom: 40, left: 60 }

export function DebtChart({ data, width = 600, height = 300 }: DebtChartProps) {
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Find cleared age (when debt reaches 0)
  const clearedAge = useMemo(() => {
    const cleared = data.find((d) => d.cleared || d.debtRemaining <= 0)
    return cleared ? cleared.age : null
  }, [data])

  // Filter data to stop at cleared age (include the cleared year)
  const chartData = useMemo(() => {
    if (clearedAge) {
      return data.filter((d) => d.age <= clearedAge)
    }
    return data
  }, [data, clearedAge])

  
  // Filter to every 2 years for bars (exclude studying years) + add cumulative interest
  const barData = useMemo(() => {
    let cumulativeInterest = 0
    // Calculate cumulative interest from all chartData (not just bar years)
    const withCumulative = chartData.map((d) => {
      cumulativeInterest += d.interestAdded
      return { ...d, cumulativeInterest }
    })
    // Then filter to every 2 years for display, excluding studying years
    return withCumulative.filter((d) => !d.isStudying && (d.age - 22) % 2 === 0)
  }, [chartData])

  // Fixed axis range 18-52, but data stops at cleared age
  const minAge = 18
  const maxAge = 52

  const xScale = useMemo(
    () =>
      scaleLinear({
        domain: [minAge, maxAge],
        range: [0, innerWidth - 25],  // Leave space for right axis
      }),
    [innerWidth, minAge, maxAge]
  )

  
  const maxDebt = useMemo(() => {
    return Math.max(...chartData.map((d) => d.debtRemaining), 50000)
  }, [chartData])

  const maxCumulative = useMemo(() => {
    let cumInterest = 0
    let max = 1000
    chartData.forEach((d) => {
      cumInterest += d.interestAdded
      max = Math.max(max, cumInterest, d.totalPaid)
    })
    return max
  }, [chartData])

  const yScaleDebt = useMemo(
    () =>
      scaleLinear({
        domain: [0, maxDebt * 1.1],
        range: [innerHeight, 0],
      }),
    [innerHeight, maxDebt]
  )

  const yScaleCumulative = useMemo(
    () =>
      scaleLinear({
        domain: [0, maxCumulative * 1.1],
        range: [innerHeight, 0],
      }),
    [innerHeight, maxCumulative]
  )

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        <GridRows
          scale={yScaleDebt}
          width={innerWidth}
          stroke="#374151"
          strokeOpacity={0.5}
          numTicks={5}
        />

        {/* Cumulative Interest + Paid bars (grouped) */}
        {barData.map((d) => {
          const barWidth = 8
          const barX = xScale(d.age) - barWidth - 1 // Position using linear scale
          const interestHeight = innerHeight - yScaleCumulative(d.cumulativeInterest)
          const paidHeight = innerHeight - yScaleCumulative(d.totalPaid)
          return (
            <g key={`bars-${d.age}`}>
              {/* Cumulative Interest bar (left) */}
              <Bar
                x={barX}
                y={yScaleCumulative(d.cumulativeInterest)}
                width={barWidth}
                height={interestHeight}
                fill="#f59e0b"
                opacity={0.7}
                rx={2}
                style={{ transition: 'all 0.5s ease-out' }}
              />
              {/* Cumulative Paid bar (right) */}
              <Bar
                x={barX + barWidth + 2}
                y={yScaleCumulative(d.totalPaid)}
                width={barWidth}
                height={paidHeight}
                fill="#22c55e"
                opacity={0.7}
                rx={2}
                style={{ transition: 'all 0.5s ease-out' }}
              />
            </g>
          )
        })}

        {/* Debt line */}
        <LinePath
          data={chartData}
          x={(d) => xScale(d.age)}
          y={(d) => yScaleDebt(d.debtRemaining)}
          stroke="#ef4444"
          strokeWidth={2.5}
          curve={curveMonotoneX}
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="debt-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.05} />
          </linearGradient>
        </defs>

        {/* Left axis - Debt */}
        <AxisLeft
          scale={yScaleDebt}
          stroke="#ef4444"
          tickStroke="#ef4444"
          tickLabelProps={() => ({
            fill: '#ef4444',
            fontSize: 11,
            textAnchor: 'end',
            dy: '0.33em',
          })}
          tickFormat={(v) => `£${((v as number) / 1000).toFixed(0)}k`}
          numTicks={4}
        />

        {/* Right axis - Cumulative */}
        <AxisLeft
          scale={yScaleCumulative}
          left={innerWidth}
          stroke="#9ca3af"
          tickStroke="#9ca3af"
          tickLabelProps={() => ({
            fill: '#9ca3af',
            fontSize: 11,
            textAnchor: 'start',
            dx: 14,
            dy: '0.33em',
          })}
          tickFormat={(v) => `£${((v as number) / 1000).toFixed(0)}k`}
          numTicks={3}
        />

        <AxisBottom
          top={innerHeight}
          scale={xScale}
          stroke="#6b7280"
          tickStroke="#6b7280"
          tickLabelProps={() => ({
            fill: '#9ca3af',
            fontSize: 11,
            textAnchor: 'middle',
          })}
          tickValues={[18, 22, 27, 32, 37, 42, 47, 52].filter(v => v >= minAge && v <= maxAge)}
          tickFormat={(v) => `${v}`}
        />

        {/* Legend */}
        <Group top={-10}>
          <circle cx={innerWidth - 260} cy={0} r={4} fill="#ef4444" />
          <text x={innerWidth - 252} y={4} fill="#ef4444" fontSize={10}>
            Debt
          </text>
          <rect x={innerWidth - 180} y={-4} width={8} height={8} fill="#f59e0b" opacity={0.7} rx={1} />
          <text x={innerWidth - 168} y={4} fill="#f59e0b" fontSize={10}>
            Tot. Interest
          </text>
          <rect x={innerWidth - 80} y={-4} width={8} height={8} fill="#22c55e" opacity={0.7} rx={1} />
          <text x={innerWidth - 68} y={4} fill="#22c55e" fontSize={10}>
            Tot. Paid
          </text>
        </Group>
      </Group>
    </svg>
  )
}
