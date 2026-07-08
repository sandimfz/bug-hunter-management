"use client"

import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { useFindings } from "@/hooks/useFindings"
import Link from "next/link"

const severityColors: Record<string, string> = {
  critical: "border border-red-500/30 bg-red-500/15 text-red-400",
  high: "border border-orange-500/30 bg-orange-500/15 text-orange-400",
  medium: "border border-yellow-500/30 bg-yellow-500/15 text-yellow-400",
  low: "border border-blue-500/30 bg-blue-500/15 text-blue-400",
  info: "border border-zinc-500/30 bg-zinc-500/15 text-zinc-400",
}

const statusColors: Record<string, string> = {
  draft: "border border-zinc-500/30 bg-zinc-500/15 text-zinc-400",
  submitted: "border border-blue-500/30 bg-blue-500/15 text-blue-400",
  triaged: "border border-yellow-500/30 bg-yellow-500/15 text-yellow-400",
  accepted: "border border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
  rejected: "border border-red-500/30 bg-red-500/15 text-red-400",
  paid: "border border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
}

export default function ProgramFindingsPage() {
  const params = useParams<{ programId: string }>()
  const programId = params.programId
  const { findings, loading, error } = useFindings()

  // Filter findings for this program's assets (client-side for now)
  // In a real app, the API would support filtering by programId
  const programFindings = findings

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <Link href="/programs" className="hover:text-zinc-300">
          Programs
        </Link>
        <span>/</span>
        <Link href={`/programs/${programId}`} className="hover:text-zinc-300">
          #{programId}
        </Link>
        <span>/</span>
        <span className="text-zinc-300">Findings</span>
      </div>

      <p className="text-xs uppercase tracking-widest text-zinc-500">
        Findings
      </p>

      {error && <p className="text-sm text-red-400">Error: {error}</p>}

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-sm font-mono text-zinc-100">
            Vulnerability Findings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-zinc-500 font-mono">Loading findings...</p>
          ) : programFindings.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No findings recorded yet. Create findings from the asset detail page.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left text-xs uppercase tracking-widest text-zinc-500 py-3 px-4">Title</th>
                    <th className="text-left text-xs uppercase tracking-widest text-zinc-500 py-3 px-4">Severity</th>
                    <th className="text-left text-xs uppercase tracking-widest text-zinc-500 py-3 px-4">Status</th>
                    <th className="text-left text-xs uppercase tracking-widest text-zinc-500 py-3 px-4">Reward</th>
                  </tr>
                </thead>
                <tbody>
                  {programFindings.map((finding) => (
                    <tr key={finding.id} className="border-b border-zinc-800 hover:bg-zinc-800/40">
                      <td className="py-3 px-4 text-sm text-zinc-200 font-mono">{finding.title}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={`text-[10px] ${severityColors[finding.severity] ?? ""}`}>
                          {finding.severity}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={`text-[10px] ${statusColors[finding.status] ?? ""}`}>
                          {finding.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-emerald-400 font-mono">
                        ${finding.rewardAmount ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
