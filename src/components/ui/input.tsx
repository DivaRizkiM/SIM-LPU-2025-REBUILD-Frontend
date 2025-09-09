import * as React from "react"

import { cn } from "@/lib/utils"
import { Label } from "./label"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> { }
export interface CurrencyInputProps extends InputProps {
  symbol?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

// eslint-disable-next-line react/display-name
const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, type, symbol = 'Rp.', ...props }, ref) => {

    return (
      <div className="w-max relative">
        <Input
          type={type}
          ref={ref}
          className={cn(
            'ps-9',
            className
          )}
          {...props}
        />
        <Label className="absolute text-white top-0 bg-primary dark:bg-gradient-to-r from-primary to-cyan-900 h-9  flex items-center rounded-s-md px-1">{symbol}</Label>
      </div>
    )
  })
Input.displayName = "CurrencyInput"

export { Input, CurrencyInput }
