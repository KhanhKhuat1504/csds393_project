import type React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

export const Button: React.FC<ButtonProps> = ({ children, className = "", asChild = false, ...props }) => {
  const Comp = asChild ? "span" : "button"
  return (
    <Comp className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${className}`} {...props}>
      {children}
    </Comp>
  )
}