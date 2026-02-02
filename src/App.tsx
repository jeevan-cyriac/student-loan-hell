import { useState, useMemo } from 'react'
import { SalaryChart } from './components/SalaryChart'
import { DebtChart } from './components/DebtChart'
import { YearTable } from './components/YearTable'
import { LoanComparisonChart } from './components/LoanComparisonChart'
import { PaymentBreakdownPie } from './components/PaymentBreakdownPie'
import { TutorialTip } from './components/Tutorial'
import { calculateLoanRepayment, getPlanConfig, getTypicalLoanAmount, getTuitionForYear, type PlanType } from './lib/calculator'
import { CAREER_TEMPLATES } from './lib/careers'

const PLANS = [
  { id: 'plan1', name: 'Plan 1', years: 'Pre-2012' },
  { id: 'plan2', name: 'Plan 2', years: '2012-2023' },
  { id: 'plan4', name: 'Plan 4', years: 'Scotland' },
  { id: 'plan5', name: 'Plan 5', years: '2023+' },
]

const START_YEARS = Array.from({ length: 29 }, (_, i) => 1998 + i) // 1998-2026

// Config
const ANIMATIONS_ENABLED = true

function App() {
  const [darkMode, setDarkMode] = useState(true)
  const animations = ANIMATIONS_ENABLED
  const [selectedPlan, setSelectedPlan] = useState('plan2')
  const [startYear, setStartYear] = useState(2013)
  const [courseDuration, setCourseDuration] = useState(4)
  const [selectedCareer, setSelectedCareer] = useState<string>('nursing')
  const [loanAmount, setLoanAmount] = useState(44000)
  const [milestones, setMilestones] = useState<Array<{ age: number; salary: number }>>(
    CAREER_TEMPLATES.find((c) => c.id === 'nursing')?.milestones || []
  )
  const [tutorialMode, setTutorialMode] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(false)

  // Update loan amount when start year changes
  const handleStartYearChange = (year: number) => {
    setStartYear(year)
    setLoanAmount(getTypicalLoanAmount(year))
  }

  const handleCareerChange = (careerId: string) => {
    setSelectedCareer(careerId)
    const career = CAREER_TEMPLATES.find((c) => c.id === careerId)
    if (career) {
      setMilestones([...career.milestones])
    }
  }

  const handleMilestoneChange = (index: number, newSalary: number) => {
    setMilestones((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], salary: newSalary }
      return updated
    })
  }

  const handleInputChange = (index: number, value: string) => {
    const salary = parseInt(value.replace(/\D/g, ''), 10)
    if (!isNaN(salary)) {
      handleMilestoneChange(index, Math.min(150000, Math.max(0, salary)))
    }
  }

  const handleAgeChange = (index: number, newAge: number) => {
    setMilestones((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], age: Math.min(65, Math.max(18, newAge)) }
      return updated.sort((a, b) => a.age - b.age)
    })
  }

  const addMilestone = () => {
    if (milestones.length >= 7) return
    const lastAge = milestones[milestones.length - 1]?.age ?? 22
    const lastSalary = milestones[milestones.length - 1]?.salary ?? 30000
    setMilestones((prev) => [...prev, { age: Math.min(65, lastAge + 5), salary: lastSalary + 10000 }])
  }

  const removeMilestone = (index: number) => {
    if (milestones.length <= 1) return
    setMilestones((prev) => prev.filter((_, i) => i !== index))
  }

  const planConfig = useMemo(() => getPlanConfig(selectedPlan as PlanType), [selectedPlan])

  const result = useMemo(() => {
    return calculateLoanRepayment(loanAmount, milestones, 22, startYear, selectedPlan as PlanType, courseDuration)
  }, [loanAmount, milestones, startYear, selectedPlan, courseDuration])

  // Calculate all careers for comparison
  const careerComparison = useMemo(() => {
    return CAREER_TEMPLATES.map((career) => {
      const res = calculateLoanRepayment(loanAmount, career.milestones, 22, startYear, selectedPlan as PlanType, courseDuration)
      return {
        id: career.id,
        name: career.name,
        emoji: career.emoji,
        totalPaid: res.summary.totalPaid,
        clearedAge: res.summary.clearedAge,
        amountWrittenOff: res.summary.amountWrittenOff,
        isGoodDeal: res.summary.isGoodDeal,
      }
    }).sort((a, b) => b.totalPaid - a.totalPaid) // Worst (highest paid) first
  }, [loanAmount, startYear, selectedPlan, courseDuration])

  return (
    <div className={`min-h-screen p-4 transition-colors ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
      <div className="max-w-[1400px] mx-auto">
        {/* Title - Centered */}
        <h1 className="text-2xl font-bold text-center mb-1">UK Student Loan - <span className="text-green-400">😇 Blessing</span> or <span className="text-red-400">😈 Curse</span>?</h1>
        <p className="text-sm text-gray-300 text-center mb-2 max-w-5xl mx-auto">
          <span className="text-amber-400 italic">"Just 9% above £27k, and it's written off after 30 years — isn't that great?"</span> What they don't say: interest keeps climbing whether you're paying £0 or £50/month, and you could pay 2-3× back over 30 years. <span className="text-white font-medium">Take a personal loan and clear it fast, or ride the 9% and hope for write-off?</span> This answers that.
        </p>
        <p className="text-xs text-center mb-4"><span className="text-green-400">😇 Blessing</span><span className="text-gray-400"> = student loan was cheaper than a 5% personal loan</span> <span className="text-gray-500 mx-2">•</span> <span className="text-red-400">😈 Curse</span><span className="text-gray-400"> = you'd have paid less borrowing elsewhere</span></p>

        {/* Controls Row */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
          {/* Plan Selector */}
          <TutorialTip label="Your loan plan" enabled={tutorialMode} position="bottom">
            <div className="flex gap-1">
              {PLANS.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`px-2 py-1 rounded text-sm transition-colors ${
                    selectedPlan === plan.id
                      ? 'bg-blue-600 text-white'
                      : darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {plan.name}
                </button>
              ))}
            </div>
          </TutorialTip>

          {/* Start Year */}
          <TutorialTip label="Uni start year" enabled={tutorialMode} position="bottom">
            <div className="flex items-center gap-2">
              <label className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Started</label>
              <select
                value={startYear}
                onChange={(e) => handleStartYearChange(Number(e.target.value))}
                className={`${darkMode ? 'bg-gray-700' : 'bg-gray-200'} border border-gray-600 rounded px-2 py-1 text-xs`}
              >
                {START_YEARS.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </TutorialTip>

          {/* Course Duration */}
          <TutorialTip label="Course length" enabled={tutorialMode} position="bottom">
            <div className="flex items-center gap-2">
              <label className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Course</label>
              <select
                value={courseDuration}
                onChange={(e) => setCourseDuration(Number(e.target.value))}
                className={`${darkMode ? 'bg-gray-700' : 'bg-gray-200'} border border-gray-600 rounded px-2 py-1 text-xs`}
              >
                <option value={3}>3 years</option>
                <option value={4}>4 years</option>
                <option value={5}>5 years</option>
                <option value={6}>6 years</option>
              </select>
            </div>
          </TutorialTip>

          {/* Loan Amount */}
          <TutorialTip label="Total borrowed" enabled={tutorialMode} position="bottom">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-400">Loan: £{loanAmount.toLocaleString()}</label>
              <input
                type="range"
                min={10000}
                max={80000}
                step={1000}
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-32 accent-green-500"
              />
            </div>
          </TutorialTip>

          {/* Tutorial Toggle & Day/Night Toggle */}
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setShowHowItWorks(true)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                darkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
              }`}
              title="How repayments work"
            >
              ❓
            </button>
            <button
              onClick={() => setTutorialMode(!tutorialMode)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                tutorialMode
                  ? 'bg-yellow-400 text-gray-900'
                  : darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
              }`}
              title={tutorialMode ? 'Hide hints' : 'Show hints'}
            >
              💡
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`px-2 py-1 rounded text-lg transition-colors ${
              darkMode
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          >
            {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Top: Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 mb-4">
          <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white shadow'} rounded-lg p-3 lg:col-span-5`}>
            <h2 className="text-xs font-semibold mb-2">Debt Over Time</h2>
            <DebtChart data={result.yearByYear} width={500} height={170} />
          </div>
          <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white shadow'} rounded-lg p-3 lg:col-span-3`}>
            <h2 className="text-sm font-semibold mb-2">Loan vs Repayment</h2>
            <LoanComparisonChart summary={result.summary} initialDebt={loanAmount} width={200} height={170} />
          </div>
          <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white shadow'} rounded-lg p-3 lg:col-span-2`}>
            <h2 className="text-xs font-semibold mb-2">What You Repay</h2>
            <PaymentBreakdownPie summary={result.summary} initialDebt={loanAmount} width={160} height={170} />
          </div>
          {/* KPI Boxes - Stacked */}
          <div className="flex flex-col gap-2 lg:col-span-2">
            {/* Top: Total Paid */}
            <div className={`${darkMode ? 'bg-gray-800/60 border border-gray-700' : 'bg-white border border-gray-200'} rounded-lg px-3 py-2 flex-1 ${animations ? 'transition-all duration-500' : ''}`}>
              <div className="text-[10px] text-gray-500 uppercase">You'll Pay</div>
              <div className="text-xl font-bold text-white">£{(result.summary.totalPaid / 1000).toFixed(0)}k</div>
              <div className="text-sm font-semibold text-gray-300">
                over {result.summary.clearedAge ? result.summary.clearedAge - 22 : planConfig.writeOffYears} years
              </div>
              <div className="text-xs text-gray-400">
                {(result.summary.totalPaid / loanAmount).toFixed(1)}× your £{(loanAmount / 1000).toFixed(0)}k loan
              </div>
            </div>
            {/* Bottom: Verdict */}
            <div className={`${result.summary.isGoodDeal
              ? darkMode ? 'bg-gradient-to-br from-emerald-900/60 to-emerald-950/40 border border-emerald-700/50' : 'bg-emerald-50 border border-emerald-200'
              : darkMode ? 'bg-gradient-to-br from-red-900/60 to-red-950/40 border border-red-800/50' : 'bg-red-50 border border-red-200'
            } rounded-lg px-3 py-2 flex-1 ${animations ? 'transition-all duration-500' : ''}`}>
              <div className="text-xl font-bold">
                {result.summary.isGoodDeal ? '😇 Blessing' : '😈 Curse'}
              </div>
              <div className={`text-sm font-semibold ${result.summary.isGoodDeal ? 'text-green-400' : 'text-red-400'}`}>
                {result.summary.isGoodDeal
                  ? `Saved £${Math.round((result.summary.personalLoanTotal - result.summary.totalPaid) / 1000)}k`
                  : `Overpaid £${Math.round((result.summary.totalPaid - result.summary.personalLoanTotal) / 1000)}k`
                }
              </div>
              <div className="text-[10px] text-gray-400">
                vs 5% loan over {result.summary.comparisonYears}yrs (£{(result.summary.personalLoanTotal / 1000).toFixed(0)}k)
              </div>
            </div>
          </div>
        </div>

        {/* Summary - thin bar */}
        <div className={`flex flex-wrap justify-center gap-x-4 gap-y-1 mb-4 text-xs ${darkMode ? 'bg-gray-800/50' : 'bg-white shadow'} rounded-lg px-4 py-2`}>
          <div className={`font-bold ${result.summary.isGoodDeal ? 'text-green-400' : 'text-red-400'}`}>
            {result.summary.isGoodDeal ? '😇 Blessing' : '😈 Curse'}
          </div>
          <div className="hidden sm:block text-gray-400">|</div>
          <div>You Pay: <span className="font-bold text-white">£{(result.summary.totalPaid / 1000).toFixed(0)}k</span></div>
          <div className="hidden sm:block text-gray-400">|</div>
          <div>Interest: <span className="font-bold text-amber-400">£{(result.summary.totalInterest / 1000).toFixed(0)}k</span></div>
          <div className="hidden sm:block text-gray-400">|</div>
          <div>
            {result.summary.clearedAge
              ? <span>Cleared @ <span className="font-bold text-green-400">{result.summary.clearedAge}</span></span>
              : <span>Written Off: <span className="font-bold text-purple-400">£{(result.summary.amountWrittenOff / 1000).toFixed(0)}k</span></span>
            }
          </div>
          <div className="hidden sm:block text-gray-400">|</div>
          <div className={result.summary.totalPaid > loanAmount * 1.25 ? 'text-red-400' : 'text-green-400'}>
            {(result.summary.totalPaid / loanAmount).toFixed(1)}x loan
          </div>
        </div>

        {/* Main Content: Salary + Table side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Salary Progression (Config) */}
          <div className={`${darkMode ? 'bg-indigo-950/40 border border-indigo-600/70' : 'bg-indigo-50 border border-indigo-400'} rounded-lg p-6 relative`}>
            <div className="absolute -top-2 left-3 px-2 text-[10px] font-medium uppercase tracking-wider bg-indigo-600 text-white rounded">
              🎮 Play Here
            </div>
            <h2 className="text-sm font-semibold mb-4 mt-1 text-center">👔 Choose Your Profession & Salary Growth</h2>
            <div className="flex gap-6 justify-center">
              {/* Left: Career Chips */}
              <TutorialTip label="Pick a career (red = pay more, green = pay less)" enabled={tutorialMode} position="right">
                <div className="flex flex-col gap-1.5 min-w-[240px]">
                  {[...careerComparison].reverse().sort((a, b) => a.id === 'nursing' ? -1 : b.id === 'nursing' ? 1 : 0).map((career, index) => {
                    const total = careerComparison.length
                    const ratio = index / (total - 1)
                    const bgColor = selectedCareer === career.id
                      ? 'rgb(59, 130, 246)'
                      : `rgb(${Math.round(34 + ratio * 100)}, ${Math.round(120 - ratio * 70)}, ${Math.round(80 - ratio * 40)})`
                    const careerData = CAREER_TEMPLATES.find(c => c.id === career.id)
                    const minSal = careerData ? Math.min(...careerData.milestones.map(m => m.salary)) / 1000 : 0
                    const maxSal = careerData ? Math.max(...careerData.milestones.map(m => m.salary)) / 1000 : 0
                    return (
                      <button
                        key={career.id}
                        onClick={() => handleCareerChange(career.id)}
                        style={{ backgroundColor: bgColor }}
                        className={`px-3 py-2 rounded text-[13px] hover:opacity-90 flex justify-between items-center ${animations ? 'transition-all duration-300 hover:scale-[1.02]' : ''}`}
                      >
                        <span>
                          <span className="mr-1">{career.emoji}</span>
                          <span className="font-medium text-white">{career.name}</span>
                        </span>
                        <span className="text-white/70 text-xs">£{minSal}k→£{maxSal}k</span>
                      </button>
                    )
                  })}
                </div>
              </TutorialTip>

              {/* Right: Chart + Inputs below */}
              <div className="flex-1 flex flex-col items-center">
                <TutorialTip label="Drag points to adjust" enabled={tutorialMode} position="top">
                  <SalaryChart
                    milestones={milestones}
                    onMilestoneChange={handleMilestoneChange}
                    width={340}
                    height={200}
                  />
                </TutorialTip>
                {/* Inputs below chart */}
                <TutorialTip label="Or type exact values" enabled={tutorialMode} position="right">
                <div className="flex flex-col gap-1 mt-2 items-center">
                  {milestones.map((m, i) => (
                    <div key={`${i}-${selectedCareer}-${m.age}-${m.salary}`} className="group flex items-center gap-1">
                      <button
                        onClick={() => removeMilestone(i)}
                        disabled={milestones.length <= 1}
                        className="w-4 h-4 text-sm text-red-400 hover:text-red-300 disabled:text-gray-600 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        −
                      </button>
                      <span className="text-sm text-gray-500">Age</span>
                      <input
                        type="text"
                        defaultValue={m.age}
                        onBlur={(e) => {
                          const num = parseInt(e.target.value, 10)
                          if (!isNaN(num) && num >= 18 && num <= 65) {
                            handleAgeChange(i, num)
                          } else {
                            e.target.value = String(m.age)
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                        }}
                        className={`w-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} border border-gray-600 rounded px-1 py-0.5 text-sm text-center text-gray-400`}
                      />
                      <span className="text-xs text-gray-400">£</span>
                      <input
                        type="text"
                        defaultValue={(m.salary / 1000).toFixed(0)}
                        onBlur={(e) => {
                          const num = parseInt(e.target.value, 10)
                          if (!isNaN(num) && num > 0) {
                            handleInputChange(i, String(num * 1000))
                          } else {
                            e.target.value = (m.salary / 1000).toFixed(0)
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                        }}
                        className={`w-12 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} border border-gray-600 rounded px-1 py-0.5 text-xs text-center`}
                      />
                      <span className="text-xs text-gray-400">k</span>
                    </div>
                  ))}
                  {milestones.length < 7 && (
                    <button
                      onClick={addMilestone}
                      className="text-sm text-green-400 hover:text-green-300 mt-1"
                    >
                      + Add milestone
                    </button>
                  )}
                </div>
                </TutorialTip>
              </div>
            </div>
          </div>

          {/* Right: Full Year Table */}
          <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white shadow'} rounded-lg p-3`}>
            <h2 className="text-sm font-semibold mb-2">Year-by-Year Breakdown</h2>
            <YearTable data={result.yearByYear} initialDebt={loanAmount} />
          </div>
        </div>

        {/* Bottom: Info Panels + Career Comparison - Full Width */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
          {/* Which Plan? */}
          <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white shadow'} rounded-lg p-4`}>
            <h2 className="text-sm font-semibold mb-2">🗺️ Which Plan?</h2>
            <div className="grid grid-cols-4 gap-1 text-xs text-gray-400">
              <span className="text-gray-500">Started</span><span className="text-center">Pre-2012</span><span className="text-center">2012-23</span><span className="text-center">2023+</span>
              <span className="text-gray-300">England</span><span className="text-center">Plan 1</span><span className="text-center text-blue-400">Plan 2</span><span className="text-center">Plan 5</span>
              <span className="text-gray-300">Wales</span><span className="text-center">Plan 1</span><span className="text-center text-blue-400">Plan 2</span><span className="text-center">Plan 2</span>
              <span className="text-gray-300">Scotland</span><span className="text-center">Plan 4</span><span className="text-center">Plan 4</span><span className="text-center">Plan 4</span>
              <span className="text-gray-300">N. Ireland</span><span className="text-center">Plan 1</span><span className="text-center">Plan 1</span><span className="text-center">Plan 1</span>
            </div>
          </div>

          {/* What Should You Do? - Dynamic */}
          <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white shadow'} rounded-lg p-4`}>
            <h2 className="text-sm font-semibold mb-2">🎯 What Should You Do?</h2>
            {result.summary.isGoodDeal ? (
              <div className="space-y-1 text-xs">
                <div className="text-green-400 font-bold text-sm">😇 You got a good deal</div>
                <p className="text-gray-300">Student loan was cheaper than borrowing elsewhere. {!result.summary.clearedAge ? `£${(result.summary.amountWrittenOff / 1000).toFixed(0)}k written off = free money.` : `Cleared at ${result.summary.clearedAge}.`}</p>
                <p className="text-gray-500 text-[10px]">{!result.summary.clearedAge ? "Just pay the 9%, invest the rest" : "No action needed — system worked for you"}</p>
              </div>
            ) : result.summary.clearedAge && result.summary.clearedAge < 40 ? (
              <div className="space-y-1 text-xs">
                <div className="text-red-400 font-bold text-sm">😈 Could've borrowed cheaper</div>
                <p className="text-gray-300">Paying £{(result.summary.totalPaid / 1000).toFixed(0)}k total ({(result.summary.totalPaid / loanAmount).toFixed(1)}x loan). A 5% loan = £{(result.summary.personalLoanTotal / 1000).toFixed(0)}k.</p>
                <p className="text-gray-500 text-[10px]">Early lump sum payments reduce compounding — could save £thousands</p>
              </div>
            ) : (
              <div className="space-y-1 text-xs">
                <div className="text-amber-400 font-bold text-sm">😈 Paying more than needed</div>
                <p className="text-gray-300">Costs more than a personal loan would've. Could pay off with savings, but you'd lose income protection + write-off safety net.</p>
                <p className="text-gray-500 text-[10px]">Usually best to just pay the 9% — flexibility has value</p>
              </div>
            )}
          </div>

          {/* Quick FAQ */}
          <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white shadow'} rounded-lg p-4`}>
            <h2 className="text-sm font-semibold mb-2">❓ FAQ</h2>
            <div className="space-y-1 text-xs overflow-y-auto max-h-[140px]">
              <div><span className="text-gray-400">Credit score?</span> <span className="text-gray-300">No impact whatsoever</span></div>
              <div><span className="text-gray-400">Move abroad?</span> <span className="text-gray-300">Still owe, SLC tracks you</span></div>
              <div><span className="text-gray-400">Death?</span> <span className="text-gray-300">Cancelled immediately</span></div>
              <div><span className="text-gray-400">Real debt?</span> <span className="text-gray-300">More like 9% grad tax</span></div>
              <div><span className="text-gray-400">Mortgage?</span> <span className="text-gray-300">Lenders see repayments as expense</span></div>
            </div>
          </div>

          {/* Interest History */}
          <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white shadow'} rounded-lg p-4`}>
            <h2 className="text-sm font-semibold mb-2">📈 Interest Rates</h2>
            <div className="text-xs">
              <div className="grid grid-cols-3 gap-1 text-gray-500 mb-1">
                <span>Year</span><span className="text-center">≤£27k</span><span className="text-right">≥£49k</span>
              </div>
              <div className="space-y-0.5 text-gray-300">
                <div className="grid grid-cols-3 gap-1"><span>2024-25</span><span className="text-center text-amber-400">4.3%</span><span className="text-right text-red-400">7.3%</span></div>
                <div className="grid grid-cols-3 gap-1"><span>2023-24</span><span className="text-center text-red-400">7.1%</span><span className="text-right text-red-400">7.9%</span></div>
                <div className="grid grid-cols-3 gap-1"><span>2022-23</span><span className="text-center text-red-400">6.3%</span><span className="text-right text-red-400">6.5%</span></div>
              </div>
            </div>
          </div>

          {/* Career Comparison Table */}
          <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white shadow'} rounded-lg p-4 row-span-2`}>
            <h2 className="text-sm font-semibold mb-2">📊 Career Comparison</h2>
            <div className="overflow-y-auto max-h-[180px]">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-gray-800">
                  <tr className="border-b border-gray-700 text-gray-400">
                    <th className="text-left py-1">Career</th>
                    <th className="text-right py-1">Paid</th>
                    <th className="text-center py-1"></th>
                  </tr>
                </thead>
                <tbody>
                  {careerComparison.map((c, i) => (
                    <tr key={c.id} className={`border-b border-gray-800/50 ${c.id === selectedCareer ? 'bg-blue-900/20' : ''}`}>
                      <td className="py-1">
                        <span className="mr-1">{c.emoji}</span>{c.name}
                        {i === 0 && <span className="ml-1 text-red-400">💸</span>}
                        {i === careerComparison.length - 1 && <span className="ml-1 text-green-400">🏆</span>}
                      </td>
                      <td className="text-right py-1 font-medium">£{(c.totalPaid / 1000).toFixed(0)}k</td>
                      <td className="text-center py-1">{c.isGoodDeal ? <span className="text-green-400">😇</span> : <span className="text-red-400">😈</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Insights - spans 4 cols */}
          <div className="col-span-2 lg:col-span-4 bg-gradient-to-r from-gray-800/50 to-gray-800/30 rounded-lg px-4 py-2">
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
              <span className="text-red-400">😈 <strong>Curse:</strong> <span className="text-gray-300">£40-65k pay 30yrs, never clear</span></span>
              <span className="text-red-400">📈 <strong>Early Career:</strong> <span className="text-gray-300">Interest outpaces repayments</span></span>
              <span className="text-green-400">😇 <strong>Blessing:</strong> <span className="text-gray-300">Pay &lt;1.25x loan</span></span>
              <span className="text-blue-400">💰 <strong>Below Threshold:</strong> <span className="text-gray-300">Pay £0, written off {planConfig.writeOffYears}yrs</span></span>
            </div>
          </div>
        </div>

        {/* Quick Reference - Compact */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-gray-500">
          <span>📌 {PLANS.find(p => p.id === selectedPlan)?.name}: {PLANS.find(p => p.id === selectedPlan)?.years}</span>
          <span>📌 Tuition ({startYear}): £{getTuitionForYear(startYear).annual.toLocaleString()}/yr</span>
          <span>📌 Threshold: £{planConfig.threshold.toLocaleString()}</span>
          <span>📌 Rate: {Math.round(planConfig.repaymentRate * 100)}% above threshold</span>
          <span>📌 Interest: {planConfig.hasSlideScale ? `${(planConfig.baseInterest * 100).toFixed(1)}%-${(planConfig.maxInterest * 100).toFixed(1)}%` : `${(planConfig.baseInterest * 100).toFixed(1)}%`}</span>
          <span>📌 Write-off: {planConfig.writeOffYears}yrs ({startYear + planConfig.writeOffYears})</span>
        </div>

        <footer className="mt-6 text-center text-xs text-gray-500">
          Rates: Student Finance England 2024-25 • Projection tool, not financial advice
        </footer>
      </div>

      {/* How It Works Modal */}
      {showHowItWorks && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowHowItWorks(false)}>
          <div
            className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">How Student Loan Repayments Work</h2>
              <button onClick={() => setShowHowItWorks(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-semibold text-blue-400 mb-1">💰 When do I pay?</h3>
                <p className="text-gray-300">Only when you earn above the threshold (£27,295 for Plan 2). Below that = £0 payments. It comes out automatically via your payslip like tax.</p>
              </div>

              <div>
                <h3 className="font-semibold text-blue-400 mb-1">📊 How much do I pay?</h3>
                <p className="text-gray-300"><strong>9% of income ABOVE the threshold.</strong> Earn £30k? Pay 9% of £2,705 = £243/year (£20/month). Not 9% of your whole salary.</p>
              </div>

              <div>
                <h3 className="font-semibold text-blue-400 mb-1">📈 What about interest?</h3>
                <p className="text-gray-300">Interest accrues from day 1, even while studying. Plan 2: RPI (inflation) to RPI+3% depending on income. This is why debt often grows even while paying.</p>
              </div>

              <div>
                <h3 className="font-semibold text-blue-400 mb-1">🎉 When is it written off?</h3>
                <p className="text-gray-300">30 years after the April following graduation. Whatever's left = cancelled. Most people don't fully repay.</p>
              </div>

              <div>
                <h3 className="font-semibold text-red-400 mb-1">😈 The curse</h3>
                <p className="text-gray-300">Middle earners (£40-65k) pay for 30 years but never clear the loan. High earners clear quickly. Low earners pay little/nothing.</p>
              </div>

              <div>
                <h3 className="font-semibold text-green-400 mb-1">✨ The blessing</h3>
                <p className="text-gray-300">If you never earn much, you pay almost nothing and it's written off. No credit impact. No bailiffs. More like a "graduate tax" than real debt.</p>
              </div>

              <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'} rounded-lg p-3 mt-4`}>
                <h3 className="font-semibold mb-2">Quick example (£45k salary)</h3>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>Threshold: £27,295</p>
                  <p>Amount above: £45,000 - £27,295 = £17,705</p>
                  <p>Annual payment: £17,705 × 9% = <span className="text-white font-medium">£1,593/year</span></p>
                  <p>Monthly: <span className="text-white font-medium">£133/month</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
