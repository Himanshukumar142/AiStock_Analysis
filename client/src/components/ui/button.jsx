import * as React from "react"

export function Button({
  className,
  variant = "primary",
  size = "md",
  disabled,
  children,
  ...props
}) {
  // Base classes for a premium button with slight scaling on click
  const baseClasses =
    "inline-flex items-center justify-center font-sans font-semibold rounded-xl transition-all duration-200 outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100"

  const variants = {
    primary:
      "bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white shadow-md shadow-indigo-100 hover:shadow-lg hover:shadow-indigo-200/50",
    outline:
      "border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-slate-700",
    ghost:
      "text-slate-600 hover:bg-slate-100/50 hover:text-slate-800",
    success:
      "bg-gradient-to-r from-emerald-500 to-success-600 hover:from-emerald-600 hover:to-success-700 text-white shadow-md shadow-emerald-500/10"
  }

  const sizes = {
    sm: "h-9 px-3 text-xs",
    md: "h-11 px-5 text-sm",
    lg: "h-13 px-8 text-base"
  }

  const selectedVariant = variants[variant] || variants.primary
  const selectedSize = sizes[size] || sizes.md

  return (
    <button
      className={`${baseClasses} ${selectedVariant} ${selectedSize} ${className || ""}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
