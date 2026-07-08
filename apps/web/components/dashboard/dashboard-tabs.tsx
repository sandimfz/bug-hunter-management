"use client"

import { useState } from "react"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { usePrograms } from "@/hooks/usePrograms"
import { useFindings } from "@/hooks/useFindings"
import { useAssets } from "@/hooks/useAssets"
import Link from "next/link"

type Tab = "programs" | "findings" | "assets"

const severityColors: Record<string, string> = {
  critical: "border border-red-500/30 bg-red-500/15 text-red-400",
  high: "border border-orange-500/30 bg-orange-500/15 text-orange-400",
  medium: "border border-yellow-500/30 bg-yellow-500/15 text-yellow-400",
  low: "border border-blue-500/30 bg-blue-500/15 text-blue-400",
  info: "border border-zinc-500/30 bg-zinc-500/15 text-zinc-400",
}

const statusColors: Record<string, string> = {
  active: "border border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
  paused: "border border-yellow-500/30 bg-yellow-500/15 text-yellow-400",
  completed: "border border-zinc-500/30 bg-zinc-500/15 text-zinc-400",
  draft: "border border-zinc-500/30 bg-zinc-500/15 text-zinc-400",
  submitted: "border border-blue-500/30 bg-blue-500/15 text-blue-400",
  triaged: "border border-yellow-500/30 bg-yellow-500/15 text-yellow-400",
  accepted: "border border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
  rejected: "border border-red-500/30 bg-red-500/15 text-red-400",
  paid: "border border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
}

export function DashboardTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("programs")
  const { programs, loading: pLoading } = usePrograms(0, 5)
  const { findings, loading: fLoading } = useFindings(undefined, 0, 5)
  const { assets, loading: aLoading } = useAssets(undefined, 0, 5)
  const loading = pLoading || fLoading || aLoading

  const tabs: { value: Tab; label: string }[] = [
    { value: "programs", label: "Programs" },
    { value: "findings", label: "Findings" },
    { value: "assets", label: "Assets" },
  ]

  return (
    <div className="space-y-4">
      <div className="bg-zinc-900 border border-zinc-800 inline-flex rounded-md p-1">
        {tabs.map((tab) => (
          <button key={tab.value} onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 text-xs font-mono rounded-md transition-colors ${activeTab === tab.value ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-sm text-muted-foreground font-mono">Loading...</p>
          ) : (
            <>
              {activeTab === "programs" && (
                programs.length === 0 ? <p className="text-sm text-muted-foreground">No programs yet. Create your first program to start tracking.</p> : (
                  <div className="space-y-2">
                    {programs.map((p) => (
                      <Link key={p.uuid} href={`/programs/${p.uuid}`} className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-zinc-800/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-zinc-200 font-mono">{p.name}</span>
                          <span className="text-[10px] text-zinc-500 uppercase">{p.platform}</span>
                        </div>
                        <Badge variant="outline" className={`text-[10px] ${statusColors[p.status] ?? ""}`}>{p.status}</Badge>
                      </Link>
                    ))}
                    <Link href="/programs" className="block text-xs text-emerald-400 hover:underline pt-2">View all programs →</Link>
                  </div>
                )
              )}
              {activeTab === "findings" && (
                findings.length === 0 ? <p className="text-sm text-muted-foreground">No findings recorded yet.</p> : (
                  <div className="space-y-2">
                    {findings.map((f) => (
                      <div key={f.uuid} className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-zinc-800/40">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-zinc-200 font-mono">{f.title}</span>
                          <Badge variant="outline" className={`text-[10px] ${severityColors[f.severity] ?? ""}`}>{f.severity}</Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          {f.rewardAmount ? <span className="text-xs text-emerald-400 font-mono">${f.rewardAmount}</span> : null}
                          <Badge variant="outline" className={`text-[10px] ${statusColors[f.status] ?? ""}`}>{f.status}</Badge>
                        </div>
                      </div>
                    ))}
                    <Link href="/findings" className="block text-xs text-emerald-400 hover:underline pt-2">View all findings →</Link>
                  </div>
                )
              )}
              {activeTab === "assets" && (
                assets.length === 0 ? <p className="text-sm text-muted-foreground">No assets tracked yet. Add targets to your programs.</p> : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-zinc-800">
                          <th className="text-left text-xs uppercase tracking-widest text-zinc-500 py-2 px-3">Value</th>
                          <th className="text-left text-xs uppercase tracking-widest text-zinc-500 py-2 px-3">Type</th>
                          <th className="text-left text-xs uppercase tracking-widest text-zinc-500 py-2 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assets.map((a) => (
                          <tr key={a.uuid} className="border-b border-zinc-800 hover:bg-zinc-800/40">
                            <td className="py-2 px-3 text-sm text-zinc-200 font-mono">{a.value}</td>
                            <td className="py-2 px-3 text-xs text-zinc-500">{a.type}</td>
                            <td className="py-2 px-3"><Badge variant="outline" className={`text-[10px] ${statusColors[a.status] ?? ""}`}>{a.status}</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
