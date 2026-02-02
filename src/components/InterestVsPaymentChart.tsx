import { useMemo } from 'react'
import { Group } from '@visx/group'
import { Bar } from '@visx/shape'
import { scaleBand, scaleLinear } from '@visx/scale'
import type { YearResult } from '../lib/calculator'

interface InterestVsPaymentChartProps {
  data: YearResult[]
  width?: number
  height?: number
}

const margin = { top: 25, right: 10, bottom: 25, left: 10 }

export function InterestVsPaymentChart({
  data,
  width = 200,
  height = 170,
}: InterestVsPaymentChartProps) {
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Sample every 5 years
  const sampledData = useMemo(() => {
    return data.filter((d) => (d.age - 22) % 5 === 0 || d.age === 22)
  }, [data])

  const xScale = useMemo(
    () =>
      scaleBand({
        domain: sampledData.map((d) => d.age),
        range: [0, innerWidth],
        padding: 0.15,
      }),
    [innerWidth, sampledData]
  )

  const maxVal = useMemo(() => {
    return Math.max(...sampledData.map((d) => Math.max(d.interestAdded, d.repayment)))
  }, [sampledData])

  const yScale = useMemo(
    () =>
      scaleLinear({
        domain: [0, maxVal * 1.1],
        range: [innerHeight, 0],
      }),
    [innerHeight, maxVal]
  )

  const barWidth = xScale.bandwidth() / 2 - 1

  // Find first year where payment > interest
  const turningPoint = sampledData.find((d) => d.repayment > d.interestAdded)

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        {sampledData.map((d) => {
          const x = xScale(d.age) ?? 0
          const interestHeight = innerHeight - yScale(d.interestAdded)
          const paymentHeight = innerHeight - yScale(d.repayment)
          const winning = d.repayment > d.interestAdded

          return (
            <g key={d.age}>
              {/* Interest bar */}
              <Bar
                x={x}
                y={yScale(d.interestAdded)}
                width={barWidth}
                height={interestHeight}
                fill="#ef4444"
                opacity={0.85}
                rx={2}
              />
              {/* Payment bar */}
              <Bar
                x={x + barWidth + 2}
                y={yScale(d.repayment)}
                width={barWidth}
                height={paymentHeight}
                fill={winning ? '#22c55e' : '#6b7280'}
                opacity={0.85}
                rx={2}
              />
              {/* Age label */}
              <text
                x={x + xScale.bandwidth() / 2}
                y={innerHeight + 14}
                textAnchor="middle"
                fill="#9ca3af"
                fontSize={11}
              >
                {d.age}
              </text>
            </g>
          )
        })}

        {/* Legend */}
        <Group top={-18}>
          <rect x={0} y={0} width={10} height={10} fill="#ef4444" rx={1} />
          <text x={13} y={8} fill="#ef4444" fontSize={11}>Interest</text>
          <rect x={60} y={0} width={10} height={10} fill="#22c55e" rx={1} />
          <text x={73} y={8} fill="#22c55e" fontSize={11}>Payment</text>
        </Group>

        {/* Turning point indicator */}
        {turningPoint && (
          <text
            x={innerWidth}
            y={-5}
            textAnchor="end"
            fill="#22c55e"
            fontSize={10}
          >
            Wins @{turningPoint.age}
          </text>
        )}
      </Group>
    </svg>
  )
}
