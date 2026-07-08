import * as React from "react"

export function Card({ className, ...props }) {
  return (
    <div
      className={`glass-card glass-card-hover ${className || ""}`}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }) {
  return (
    <div
      className={`flex flex-col space-y-1.5 p-0 mb-4 ${className || ""}`}
      {...props}
    />
  )
}

export function CardTitle({ className, ...props }) {
  return (
    <h3
      className={`font-sans text-xl font-bold leading-none tracking-tight text-slate-800 ${className || ""}`}
      {...props}
    />
  )
}

export function CardDescription({ className, ...props }) {
  return (
    <p
      className={`text-sm text-slate-500 font-sans ${className || ""}`}
      {...props}
    />
  )
}

export function CardContent({ className, ...props }) {
  return (
    <div className={`p-0 ${className || ""}`} {...props} />
  )
}

export function CardFooter({ className, ...props }) {
  return (
    <div
      className={`flex items-center pt-4 mt-4 border-t border-slate-100 ${className || ""}`}
      {...props}
    />
  )
}
