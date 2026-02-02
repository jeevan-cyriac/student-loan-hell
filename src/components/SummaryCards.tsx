import type { LoanSummary } from '../lib/calculator'

interface SummaryCardsProps {
  summary: LoanSummary
  initialDebt: number
}

export function SummaryCards({ summary, initialDebt }: SummaryCardsProps) {
  const multiple = summary.totalPaid / initialDebt
  const interestRatio = summary.totalInterest / initialDebt

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Verdict Card */}
      <div
        className={`p-3 rounded-lg border ${
          summary.isGoodDeal
            ? 'bg-green-900/40 border-green-600'
            : 'bg-red-900/40 border-red-600'
        }`}
      >
        <div className="text-xs text-gray-400 uppercase tracking-wide">Verdict</div>
        <div className="text-xl font-bold mt-1">
          {summary.isGoodDeal ? '😇 Blessing' : '😈 Curse'}
        </div>
        <div className="text-xs text-gray-300 mt-1">
          {summary.clearedAge ? `Cleared @ ${summary.clearedAge}` : 'Never cleared'}
        </div>
      </div>

      {/* Total Paid Card */}
      <div className="p-3 rounded-lg border bg-gray-800/60 border-gray-700">
        <div className="text-xs text-gray-400 uppercase tracking-wide">You Pay</div>
        <div className="text-xl font-bold text-white mt-1">
          £{(summary.totalPaid / 1000).toFixed(0)}k
        </div>
        <div className="text-xs text-gray-400 mt-1">
          <span className={multiple > 1.25 ? 'text-red-400' : 'text-green-400'}>
            {multiple.toFixed(1)}x
          </span> original
        </div>
      </div>

      {/* Interest Card */}
      <div className="p-3 rounded-lg border bg-gray-800/60 border-gray-700">
        <div className="text-xs text-gray-400 uppercase tracking-wide">Interest</div>
        <div className="text-xl font-bold text-amber-400 mt-1">
          £{(summary.totalInterest / 1000).toFixed(0)}k
        </div>
        <div className="text-xs text-gray-400 mt-1">
          +{(interestRatio * 100).toFixed(0)}% of loan
        </div>
      </div>

      {/* Written Off / Cleared Card */}
      <div className="p-3 rounded-lg border bg-gray-800/60 border-gray-700">
        <div className="text-xs text-gray-400 uppercase tracking-wide">
          {summary.clearedAge ? 'Cleared Age' : 'Written Off'}
        </div>
        <div className="text-xl font-bold mt-1">
          {summary.clearedAge ? (
            <span className="text-green-400">{summary.clearedAge}</span>
          ) : (
            <span className="text-purple-400">£{(summary.amountWrittenOff / 1000).toFixed(0)}k</span>
          )}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {summary.clearedAge ? 'Debt free! 🎉' : 'After 30 years'}
        </div>
      </div>
    </div>
  )
}
