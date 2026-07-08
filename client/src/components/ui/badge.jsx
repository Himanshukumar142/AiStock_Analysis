import * as React from "react"

export function Badge({
  className,
  variant = "default",
  ...props
}) {
  const baseClasses =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-sans font-semibold transition-colors duration-200"

  const variants = {
    default: "bg-slate-100 text-slate-800 border border-slate-200",
    primary: "bg-primary-50 text-primary-600 border border-primary-100",
    success: "bg-emerald-50 text-success-600 border border-emerald-100",
    danger: "bg-red-50 text-danger-600 border border-red-100",
    warning: "bg-amber-50 text-warning-600 border border-amber-100"
  }

  const selectedVariant = variants[variant] || variants.default

  return (
    <div
      className={`${baseClasses} ${selectedVariant} ${className || ""}`}
      {...props}
    />
  )
}
