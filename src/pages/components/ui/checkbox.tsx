import type React from "react"

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void
}

export const Checkbox: React.FC<CheckboxProps> = ({ id, className = "", onCheckedChange, ...props }) => {
  return (
    <input
      type="checkbox"
      id={id}
      className={`form-checkbox h-5 w-5 text-blue-600 ${className}`}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...props}
    />
  )
}

