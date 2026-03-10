import { InputHTMLAttributes, forwardRef, TextareaHTMLAttributes } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
    ({ className = "", ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={`w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${className}`}
                {...props}
            />
        );
    }
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
    ({ className = "", ...props }, ref) => {
        return (
            <textarea
                ref={ref}
                className={`w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${className}`}
                {...props}
            />
        );
    }
);
Textarea.displayName = "Textarea";
