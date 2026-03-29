import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
}

export function Card({ children, className = '', title }: CardProps) {
  return (
    <div className={`bg-slate-700 rounded-lg p-4 shadow-md ${className}`}>
      {title && <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>}
      {children}
    </div>
  )
}