export function LiveIndicator() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75"></div>
      </div>
      <span className="text-sm">Live Data</span>
    </div>
  )
}
