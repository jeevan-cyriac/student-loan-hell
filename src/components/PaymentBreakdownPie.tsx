import { Group } from '@visx/group'
import { Pie } from '@visx/shape'
import type { LoanSummary } from '../lib/calculator'

interface PaymentBreakdownPieProps {
  summary: LoanSummary
  initialDebt: number
  width?: number
  height?: number
}

export function PaymentBreakdownPie({
  summary,
  initialDebt,
  width = 200,
  height = 170,
}: PaymentBreakdownPieProps) {
  const centerX = width / 2
  const centerY = height / 2 - 5
  const radius = Math.min(width, height) / 2 - 25

  // Calculate breakdown - only principal vs interest
  const principalRepaid = Math.min(summary.totalPaid, initialDebt)
  const interestPaid = Math.max(0, summary.totalPaid - principalRepaid)

  const total = principalRepaid + interestPaid

  const data = [
    { label: 'Principal', value: principalRepaid, color: '#22c55e', percent: (principalRepaid / total) * 100 },
    { label: 'Interest', value: interestPaid, color: '#ef4444', percent: (interestPaid / total) * 100 },
  ]

  return (
    <svg width={width} height={height}>
      <Group top={centerY} left={centerX}>
        <Pie
          data={data}
          pieValue={(d) => d.value}
          outerRadius={radius}
          innerRadius={radius * 0.55}
          padAngle={0.02}
        >
          {(pie) =>
            pie.arcs.map((arc, i) => {
              const [centroidX, centroidY] = pie.path.centroid(arc)
              const d = data[i]
              return (
                <g key={d.label}>
                  <path d={pie.path(arc) || ''} fill={d.color} />
                  {d.percent > 15 && (
                    <text
                      x={centroidX}
                      y={centroidY}
                      textAnchor="middle"
                      fill="white"
                      fontSize={11}
                      fontWeight="bold"
                    >
                      {d.percent.toFixed(0)}%
                    </text>
                  )}
                </g>
              )
            })
          }
        </Pie>

        {/* Center text */}
        <text textAnchor="middle" fill="#fff" fontSize={13} fontWeight="bold" dy="-0.3em">
          £{(summary.totalPaid / 1000).toFixed(0)}k
        </text>
        <text textAnchor="middle" fill="#9ca3af" fontSize={11} dy="1em">
          total paid
        </text>
      </Group>

      {/* Legend - horizontal at bottom */}
      <Group top={height - 18} left={width / 2 - 60}>
        <rect x={0} y={0} width={10} height={10} fill="#22c55e" rx={2} />
        <text x={14} y={9} fill="#9ca3af" fontSize={11}>Principal</text>
        <rect x={70} y={0} width={10} height={10} fill="#ef4444" rx={2} />
        <text x={84} y={9} fill="#9ca3af" fontSize={11}>Interest</text>
      </Group>
    </svg>
  )
}
