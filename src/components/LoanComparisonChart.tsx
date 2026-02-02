import { Group } from '@visx/group'
import { Bar } from '@visx/shape'
import { scaleLinear, scaleBand } from '@visx/scale'
import type { LoanSummary } from '../lib/calculator'

interface LoanComparisonChartProps {
  summary: LoanSummary
  initialDebt: number
  width?: number
  height?: number
}

const margin = { top: 30, right: 100, bottom: 30, left: 5 }

export function LoanComparisonChart({
  summary,
  initialDebt,
  width = 200,
  height = 170,
}: LoanComparisonChartProps) {
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Total obligation = what you paid + what was written off
  const totalObligation = summary.totalPaid + summary.amountWrittenOff

  const xScale = scaleBand({
    domain: ['Loan', 'Paid'],
    range: [0, innerWidth],
    padding: 0.15,
  })

  const maxValue = Math.max(initialDebt, totalObligation)
  const yScale = scaleLinear({
    domain: [0, maxValue * 1.1],
    range: [innerHeight, 0],
  })

  const barWidth = xScale.bandwidth()

  // Heights for stacked bar
  const paidHeight = innerHeight - yScale(summary.totalPaid)
  const writtenOffHeight = summary.amountWrittenOff > 0
    ? yScale(summary.totalPaid) - yScale(totalObligation)
    : 0

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
      <Group left={margin.left} top={margin.top}>
        {/* Original Loan Bar */}
        <Bar
          x={xScale('Loan') ?? 0}
          y={yScale(initialDebt)}
          width={barWidth}
          height={innerHeight - yScale(initialDebt)}
          fill="#6b7280"
          rx={4}
          style={{ transition: 'all 0.5s ease-out' }}
        />
        <text
          x={(xScale('Loan') ?? 0) + barWidth / 2}
          y={innerHeight + 16}
          textAnchor="middle"
          fill="#9ca3af"
          fontSize={13}
        >
          Loan
        </text>

        {/* Paid Bar - Stacked: Paid (bottom) + Written Off (top) */}
        {/* Paid portion */}
        <Bar
          x={xScale('Paid') ?? 0}
          y={yScale(summary.totalPaid)}
          width={barWidth}
          height={paidHeight}
          fill={summary.isGoodDeal ? '#22c55e' : '#ef4444'}
          rx={summary.amountWrittenOff > 0 ? 0 : 4}
          style={{ transition: 'all 0.5s ease-out' }}
        />

        {/* Written off portion (stacked on top) */}
        {summary.amountWrittenOff > 0 && (
          <Bar
            x={xScale('Paid') ?? 0}
            y={yScale(totalObligation)}
            width={barWidth}
            height={writtenOffHeight}
            fill="#8b5cf6"
            rx={4}
            style={{ transition: 'all 0.5s ease-out' }}
          />
        )}

        <text
          x={(xScale('Paid') ?? 0) + barWidth / 2}
          y={innerHeight + 16}
          textAnchor="middle"
          fill="#9ca3af"
          fontSize={13}
        >
          Paid
        </text>

        {/* Loan label on top of grey bar */}
        <text
          x={(xScale('Loan') ?? 0) + barWidth / 2}
          y={yScale(initialDebt) - 6}
          textAnchor="middle"
          fill="#9ca3af"
          fontSize={13}
          fontWeight="bold"
        >
          £{(initialDebt / 1000).toFixed(0)}k
        </text>

        {/* Paid label with multiplier below */}
        <text
          x={innerWidth + 6}
          y={Math.min(yScale(summary.totalPaid / 2), innerHeight - 30)}
          fill={summary.isGoodDeal ? '#22c55e' : '#ef4444'}
          fontSize={14}
          fontWeight="bold"
          dominantBaseline="middle"
        >
          £{(summary.totalPaid / 1000).toFixed(0)}k paid
        </text>
        <text
          x={innerWidth + 6}
          y={Math.min(yScale(summary.totalPaid / 2), innerHeight - 30) + 16}
          fill={summary.isGoodDeal ? '#22c55e' : '#ef4444'}
          fontSize={13}
          dominantBaseline="middle"
        >
          ({(summary.totalPaid / initialDebt).toFixed(1)}x)
        </text>

        {summary.amountWrittenOff > 0 && (
          <text
            x={innerWidth + 6}
            y={Math.max(yScale(totalObligation - summary.amountWrittenOff / 2), 10)}
            fill="#8b5cf6"
            fontSize={13}
            dominantBaseline="middle"
          >
            £{(summary.amountWrittenOff / 1000).toFixed(0)}k written off
          </text>
        )}
      </Group>
    </svg>
  )
}
