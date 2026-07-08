import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import Link from "next/link"

interface ProgramCardProps {
  id: number
  uuid: string
  name: string
  platform: string
  status: "active" | "paused" | "completed"
  assetCount?: number
  findingCount?: number
}

export function ProgramCard({
  id,
  uuid,
  name,
  platform,
  status,
  assetCount = 0,
  findingCount = 0,
}: ProgramCardProps) {
  const statusColors = {
    active: "border border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
    paused: "border border-yellow-500/30 bg-yellow-500/15 text-yellow-400",
    completed: "border border-zinc-500/30 bg-zinc-500/15 text-zinc-400",
  }

  return (
    <Link href={`/programs/${uuid}`}>
      <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800/40 transition-colors cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-mono text-zinc-100">
              {name}
            </CardTitle>
            <Badge variant="outline" className={`text-[10px] ${statusColors[status]}`}>
              {status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span className="uppercase">{platform}</span>
            <span>{assetCount} assets</span>
            <span>{findingCount} findings</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
