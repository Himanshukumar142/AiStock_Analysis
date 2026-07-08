import * as React from "react"

export function Input({ className, type = "text", ...props }) {
  return (
    <input
      type={type}
      className={`flex w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-sm font-sans placeholder-slate-400 outline-none transition-all duration-200 focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50 ${className || ""}`}
      {...props}
    />
  )
}
