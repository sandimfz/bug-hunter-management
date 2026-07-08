"use client"

import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { StatCard } from "@/components/dashboard/stat-card"
import { useProgram, useProgramSnapshots } from "@/hooks/useProgram"
import Link from "next/link"

const statusColors: Record<string, string> = {
  active: "border border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
  paused: "border border-yellow-500/30 bg-yellow-500/15 text-yellow-400",
  completed: "border border-zinc-500/30 bg-zinc-500/15 text-zinc-400",
}

export default function ProgramDetailPage() {
  const params = useParams<{ programId: string }>()
  const programUuid = params.programId

  const { data: program, isLoading, error } = useProgram(programUuid)
  const { data: snapshots = [] } = useProgramSnapshots(programUuid)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground font-mono">Loading program...</p>
      </div>
    )
  }

  if (error || !program) {
    return (
      <div className="space-y-6">
        <p className="text-sm text-destructive">Error: {error?.message ?? "Program not found"}</p>
        <Link href="/programs" className="text-sm text-emerald-400 hover:underline">
          ← Back to Programs
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/programs" className="hover:text-foreground">Programs</Link>
        <span>/</span>
        <span className="text-foreground">{program.name}</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-mono font-bold text-foreground">{program.name}</h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <Badge variant="outline" className={`text-[10px] ${statusColors[program.status] ?? ""}`}>
              {program.status}
            </Badge>
            <span className="uppercase text-xs">{program.platform}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1"}/reports/program/${programUuid}/markdown`}
            download
            className="rounded-md border border-zinc-700 px-4 py-2 text-xs font-mono text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
          >
            Export Report
          </a>
          <Link
            href={`/programs/${programUuid}/assets`}
            className="rounded-md bg-emerald-500 px-4 py-2 text-xs font-mono font-bold text-zinc-950 hover:bg-emerald-400"
          >
            View Assets
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Assets" value="0" sub="tracked targets" />
        <StatCard label="Findings" value="0" sub="vulnerabilities" />
        <StatCard label="Bounty" value="$0" sub="earned" accent="text-emerald-400" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-mono">Scope Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-200 whitespace-pre-wrap">
            {program.scopeNotes || "No scope notes added yet."}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-mono">Scan History</CardTitle>
        </CardHeader>
        <CardContent>
          {snapshots.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No scans yet. Run a recon scan from the Endpoints page.
            </p>
          ) : (
            <div className="space-y-3">
              {snapshots.map((snap) => (
                <div key={snap.id} className="rounded-md border border-border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-400 font-mono">
                      {new Date(snap.scanDate).toLocaleString()}
                    </span>
                    <div className="flex items-center gap-2">
                      {snap.newAssets > 0 && (
                        <Badge variant="outline" className="text-[10px] border border-emerald-500/30 bg-emerald-500/15 text-emerald-400">
                          +{snap.newAssets} new
                        </Badge>
                      )}
                      {snap.removedAssets > 0 && (
                        <Badge variant="outline" className="text-[10px] border border-red-500/30 bg-red-500/15 text-red-400">
                          -{snap.removedAssets} removed
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">{snap.totalAssets} total</span>
                    </div>
                  </div>
                  {snap.newValues && snap.newValues.length > 0 && (
                    <div className="mt-1">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">New assets:</p>
                      <div className="flex flex-wrap gap-1">
                        {snap.newValues.slice(0, 10).map((v) => (
                          <span key={v} className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                            {v}
                          </span>
                        ))}
                        {snap.newValues.length > 10 && (
                          <span className="text-xs text-muted-foreground">+{snap.newValues.length - 10} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
