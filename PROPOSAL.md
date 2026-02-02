# UK Student Loan Calculator - Proposal

## Core Idea
Show UK Plan 2 graduates the brutal truth: year-by-year debt trajectory, whether they'll ever clear it, and how career choice dramatically affects total repayment.

---

## Decisions

| Item | Decision |
|------|----------|
| Tech Stack | Next.js (frontend only) |
| Deployment | S3/CloudFront (later), localhost for now |
| Interest Rates | Official SLC rates, no user input |
| Career Data | Default templates, user can customize |
| Charts | High priority |

---

## Salary Input UX

**Interactive line chart** where users:
1. Select a career template (pre-fills the chart)
2. Drag points at key ages (22, 27, 32, 42, 52) to customize
3. See real-time update of loan projections

```
Salary (£k)
   80 ┤                    ●───────● age 52
   70 ┤               ●────┘
   60 ┤          ●────┘
   50 ┤     ●────┘
   40 ┤●────┘ age 22
   20 ┼────┬────┬────┬────┬────┬────
      22   27   32   37   42   52  Age
```

Users drag the ● points up/down to adjust salary at each milestone.

---

## MVP Features

### Input Section
- Loan amount slider (default £45k)
- Career template dropdown (pre-fills salary chart)
- Interactive salary progression chart (draggable points)

### Output Section
- **Summary cards**: Total paid, written off, verdict (good/bad deal)
- **Debt balance chart**: Line chart showing debt over 30 years
- **Year-by-year table**: Age, salary, interest, repayment, remaining debt

---

## Loan Parameters (Fixed)

Using 2024-25 Student Finance England rates:
- **Threshold**: £27,295/year
- **Rate**: 9% above threshold
- **Interest**: RPI (currently ~4.3%) to RPI+3% (7.3%) based on income
- **Write-off**: 30 years after first due date

---

## Tech Architecture

```
student-finance-hell/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Main calculator page
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── SalaryChart.tsx    # Interactive draggable chart
│   │   ├── DebtChart.tsx      # Debt projection visualization
│   │   ├── SummaryCards.tsx   # Key metrics display
│   │   ├── YearTable.tsx      # Year-by-year breakdown
│   │   └── LoanInput.tsx      # Loan amount slider
│   ├── lib/
│   │   ├── calculator.ts      # Core loan math
│   │   ├── careers.ts         # Career template data
│   │   └── interpolate.ts     # Salary interpolation between milestones
│   └── types/
│       └── index.ts
├── package.json
└── tailwind.config.js
```

---

## Build Order

1. **Calculator engine** - core loan math with tests
2. **Static UI** - layout with hardcoded data
3. **Interactive salary chart** - draggable points using Recharts or similar
4. **Wire it up** - real-time calculation on drag
5. **Debt visualization** - projection chart
6. **Career templates** - dropdown to load presets
7. **Polish** - responsive, colors, UX refinements

---

## Chart Library Options

For the interactive draggable chart:
- **Recharts** - popular, but drag support needs custom work
- **Visx** - low-level, full control, more code
- **Custom SVG** - most control, most work

Recommendation: Start with **Recharts + custom drag handlers** - good balance of speed and flexibility.

---

Ready to start building?
