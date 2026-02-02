// UK Student Loan Calculator
// Rates from config/loan-rules.md

import loanConfig from '../config/loan-params.yml'

interface PlanConfig {
  threshold: { yearly: number; monthly: number; weekly: number }
  upperThreshold?: number
  repaymentRate: number
  interest?: {
    rpiRate: number
    maxRate: number
    additionalRate: number
    studyingRate: number
  }
  interestRate?: number
  writeOffYears: number
}

export type PlanType = 'plan1' | 'plan2' | 'plan4' | 'plan5'

// Get plan config by type
export function getPlanConfig(planType: PlanType) {
  const plan = loanConfig[planType] as PlanConfig

  // Plan 2 has sliding scale interest, others have flat rate
  const isSliding = planType === 'plan2'

  return {
    threshold: plan.threshold.yearly,
    upperThreshold: plan.upperThreshold ?? plan.threshold.yearly + 25000,
    repaymentRate: plan.repaymentRate,
    baseInterest: isSliding ? plan.interest!.rpiRate : plan.interestRate!,
    maxInterest: isSliding ? plan.interest!.maxRate : plan.interestRate!,
    writeOffYears: plan.writeOffYears,
    hasSlideScale: isSliding,
  }
}

// Default to Plan 2 for backwards compatibility
export const LOAN_PARAMS = getPlanConfig('plan2')

// Tuition fee brackets by start year
const TUITION_FEES: Array<{ startYear: number; endYear: number; annualFee: number; typicalTotal: number }> = [
  { startYear: 1998, endYear: 2005, annualFee: 1000, typicalTotal: 3000 },
  { startYear: 2006, endYear: 2011, annualFee: 3000, typicalTotal: 9000 },
  { startYear: 2012, endYear: 2016, annualFee: 9000, typicalTotal: 27000 },
  { startYear: 2017, endYear: 2024, annualFee: 9250, typicalTotal: 27750 },
  { startYear: 2025, endYear: 2030, annualFee: 9535, typicalTotal: 28605 },
]

// Get typical loan amount based on start year (tuition + average maintenance)
export function getTypicalLoanAmount(startYear: number): number {
  const fee = TUITION_FEES.find(f => startYear >= f.startYear && startYear <= f.endYear)
  const tuition = fee?.typicalTotal ?? 27750
  const maintenance = 27000 // Average maintenance loan over 3 years
  return tuition + maintenance
}

// Get just tuition fees for a start year
export function getTuitionForYear(startYear: number): { annual: number; total: number } {
  const fee = TUITION_FEES.find(f => startYear >= f.startYear && startYear <= f.endYear)
  return {
    annual: fee?.annualFee ?? 9250,
    total: fee?.typicalTotal ?? 27750,
  }
}

// Historical interest rates by academic year (Sep-Aug)
// Format: { year: [baseRate, maxRate] } - year is the September start
const HISTORICAL_RATES: Record<number, [number, number]> = {
  2012: [0.036, 0.066], // 3.6% - 6.6%
  2013: [0.033, 0.063], // 3.3% - 6.3%
  2014: [0.025, 0.055], // 2.5% - 5.5%
  2015: [0.009, 0.039], // 0.9% - 3.9%
  2016: [0.016, 0.046], // 1.6% - 4.6%
  2017: [0.031, 0.061], // 3.1% - 6.1%
  2018: [0.033, 0.063], // 3.3% - 6.3%
  2019: [0.024, 0.054], // 2.4% - 5.4%
  2020: [0.026, 0.056], // 2.6% - 5.6%
  2021: [0.015, 0.045], // 1.5% - 4.5% (avg, had caps)
  2022: [0.045, 0.065], // ~4.5% - 6.5% (caps applied)
  2023: [0.065, 0.073], // ~6.5% - 7.3% (caps applied)
  2024: [0.043, 0.073], // 4.3% - 7.3%
}

// Get interest rates for a given calendar year
function getRatesForYear(calendarYear: number): [number, number] {
  // Academic year runs Sep-Aug, so calendar year maps to academic year starting previous Sep
  const academicYear = calendarYear
  // Find the closest available year
  const years = Object.keys(HISTORICAL_RATES).map(Number).sort((a, b) => a - b)

  if (academicYear <= years[0]) return HISTORICAL_RATES[years[0]]
  if (academicYear >= years[years.length - 1]) return HISTORICAL_RATES[years[years.length - 1]]

  // Find the matching or previous year
  for (let i = years.length - 1; i >= 0; i--) {
    if (years[i] <= academicYear) return HISTORICAL_RATES[years[i]]
  }

  return HISTORICAL_RATES[2024] // fallback
}

export interface YearResult {
  age: number
  calendarYear: number
  salary: number
  interestRate: number
  interestAdded: number
  repayment: number
  totalPaid: number
  debtRemaining: number
  cleared: boolean
  isStudying: boolean
}

export interface LoanSummary {
  totalPaid: number
  clearedAge: number | null
  amountWrittenOff: number
  totalInterest: number
  isGoodDeal: boolean
  personalLoanTotal: number
  comparisonYears: number
}

export interface CalculationResult {
  yearByYear: YearResult[]
  summary: LoanSummary
}

// Calculate interest rate based on salary, year, and plan
// Plan 2: sliding scale based on income
// Plan 1, 4, 5: flat rate regardless of income
export function getInterestRate(salary: number, calendarYear?: number, planType: PlanType = 'plan2'): number {
  const config = getPlanConfig(planType)
  const { threshold, upperThreshold, hasSlideScale } = config

  // Plan 1, 4, 5 have flat interest rates
  if (!hasSlideScale) {
    return config.baseInterest
  }

  // Plan 2: Use historical rates if year provided, otherwise current rates
  const [baseInterest, maxInterest] = calendarYear
    ? getRatesForYear(calendarYear)
    : [config.baseInterest, config.maxInterest]

  if (salary <= threshold) return baseInterest
  if (salary >= upperThreshold) return maxInterest

  const proportion = (salary - threshold) / (upperThreshold - threshold)
  return baseInterest + (maxInterest - baseInterest) * proportion
}

// Calculate annual repayment based on salary and plan
// 9% of income ABOVE the threshold (6% for postgraduate)
export function getAnnualRepayment(salary: number, planType: PlanType = 'plan2'): number {
  const { threshold, repaymentRate } = getPlanConfig(planType)
  if (salary <= threshold) return 0
  return (salary - threshold) * repaymentRate
}

// Get salary for age - step function (stays at milestone salary until next milestone)
export function interpolateSalary(
  milestones: Array<{ age: number; salary: number }>,
  age: number
): number {
  const sorted = [...milestones].sort((a, b) => a.age - b.age)

  // Before first milestone
  if (age < sorted[0].age) return sorted[0].salary

  // Find the milestone at or before this age
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (age >= sorted[i].age) {
      return sorted[i].salary
    }
  }

  return sorted[0].salary
}

// Main calculation function
export function calculateLoanRepayment(
  initialDebt: number,
  salaryMilestones: Array<{ age: number; salary: number }>,
  graduationAge: number = 22,
  startYear: number = 2024,
  planType: PlanType = 'plan2',
  courseDuration: number = 4
): CalculationResult {
  const config = getPlanConfig(planType)
  const { writeOffYears } = config
  const yearByYear: YearResult[] = []

  // Calculate starting age (18 for uni start)
  const uniStartAge = 18
  const uniStartYear = startYear

  // Debt accumulates during studying - spread over course duration
  const annualDebtAddition = initialDebt / courseDuration

  let debtBalance = 0
  let totalPaid = 0
  let totalInterest = 0
  let clearedAge: number | null = null

  // Phase 1: Studying years (age 18 to graduation)
  for (let year = 0; year < courseDuration; year++) {
    const age = uniStartAge + year
    const calendarYear = uniStartYear + year

    // Add this year's loan (tuition + maintenance)
    debtBalance += annualDebtAddition

    // Interest during studying is max rate (RPI + 3%)
    const [, maxRate] = getRatesForYear(calendarYear)
    const interestRate = maxRate
    const interestAdded = debtBalance * interestRate
    debtBalance += interestAdded
    totalInterest += interestAdded

    yearByYear.push({
      age,
      calendarYear,
      salary: 0,
      interestRate,
      interestAdded: Math.round(interestAdded),
      repayment: 0,
      totalPaid: 0,
      debtRemaining: Math.round(debtBalance),
      cleared: false,
      isStudying: true,
    })
  }

  // Phase 2: Repayment years (graduation onwards)
  const graduationYear = uniStartYear + courseDuration

  for (let year = 0; year <= writeOffYears; year++) {
    const age = graduationAge + year
    const calendarYear = graduationYear + year
    const salary = interpolateSalary(salaryMilestones, age)
    const interestRate = getInterestRate(salary, calendarYear, planType)

    // Add interest (applied monthly, but we calculate annually for simplicity)
    const interestAdded = debtBalance * interestRate
    debtBalance += interestAdded
    totalInterest += interestAdded

    // Calculate and apply repayment
    let repayment = getAnnualRepayment(salary, planType)

    // Don't overpay
    if (repayment > debtBalance) {
      repayment = debtBalance
    }

    debtBalance -= repayment
    totalPaid += repayment

    const cleared = debtBalance <= 0

    yearByYear.push({
      age,
      calendarYear,
      salary: Math.round(salary),
      interestRate,
      interestAdded: Math.round(interestAdded),
      repayment: Math.round(repayment),
      totalPaid: Math.round(totalPaid),
      debtRemaining: Math.max(0, Math.round(debtBalance)),
      cleared,
      isStudying: false,
    })

    if (cleared && !clearedAge) {
      clearedAge = age
      // Don't break - continue showing years until age 52
    }
  }

  const amountWrittenOff = clearedAge ? 0 : Math.max(0, Math.round(debtBalance))

  // Calculate what a personal loan at 5% APR would cost over the ACTUAL repayment period
  // Use actual years paid for fair comparison (not 30 years if cleared early)
  const comparisonYears = clearedAge ? clearedAge - graduationAge : writeOffYears
  const personalLoanRate = 0.05 / 12 // monthly rate
  const numPayments = comparisonYears * 12
  const personalLoanMonthly = initialDebt * (personalLoanRate * Math.pow(1 + personalLoanRate, numPayments)) / (Math.pow(1 + personalLoanRate, numPayments) - 1)
  const personalLoanTotal = personalLoanMonthly * numPayments

  // Blessing if you paid less than a 5% personal loan would have cost
  const isGoodDeal = totalPaid <= personalLoanTotal

  return {
    yearByYear,
    summary: {
      totalPaid: Math.round(totalPaid),
      clearedAge,
      amountWrittenOff,
      totalInterest: Math.round(totalInterest),
      isGoodDeal,
      personalLoanTotal: Math.round(personalLoanTotal),
      comparisonYears,
    },
  }
}
