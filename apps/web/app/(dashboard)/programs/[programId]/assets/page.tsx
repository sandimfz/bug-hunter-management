"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { AssetTable } from "@/components/dashboard/asset-table"
import { Pagination } from "@/components/dashboard/pagination"
import { useAssets } from "@/hooks/useAssets"
import { AddAssetDialog } from "@/components/dashboard/add-asset-dialog"
import Link from "next/link"

export default function ProgramAssetsPage() {
  const params = useParams<{ programId: string }>()
  const programId = params.programId
  const [offset, setOffset] = useState(0)
  const limit = 20
  const { assets, total, loading, error, refetch } = useAssets(Number(programId), offset, limit)
  const [showAdd, setShowAdd] = useState(false)

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
        <span className="text-zinc-300">Assets</span>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-zinc-500">
          Assets
        </p>
        <button
          onClick={() => setShowAdd(true)}
          className="rounded-md bg-emerald-500 px-4 py-2 text-xs font-mono font-bold text-zinc-950 hover:bg-emerald-400"
        >
          + Add Asset
        </button>
      </div>

      {error && <p className="text-sm text-red-400">Error: {error}</p>}

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-sm font-mono text-zinc-100">
            Asset List
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-zinc-500 font-mono">Loading assets...</p>
          ) : (
            <>
              <AssetTable assets={assets} programId={Number(programId)} />
              {total > limit && (
                <Pagination total={total} offset={offset} limit={limit} onChange={setOffset} />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {showAdd && (
        <AddAssetDialog
          programId={Number(programId)}
          onClose={() => setShowAdd(false)}
          onAdded={() => {
            refetch()
            setShowAdd(false)
          }}
        />
      )}
    </div>
  )
}
