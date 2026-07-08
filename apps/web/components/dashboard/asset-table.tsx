"use client"

import { Badge } from "@workspace/ui/components/badge"
import { useRouter } from "next/navigation"

interface Asset {
  id: number
  uuid: string
  programId?: number
  type: string
  value: string
  status: string
  tags?: string[] | null
}

interface AssetTableProps {
  assets: Asset[]
  /** When set, rows link to /programs/programId/assets/assetId */
  programId?: number
}

const statusColors: Record<string, string> = {
  active: "border border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
  dead: "border border-red-500/30 bg-red-500/15 text-red-400",
  unchecked: "border border-zinc-500/30 bg-zinc-500/15 text-zinc-400",
  flagged: "border border-yellow-500/30 bg-yellow-500/15 text-yellow-400",
}

export function AssetTable({ assets, programId }: AssetTableProps) {
  const router = useRouter()

  if (assets.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No assets added yet.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="text-left text-xs uppercase tracking-widest text-zinc-500 py-3 px-4">Value</th>
            <th className="text-left text-xs uppercase tracking-widest text-zinc-500 py-3 px-4">Type</th>
            <th className="text-left text-xs uppercase tracking-widest text-zinc-500 py-3 px-4">Status</th>
            <th className="text-left text-xs uppercase tracking-widest text-zinc-500 py-3 px-4">Tags</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => {
            const pid = programId ?? asset.programId
            const href = pid ? `/programs/${pid}/assets/${asset.uuid}` : undefined

            return (
              <tr
                key={asset.id}
                onClick={href ? () => router.push(href) : undefined}
                className={`border-b border-zinc-800 hover:bg-zinc-800/40 transition-colors ${
                  href ? "cursor-pointer" : ""
                } ${asset.status === "flagged" ? "bg-yellow-500/5" : ""}`}
              >
                <td className="py-3 px-4 text-sm text-zinc-200 font-mono">{asset.value}</td>
                <td className="py-3 px-4 text-sm text-zinc-500">{asset.type}</td>
                <td className="py-3 px-4">
                  <Badge variant="outline" className={`text-[10px] ${statusColors[asset.status] ?? ""}`}>
                    {asset.status}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-1">
                    {(asset.tags ?? []).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[10px] border border-zinc-700 bg-zinc-800 text-zinc-400">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
