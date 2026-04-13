import clsx from 'clsx'
import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'highlight' | 'warning'
}

export default function Card({ variant = 'default', className, children, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={clsx(
        'rounded-xl border p-5 shadow-sm',
        {
          'bg-white border-gray-200':            variant === 'default',
          'bg-brand-50 border-brand-200':        variant === 'highlight',
          'bg-amber-50 border-amber-200':        variant === 'warning',
        },
        className,
      )}
    >
      {children}
    </div>
  )
}
