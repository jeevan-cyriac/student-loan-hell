# UK Student Loan Calculator

Interactive calculator that shows whether your UK student loan is a **Blessing** or **Curse** compared to a 5% personal loan.

## What It Does

- Pick your loan plan (Plan 1, 2, 4, or 5) and start year
- Choose a career template or drag salary points to match your trajectory
- See year-by-year breakdown: debt, interest, repayments
- Compare outcomes across 11 professions

## The Verdict

- **Blessing** = You paid less than a 5% personal loan would've cost
- **Curse** = You'd have been better off borrowing elsewhere

Most middle earners (£40-65k) pay for 30 years but never clear the loan. High earners clear quickly. Low earners pay little and get the rest written off.

## Run Locally

```bash
npm install
npm run dev
```

Opens at http://localhost:5173

## Tech Stack

React, Vite, TypeScript, Tailwind CSS, Visx

## Loan Parameters

Uses official Student Finance England 2024-25 rates:

| Plan | Threshold | Repayment | Interest | Write-off |
|------|-----------|-----------|----------|-----------|
| Plan 1 | £24,990 | 9% above | 4.3% | 25 years |
| Plan 2 | £27,295 | 9% above | RPI to RPI+3% | 30 years |
| Plan 4 | £31,395 | 9% above | 4.3% | 30 years |
| Plan 5 | £25,000 | 9% above | RPI only | 40 years |
