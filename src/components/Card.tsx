import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
}

const Card = ({ children, className = '', onClick, hover = true }: CardProps) => {
  const baseClasses = 'bg-white rounded-xl shadow-sm border border-gray-200 p-6'
  const hoverClasses = hover ? 'hover:shadow-md hover:border-gray-300 transition-all duration-200' : ''
  const clickableClasses = onClick ? 'cursor-pointer' : ''

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export default Card
