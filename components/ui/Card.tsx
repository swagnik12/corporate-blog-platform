import { HTMLAttributes, forwardRef } from "react";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className = "", ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={`bg-white rounded-2xl shadow-sm border border-gray-200 ${className}`}
                {...props}
            />
        );
    }
);
Card.displayName = "Card";
