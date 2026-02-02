import { useMemo } from 'react'
import { Group } from '@visx/group'
import { Bar } from '@visx/shape'
import { scaleBand, scaleLinear } from '@visx/scale'
import { AxisLeft } from '@visx/axis'
import type { YearResult } from '../lib/calculator'

interface MonthlyPaymentChartProps {
  data: YearResult[]
  width?: number
  height?: number
}

const margin = { top: 20, right: 10, bottom: 25, left: 35 }

export function MonthlyPaymentChart({
  data,
  width = 200,
  height = 170,
}: MonthlyPaymentChartProps) {
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Sample every 3 years for cleaner bars
  const sampledData = useMemo(() => {
    return data.filter((d) => (d.age - 22) % 3 === 0)
  }, [data])

  const xScale = useMemo(
    () =>
      scaleBand({
        domain: sampledData.map((d) => d.age),
        range: [0, innerWidth],
        padding: 0.2,
      }),
    [innerWidth, sampledData]
  )

  const maxPayment = useMemo(() => {
    const max = Math.max(...sampledData.map((d) => d.repayment / 12))
    return max > 0 ? max : 100 // fallback for zero payments
  }, [sampledData])

  const yScale = useMemo(
    () =>
      scaleLinear({
        domain: [0, maxPayment * 1.15],
        range: [innerHeight, 0],
      }),
    [innerHeight, maxPayment]
  )

  const hasAnyPayments = sampledData.some((d) => d.repayment > 0)

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        {hasAnyPayments ? (
          <>
            {sampledData.map((d) => {
              const monthlyPayment = d.repayment / 12
              const barHeight = innerHeight - yScale(monthlyPayment)
              const barX = xScale(d.age) ?? 0

              return (
                <g key={d.age}>
                  <Bar
                    x={barX}
                    y={yScale(monthlyPayment)}
                    width={xScale.bandwidth()}
                    height={barHeight}
                    fill={monthlyPayment > 0 ? '#22c55e' : '#374151'}
                    rx={2}
                  />
                  {/* Age label */}
                  <text
                    x={barX + xScale.bandwidth() / 2}
                    y={innerHeight + 14}
                    textAnchor="middle"
                    fill="#9ca3af"
                    fontSize={10}
                  >
                    {d.age}
                  </text>
                </g>
              )
            })}

            <AxisLeft
              scale={yScale}
              stroke="#6b7280"
              tickStroke="#6b7280"
              tickLabelProps={() => ({
                fill: '#9ca3af',
                fontSize: 10,
                textAnchor: 'end',
                dy: '0.33em',
              })}
              tickFormat={(v) => `£${(v as number).toFixed(0)}`}
              numTicks={4}
            />
          </>
        ) : (
          // No payments message
          <text
            x={innerWidth / 2}
            y={innerHeight / 2}
            textAnchor="middle"
            fill="#9ca3af"
            fontSize={11}
          >
            Below threshold
          </text>
        )}

        {/* Title showing current/max monthly */}
        {hasAnyPayments && (
          <text
            x={innerWidth / 2}
            y={-8}
            textAnchor="middle"
            fill="#22c55e"
            fontSize={10}
            fontWeight="bold"
          >
            Up to £{Math.round(maxPayment)}/mo
          </text>
        )}
      </Group>
    </svg>
  )
}
