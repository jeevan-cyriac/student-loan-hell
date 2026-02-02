import { useMemo } from 'react'
import { Group } from '@visx/group'
import { LinePath, Circle } from '@visx/shape'
import { scaleLinear } from '@visx/scale'
import { AxisLeft, AxisBottom } from '@visx/axis'
import { GridRows } from '@visx/grid'
import { useDrag } from '@visx/drag'

interface Milestone {
  age: number
  salary: number
}

interface SalaryChartProps {
  milestones: Milestone[]
  onMilestoneChange: (index: number, salary: number) => void
  width?: number
  height?: number
}

const margin = { top: 20, right: 30, bottom: 50, left: 60 }

export function SalaryChart({
  milestones,
  onMilestoneChange,
  width = 600,
  height = 300,
}: SalaryChartProps) {
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  const xScale = useMemo(
    () =>
      scaleLinear({
        domain: [22, 52],
        range: [0, innerWidth],
      }),
    [innerWidth]
  )

  const yScale = useMemo(
    () =>
      scaleLinear({
        domain: [0, 150000],
        range: [innerHeight, 0],
      }),
    [innerHeight]
  )

  // Generate interpolated line points
  const linePoints = useMemo(() => {
    const points: { age: number; salary: number }[] = []
    const sorted = [...milestones].sort((a, b) => a.age - b.age)

    for (let age = 22; age <= 52; age++) {
      let salary: number
      if (age <= sorted[0].age) {
        salary = sorted[0].salary
      } else if (age >= sorted[sorted.length - 1].age) {
        salary = sorted[sorted.length - 1].salary
      } else {
        for (let i = 0; i < sorted.length - 1; i++) {
          if (age >= sorted[i].age && age < sorted[i + 1].age) {
            const t = (age - sorted[i].age) / (sorted[i + 1].age - sorted[i].age)
            salary = sorted[i].salary + t * (sorted[i + 1].salary - sorted[i].salary)
            break
          }
        }
      }
      points.push({ age, salary: salary! })
    }
    return points
  }, [milestones])

  return (
    <div className="relative">
      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          <GridRows
            scale={yScale}
            width={innerWidth}
            stroke="#374151"
            strokeOpacity={0.5}
            numTicks={5}
          />

          {/* Threshold line */}
          <line
            x1={0}
            x2={innerWidth}
            y1={yScale(27295)}
            y2={yScale(27295)}
            stroke="#ef4444"
            strokeDasharray="4,4"
            strokeWidth={1}
          />
          <text
            x={innerWidth - 5}
            y={yScale(27295) + 12}
            fill="#ef4444"
            fontSize={10}
            textAnchor="end"
          >
            Threshold £27,295
          </text>

          {/* Salary line */}
          <LinePath
            data={linePoints}
            x={(d) => xScale(d.age)}
            y={(d) => yScale(d.salary)}
            stroke="#22c55e"
            strokeWidth={2}
          />

          {/* Draggable points */}
          {milestones.map((m, i) => (
            <DraggablePoint
              key={i}
              index={i}
              cx={xScale(m.age)}
              cy={yScale(m.salary)}
              yScale={yScale}
              onDrag={(newSalary) => onMilestoneChange(i, newSalary)}
            />
          ))}

          <AxisLeft
            scale={yScale}
            stroke="#6b7280"
            tickStroke="#6b7280"
            tickLabelProps={() => ({
              fill: '#9ca3af',
              fontSize: 11,
              textAnchor: 'end',
              dy: '0.33em',
            })}
            tickFormat={(v) => `£${(v as number) / 1000}k`}
            numTicks={4}
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
            tickValues={[22, 27, 32, 37, 42, 47, 52]}
            tickFormat={(v) => `${v}`}
          />
        </Group>
      </svg>
      <div className="text-center text-sm text-gray-400 mt-2">
        Drag points to adjust salary at each age
      </div>
    </div>
  )
}

interface DraggablePointProps {
  index: number
  cx: number
  cy: number
  yScale: ReturnType<typeof scaleLinear<number>>
  onDrag: (newSalary: number) => void
}

function DraggablePoint({ cx, cy, yScale, onDrag }: DraggablePointProps) {
  const { dragStart, dragEnd, dragMove, isDragging, dy } = useDrag({
    onDragMove: () => {},
    onDragEnd: ({ dy }) => {
      const newY = cy + dy
      const newSalary = yScale.invert(newY)
      const clamped = Math.max(0, Math.min(150000, newSalary))
      onDrag(Math.round(clamped / 1000) * 1000) // Round to nearest £1000
    },
  })

  const currentY = isDragging ? cy + dy : cy

  return (
    <Circle
      cx={cx}
      cy={currentY}
      r={isDragging ? 10 : 8}
      fill={isDragging ? '#16a34a' : '#22c55e'}
      stroke="#fff"
      strokeWidth={2}
      style={{ cursor: 'ns-resize' }}
      onMouseDown={dragStart}
      onMouseUp={dragEnd}
      onMouseMove={dragMove}
      onTouchStart={dragStart}
      onTouchEnd={dragEnd}
      onTouchMove={dragMove}
    />
  )
}
