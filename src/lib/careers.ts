// Pre-built career salary templates
// Salaries are approximate UK figures

export interface CareerTemplate {
  id: string
  name: string
  emoji: string
  milestones: Array<{ age: number; salary: number }>
}

export const CAREER_TEMPLATES: CareerTemplate[] = [
  {
    id: 'nursing',
    name: 'Nursing',
    emoji: '🏥',
    // Sources: NHS Pay Bands 2024/25 - Band 5 to Band 8
    milestones: [
      { age: 22, salary: 29000 },
      { age: 26, salary: 33000 },
      { age: 31, salary: 38000 },
      { age: 41, salary: 48000 },
      { age: 52, salary: 55000 },
    ],
  },
  {
    id: 'software',
    name: 'Software Engineer',
    emoji: '💻',
    // Sources: The Engineer 2024 Survey, Indeed UK
    milestones: [
      { age: 22, salary: 32000 },
      { age: 26, salary: 45000 },
      { age: 31, salary: 58000 },
      { age: 36, salary: 68000 },
      { age: 42, salary: 75000 },
      { age: 52, salary: 80000 },
    ],
  },
  {
    id: 'tech-lead',
    name: 'Tech Lead',
    emoji: '👨‍💻',
    milestones: [
      { age: 22, salary: 30000 },
      { age: 25, salary: 50000 },
      { age: 28, salary: 80000 },
      { age: 32, salary: 100000 },
      { age: 35, salary: 125000 },
      { age: 52, salary: 130000 },
    ],
  },
  {
    id: 'teaching',
    name: 'Teaching',
    emoji: '📚',
    // Sources: Teacher pay scales England 2024/25
    milestones: [
      { age: 22, salary: 31000 },
      { age: 26, salary: 36000 },
      { age: 31, salary: 43000 },
      { age: 41, salary: 50000 },
      { age: 52, salary: 55000 },
    ],
  },
  {
    id: 'medicine-gp',
    name: 'Medicine (GP)',
    emoji: '👨‍⚕️',
    // Sources: NHS Health Careers, BMA - Salaried GP £76k-£115k from 2025
    milestones: [
      { age: 22, salary: 32000 },
      { age: 25, salary: 52000 },
      { age: 30, salary: 76000 },
      { age: 35, salary: 90000 },
      { age: 42, salary: 100000 },
      { age: 52, salary: 110000 },
    ],
  },
  {
    id: 'medicine-consultant',
    name: 'Consultant',
    emoji: '🩺',
    // Sources: BMA Consultant Pay Scales 2025 - £110k to £145k
    milestones: [
      { age: 22, salary: 32000 },
      { age: 25, salary: 52000 },
      { age: 35, salary: 110000 },
      { age: 40, salary: 130000 },
      { age: 52, salary: 145000 },
    ],
  },
  {
    id: 'pharmacist',
    name: 'Pharmacist',
    emoji: '💊',
    // Sources: NHS Band 6-8, community pharmacy salaries
    milestones: [
      { age: 22, salary: 33000 },
      { age: 26, salary: 40000 },
      { age: 31, salary: 48000 },
      { age: 36, salary: 55000 },
      { age: 42, salary: 62000 },
      { age: 52, salary: 68000 },
    ],
  },
  {
    id: 'business-analyst',
    name: 'Business Analyst',
    emoji: '📈',
    // Sources: Indeed UK, SalaryExpert - avg £45k, senior £55-65k
    milestones: [
      { age: 22, salary: 28000 },
      { age: 26, salary: 40000 },
      { age: 31, salary: 50000 },
      { age: 36, salary: 58000 },
      { age: 42, salary: 63000 },
      { age: 52, salary: 65000 },
    ],
  },
  {
    id: 'law',
    name: 'Law',
    emoji: '⚖️',
    // Sources: Legal salary surveys - NQ solicitor £40-60k, senior £70-95k
    milestones: [
      { age: 22, salary: 28000 },
      { age: 26, salary: 45000 },
      { age: 31, salary: 60000 },
      { age: 40, salary: 80000 },
      { age: 52, salary: 95000 },
    ],
  },
  {
    id: 'engineering',
    name: 'Engineering',
    emoji: '🔧',
    // Sources: IMechE, The Engineer Survey 2024 - grad £30k, chartered £70k+
    milestones: [
      { age: 22, salary: 30000 },
      { age: 26, salary: 40000 },
      { age: 31, salary: 52000 },
      { age: 40, salary: 62000 },
      { age: 52, salary: 70000 },
    ],
  },
  {
    id: 'creative',
    name: 'Creative Arts',
    emoji: '🎨',
    // Sources: Major Players Census 2024, Glassdoor - £24-48k range
    milestones: [
      { age: 22, salary: 24000 },
      { age: 26, salary: 30000 },
      { age: 31, salary: 36000 },
      { age: 40, salary: 42000 },
      { age: 52, salary: 48000 },
    ],
  },
  ]

export function getCareerById(id: string): CareerTemplate | undefined {
  return CAREER_TEMPLATES.find(c => c.id === id)
}
