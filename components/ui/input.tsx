import * as React from "react"
import { cn } from "@/lib/utils"

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, value, ...props }, ref) => {
    // Determine if the input is controlled (has value prop)
    const isControlled = value !== undefined
    
    return (
        <input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            ref={ref}
            // Only pass value if the input is controlled
            value={isControlled ? value : undefined}
            // Pass defaultValue if uncontrolled
            defaultValue={!isControlled ? props.defaultValue : undefined}
            {...props}>
              
            </input>
    );
  }
)
Input.displayName = "Input"

export { Input }