import { HTMLAttributes, forwardRef } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: "published" | "draft" | "neutral" | "technology" | "business" | "workplace" | string;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className = "", variant = "neutral", children, ...props }, ref) => {
        const variants: Record<string, string> = {
            published: "bg-emerald-100 text-emerald-700",
            draft: "bg-amber-100 text-amber-700",
            neutral: "bg-gray-100 text-gray-600",
            technology: "bg-indigo-100 text-indigo-700",
            business: "bg-orange-100 text-orange-700",
            workplace: "bg-blue-100 text-blue-700",
        };

        const mappedVariant = variants[variant.toLowerCase()] || variants.neutral;

        return (
            <span
                ref={ref}
                className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${mappedVariant} ${className}`}
                {...props}
            >
                {children}
            </span>
        );
    }
);
Badge.displayName = "Badge";
