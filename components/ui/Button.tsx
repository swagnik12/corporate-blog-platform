import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "ghost";
    size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = "", variant = "primary", size = "md", ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

        const variants = {
            primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
            secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
            danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
            ghost: "text-gray-700 hover:text-gray-900 hover:bg-gray-50",
        };

        const sizes = {
            sm: "px-3 py-1.5 text-sm",
            md: "px-4 py-2.5 text-sm",
            lg: "px-6 py-3 text-base",
        };

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";
