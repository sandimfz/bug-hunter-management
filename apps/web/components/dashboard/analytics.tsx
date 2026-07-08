"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { useAnalytics } from "@/hooks/useAnalytics"

const severityColors: Record<string, string> = {
  critical: "bg-red-500", high: "bg-orange-500", medium: "bg-yellow-500", low: "bg-blue-500", info: "bg-zinc-500",
}
const statusColors: Record<string, string> = {
  draft: "bg-zinc-500", submitted: "bg-blue-500", triaged: "bg-yellow-500", accepted: "bg-emerald-500", rejected: "bg-red-500", paid: "bg-emerald-400",
}

function BarChart({ data, colors }: { data: Record<string, number>; colors: Record<string, string> }) {
  const entries = Object.entries(data)
  const max = Math.max(...entries.map(([, v]) => v), 1)
  return (
    <div className="space-y-2">
      {entries.map(([key, value]) => (
        <div key={key} className="flex items-center gap-3">
          <span className="text-xs text-zinc-400 font-mono w-20 text-right capitalize">{key}</span>
          <div className="flex-1 bg-zinc-800 rounded-full h-5 overflow-hidden">
            <div className={`h-full rounded-full transition-all ${colors[key] ?? "bg-zinc-600"}`} style={{ width: `${(value / max) * 100}%` }} />
          </div>
          <span className="text-xs text-zinc-300 font-mono w-8">{value}</span>
        </div>
      ))}
    </div>
  )
}

function Sparkline({ data, label }: { data: Array<{ month: string; total: number }>; label: string }) {
  if (data.length === 0) return <p className="text-xs text-zinc-500">No data yet</p>
  const max = Math.max(...data.map((d) => d.total), 1)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return (
    <div className="space-y-2">
      <div className="flex items-end gap-1 h-24">
        {data.map((d) => (
          <div key={d.month} className="flex-1 flex flex-col items-center justify-end h-full">
            <div className="w-full bg-emerald-500/80 rounded-t-sm transition-all min-h-[2px]" style={{ height: `${(d.total / max) * 100}%` }} title={`${d.month}: ${label} ${d.total}`} />
          </div>
        ))}
      </div>
      <div className="flex gap-1">
        {data.map((d) => {
          const monthNum = parseInt(d.month.split("-")[1] ?? "0") - 1
          return <div key={d.month} className="flex-1 text-center"><span className="text-[9px] text-zinc-500">{months[monthNum] ?? d.month}</span></div>
        })}
      </div>
    </div>
  )
}

export function Analytics() {
  const { data, isLoading } = useAnalytics()

  if (isLoading) return <p className="text-sm text-zinc-500 font-mono">Loading analytics...</p>
  if (!data) return null

  const hasFindings = Object.values(data.severityCounts).some((v) => v > 0)
  const hasBounty = data.bountyByMonth.some((d) => d.total > 0)
  const hasAssets = data.assetsByMonth.some((d) => d.total > 0)

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card><CardHeader><CardTitle className="text-sm font-mono">Findings by Severity</CardTitle></CardHeader><CardContent>{hasFindings ? <BarChart data={data.severityCounts} colors={severityColors} /> : <p className="text-xs text-zinc-500">No findings recorded yet</p>}</CardContent></Card>
      <Card><CardHeader><CardTitle className="text-sm font-mono">Findings by Status</CardTitle></CardHeader><CardContent>{hasFindings ? <BarChart data={data.statusCounts} colors={statusColors} /> : <p className="text-xs text-zinc-500">No findings recorded yet</p>}</CardContent></Card>
      <Card><CardHeader><CardTitle className="text-sm font-mono">Bounty Earned (Last 6 Months)</CardTitle></CardHeader><CardContent>{hasBounty ? <Sparkline data={data.bountyByMonth} label="$" /> : <p className="text-xs text-zinc-500">No bounty earned yet</p>}</CardContent></Card>
      <Card><CardHeader><CardTitle className="text-sm font-mono">Assets Discovered (Last 6 Months)</CardTitle></CardHeader><CardContent>{hasAssets ? <Sparkline data={data.assetsByMonth} label="assets" /> : <p className="text-xs text-zinc-500">No assets discovered yet</p>}</CardContent></Card>
    </div>
  )
}
