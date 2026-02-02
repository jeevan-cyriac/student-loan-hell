import type { YearResult } from '../lib/calculator'

interface YearTableProps {
  data: YearResult[]
  initialDebt: number
}

function formatK(value: number): string {
  return `£${(value / 1000).toFixed(1)}k`
}

export function YearTable({ data, initialDebt }: YearTableProps) {
  // Show all studying years + every 3 years after graduation + cleared year + age 52
  const clearedAge = data.find((d) => d.cleared)?.age
  const lastAge = data[data.length - 1]?.age
  const filteredData = data.filter(
    (d) => d.isStudying || (d.age - 22) % 3 === 0 || d.age === clearedAge || d.age === 52 || d.age === lastAge
  )

  const maxTotalPaid = Math.max(...data.map((d) => d.totalPaid), initialDebt)

  // Find when we pass the original loan amount
  const passedOriginalAge = data.find((d) => d.totalPaid >= initialDebt)?.age

  // Calculate totals
  const totalSalary = data.reduce((sum, d) => sum + d.salary, 0)
  const totalInterest = data.reduce((sum, d) => sum + d.interestAdded, 0)
  const totalRepayments = data.reduce((sum, d) => sum + d.repayment, 0)
  const totalPaid = data[data.length - 1]?.totalPaid ?? 0

  return (
    <div className="overflow-y-auto max-h-[720px]">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-gray-800">
          <tr className="border-b border-gray-700 text-gray-400">
            <th className="text-left py-1 px-1">Year</th>
            <th className="text-left py-1 px-1">Age</th>
            <th className="text-right py-1 px-1">Salary</th>
            <th className="text-right py-1 px-1">Interest</th>
            <th className="text-right py-1 px-1">Paid/mo</th>
            <th className="text-right py-1 px-1">Paid/yr</th>
            <th className="text-right py-1 px-1 w-24">Total Paid</th>
            <th className="text-right py-1 px-1">Debt</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row) => {
            const progressPercent = (row.totalPaid / maxTotalPaid) * 100
            const passedOriginal = row.totalPaid >= initialDebt
            const justPassedOriginal = row.age === passedOriginalAge
            const monthlyPayment = Math.round(row.repayment / 12)

            return (
              <tr
                key={`${row.calendarYear}-${row.age}`}
                className={`border-b border-gray-800/50 ${
                  row.cleared ? 'bg-green-900/20' : ''
                } ${justPassedOriginal ? 'bg-amber-900/30' : ''} ${
                  row.isStudying ? 'bg-blue-900/20' : ''
                }`}
              >
                <td className="py-1.5 px-1 text-gray-500">{row.calendarYear}</td>
                <td className="py-1.5 px-1">
                  {row.age}
                  {row.cleared && <span className="ml-1 text-green-400">✓</span>}
                  {row.isStudying && <span className="ml-1 text-blue-400 text-xs">📚</span>}
                </td>
                <td className="text-right py-1.5 px-1">
                  {row.isStudying ? <span className="text-gray-500">-</span> : formatK(row.salary)}
                </td>
                <td className="text-right py-1.5 px-1 text-red-400">
                  +{formatK(row.interestAdded)}
                </td>
                <td className="text-right py-1.5 px-1 text-green-400/70">
                  {monthlyPayment > 0 ? `£${monthlyPayment}` : '-'}
                </td>
                <td className="text-right py-1.5 px-1 text-green-400">
                  {row.repayment > 0 ? formatK(row.repayment) : '-'}
                </td>
                <td className="text-right py-1.5 px-1 relative overflow-hidden">
                  {/* Progress bar background - right to left */}
                  {!row.isStudying && (
                    <div
                      className={`absolute right-0 top-0 h-full rounded-sm ${
                        passedOriginal ? 'bg-red-600/40' : 'bg-blue-600/30'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  )}
                  <span className={`relative font-medium ${passedOriginal && !row.isStudying ? 'text-red-300' : ''}`}>
                    {row.isStudying ? '-' : formatK(row.totalPaid)}
                    {justPassedOriginal && <span className="ml-1 text-amber-400">*</span>}
                  </span>
                </td>
                <td className="text-right py-1.5 px-1">
                  {row.cleared ? (
                    <span className="text-green-400">CLEARED</span>
                  ) : (
                    formatK(row.debtRemaining)
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot className="sticky bottom-0 bg-gray-800 border-t border-gray-600">
          <tr className="font-semibold">
            <td className="py-2 px-1"></td>
            <td className="py-2 px-1 text-gray-400">Total</td>
            <td className="text-right py-2 px-1">{formatK(totalSalary)}</td>
            <td className="text-right py-2 px-1 text-red-400">{formatK(totalInterest)}</td>
            <td className="text-right py-2 px-1 text-green-400">{formatK(totalRepayments)}</td>
            <td className="text-right py-2 px-1"></td>
            <td className="text-right py-2 px-1"></td>
            <td className="text-right py-2 px-1"></td>
          </tr>
        </tfoot>
      </table>
      <div className="text-xs mt-2 px-1 space-y-1">
        {passedOriginalAge && (
          <div className="text-amber-400">
            * Age {passedOriginalAge}: You've paid more than the original £{(initialDebt/1000).toFixed(0)}k loan
          </div>
        )}
        <div className="text-gray-300">
          <span className="text-red-400">Interest: £{(totalInterest/1000).toFixed(0)}k</span> over {data.length} years
          {totalPaid > initialDebt && <span> • <span className="text-amber-400">{(totalPaid/initialDebt).toFixed(1)}x</span> original loan</span>}
          {data[data.length-1]?.debtRemaining > 0 && <span> • <span className="text-purple-400">£{(data[data.length-1].debtRemaining/1000).toFixed(0)}k</span> written off</span>}
        </div>
      </div>
    </div>
  )
}
