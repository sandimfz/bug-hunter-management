"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { ProgramCard } from "@/components/dashboard/program-card"
import { Pagination } from "@/components/dashboard/pagination"
import { usePrograms } from "@/hooks/usePrograms"
import Link from "next/link"

export default function ProgramsPage() {
  const [offset, setOffset] = useState(0)
  const limit = 9
  const { programs, total, loading, error } = usePrograms(offset, limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-zinc-500">
          Programs
        </p>
        <Link
          href="/programs/new"
          className="rounded-md bg-emerald-500 px-4 py-2 text-xs font-mono font-bold text-zinc-950 hover:bg-emerald-400"
        >
          + New Program
        </Link>
      </div>

      {error && (
        <p className="text-sm text-red-400">Error: {error}</p>
      )}

      {loading ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <p className="text-sm text-zinc-500 font-mono">Loading programs...</p>
          </CardContent>
        </Card>
      ) : programs.length === 0 ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-sm font-mono text-zinc-100">
              All Programs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-500">
              No programs yet. Create your first program to start tracking targets.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => (
              <ProgramCard
                key={program.uuid}
                id={program.id}
                uuid={program.uuid}
                name={program.name}
                platform={program.platform}
                status={program.status as "active" | "paused" | "completed"}
              />
            ))}
          </div>
          <Pagination total={total} offset={offset} limit={limit} onChange={setOffset} />
        </>
      )}
    </div>
  )
}
