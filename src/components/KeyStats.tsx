import type { LoanSummary, YearResult } from '../lib/calculator'

interface KeyStatsProps {
  summary: LoanSummary
  data: YearResult[]
  initialDebt: number
  width?: number
  height?: number
}

export function KeyStats({
  summary,
  data,
  initialDebt,
}: KeyStatsProps) {
  // Calculate useful stats
  const yearsWithPayments = data.filter((d) => d.repayment > 0).length
  const avgMonthlyPayment = yearsWithPayments > 0
    ? Math.round(summary.totalPaid / yearsWithPayments / 12)
    : 0
  const maxMonthlyPayment = Math.round(Math.max(...data.map((d) => d.repayment)) / 12)

  // Peak debt
  const peakDebt = Math.max(...data.map((d) => d.debtRemaining))
  const peakDebtAge = data.find((d) => d.debtRemaining === peakDebt)?.age ?? 0

  // Effective "tax rate" at peak salary
  const peakSalary = Math.max(...data.map((d) => d.salary))
  const peakPayment = data.find((d) => d.salary === peakSalary)?.repayment ?? 0
  const effectiveRate = peakSalary > 0 ? (peakPayment / peakSalary) * 100 : 0

  // Cost per £1 borrowed
  const costPerPound = summary.totalPaid / initialDebt

  return (
    <div className="flex flex-col gap-2 text-xs h-full justify-center">
      <div className="flex justify-between">
        <span className="text-gray-400">Years paying</span>
        <span className="font-bold text-white">{yearsWithPayments} yrs</span>
      </div>

      <div className="flex justify-between">
        <span className="text-gray-400">Avg monthly</span>
        <span className="font-bold text-green-400">£{avgMonthlyPayment}</span>
      </div>

      <div className="flex justify-between">
        <span className="text-gray-400">Peak monthly</span>
        <span className="font-bold text-green-400">£{maxMonthlyPayment}</span>
      </div>

      <div className="flex justify-between">
        <span className="text-gray-400">Peak debt</span>
        <span className="font-bold text-red-400">£{(peakDebt / 1000).toFixed(0)}k <span className="text-gray-500 font-normal">@{peakDebtAge}</span></span>
      </div>

      <div className="flex justify-between">
        <span className="text-gray-400">Effective rate</span>
        <span className="font-bold text-amber-400">{effectiveRate.toFixed(1)}%</span>
      </div>

      <div className="flex justify-between border-t border-gray-700 pt-2 mt-1">
        <span className="text-gray-400">Cost per £1</span>
        <span className={`font-bold ${costPerPound > 1 ? 'text-red-400' : 'text-green-400'}`}>
          £{costPerPound.toFixed(2)}
        </span>
      </div>
    </div>
  )
}
