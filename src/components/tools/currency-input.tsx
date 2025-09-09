import { FC, forwardRef } from "react";
import { Input, InputProps } from "../ui/input";

// eslint-disable-next-line react/display-name
const CurrencyInput = forwardRef<HTMLInputElement, InputProps>(
    ({className, type, ...props},ref) => {
        return(
            <div>
                <Input
                    type={type}
                    ref={ref}
                    className={className}
                    {...props}
                />
            </div>
        )
})