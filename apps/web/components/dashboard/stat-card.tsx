import { Card, CardContent } from "@workspace/ui/components/card"

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  accent?: string
}

export function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="pt-5 pb-4">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">
          {label}
        </p>
        <p className={`text-3xl font-mono font-bold ${accent ?? "text-white"}`}>
          {value}
        </p>
        {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  )
}
