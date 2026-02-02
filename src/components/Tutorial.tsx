import { ReactNode } from 'react'

interface TutorialTipProps {
  children: ReactNode
  label: string
  enabled: boolean
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export function TutorialTip({ children, label, enabled, position = 'bottom' }: TutorialTipProps) {
  if (!enabled) return <>{children}</>

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-indigo-500 border-x-transparent border-b-transparent border-[6px]',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-indigo-500 border-x-transparent border-t-transparent border-[6px]',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-indigo-500 border-y-transparent border-r-transparent border-[6px]',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-indigo-500 border-y-transparent border-l-transparent border-[6px]',
  }

  return (
    <div className="relative inline-block">
      {/* Visible glow ring */}
      <div className="relative rounded-lg ring-2 ring-indigo-400 shadow-[0_0_16px_rgba(129,140,248,0.6)]">
        {children}
      </div>
      {/* Tooltip */}
      <div className={`absolute z-50 ${positionClasses[position]} whitespace-nowrap pointer-events-none`}>
        <div className="relative bg-indigo-500 text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-lg">
          {label}
          <div className={`absolute ${arrowClasses[position]}`} />
        </div>
      </div>
    </div>
  )
}
